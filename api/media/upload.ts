import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { getDatabase } from "../../lib/mongodb-server";
import { requireAdmin } from "../../lib/admin-session";
import { getR2UsageBytes, putR2Object } from "../../lib/r2-server";

export const config = { api: { bodyParser: false } };
const MAX_STORAGE_BYTES = 8 * 1024 * 1024 * 1024;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const TYPES: Record<string,string> = { "image/jpeg":"jpg", "image/png":"png", "image/webp":"webp", "image/avif":"avif", "image/gif":"gif" };

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_FILE_BYTES) throw Object.assign(new Error("Each image must be 4 MB or smaller."), { status: 413 });
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") { res.statusCode=405; res.end(JSON.stringify({ok:false,error:"Method not allowed."})); return; }
  if (!requireAdmin(req,res)) return;
  const contentType = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  if (!TYPES[contentType]) { res.statusCode=415; res.end(JSON.stringify({ok:false,error:"Only JPEG, PNG, WebP, AVIF and GIF images are allowed."})); return; }
  let lockId = false;
  try {
    const bytes = await readBody(req);
    if (!bytes.length) { res.statusCode=400; res.end(JSON.stringify({ok:false,error:"Image file is empty."})); return; }
    const db = await getDatabase();
    const locks = db.collection<{ _id: string; locked?: boolean; lockedAt?: Date }>("r2_upload_locks");
    await locks.updateOne({_id:"bucket-upload-lock"}, {$setOnInsert:{locked:false}}, {upsert:true});
    const lock = await locks.findOneAndUpdate({_id:"bucket-upload-lock", locked:{$ne:true}}, {$set:{locked:true, lockedAt:new Date()}}, {returnDocument:"after"});
    if (!lock) { res.statusCode=429; res.end(JSON.stringify({ok:false,error:"Another upload is in progress. Please try again shortly."})); return; }
    lockId = true;
    const usedBytes = await getR2UsageBytes();
    if (usedBytes + bytes.length > MAX_STORAGE_BYTES) {
      res.statusCode=413;
      res.end(JSON.stringify({ok:false,error:"R2 storage limit reached (8 GB). Delete old media before uploading more.",usedBytes,limitBytes:MAX_STORAGE_BYTES}));
      return;
    }
    const requestedFolder = String(req.headers["x-media-folder"] || "products").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
    const allowedFolders = new Set(["branding","banners","categories","products","blog","general"]);
    const folder = allowedFolders.has(requestedFolder) ? requestedFolder : "general";
    const key = folder + "/" + Date.now() + "-" + randomUUID() + "." + TYPES[contentType];
    await putR2Object(key, bytes, contentType);
    await db.collection("media").insertOne({key, contentType, sizeBytes:bytes.length, uploadedAt:new Date().toISOString(), uploadedBy:"admin"});
    res.statusCode=201;
    res.end(JSON.stringify({ok:true,key,url:"/api/media-object?key="+encodeURIComponent(key),sizeBytes:bytes.length,usedBytes:usedBytes+bytes.length,limitBytes:MAX_STORAGE_BYTES}));
  } catch (error) {
    const e = error as Error & {status?:number};
    console.error("R2 upload error:", e.message);
    res.statusCode=e.status || 502;
    res.end(JSON.stringify({ok:false,error:e.status===413 ? e.message : "Image upload failed. Check the R2 and MongoDB connection, then try again."}));
  } finally {
    if (lockId) {
      try { await (await getDatabase()).collection<{ _id: string; locked?: boolean; lockedAt?: Date }>("r2_upload_locks").updateOne({_id:"bucket-upload-lock"}, {$set:{locked:false}, $unset:{lockedAt:""}}); } catch {}
    }
  }
}
