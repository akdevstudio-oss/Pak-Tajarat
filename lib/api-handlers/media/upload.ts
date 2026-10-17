import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { getDatabase } from "../../mongodb-server.js";
import { requireAdmin } from "../../admin-session.js";
import { getR2UsageBytes, putR2Object } from "../../r2-server.js";

export const config = { api: { bodyParser: false } };
const MAX_STORAGE_BYTES = 8 * 1024 * 1024 * 1024;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 4 * 1024 * 1024;
const INPUT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_FILE_BYTES) throw Object.assign(new Error("Each original image must be 4 MB or smaller."), { status: 413 });
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

async function optimizeToWebp(input: Buffer): Promise<Buffer> {
  try {
    const image = sharp(input, { limitInputPixels: 40_000_000, animated: false });
    const metadata = await image.metadata();
    if (!metadata.format || !["jpeg", "png", "webp", "avif", "gif"].includes(metadata.format)) {
      throw Object.assign(new Error("Unsupported image content. Please upload a JPEG, PNG, WebP, AVIF, or GIF image."), { status: 415 });
    }
    if (!metadata.width || !metadata.height) {
      throw Object.assign(new Error("The uploaded image could not be read. Please choose another image."), { status: 400 });
    }
    const output = await image
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    if (!output.length) throw Object.assign(new Error("Image conversion returned an empty file."), { status: 422 });
    if (output.length > MAX_OUTPUT_BYTES) {
      throw Object.assign(new Error("The optimized image is still too large. Please upload a smaller image."), { status: 413 });
    }
    return output;
  } catch (error) {
    const e = error as Error & { status?: number };
    if (e.status) throw e;
    throw Object.assign(new Error("This image is damaged or uses an unsupported format. Please try another image."), { status: 400 });
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "POST") { res.statusCode=405; res.end(JSON.stringify({ok:false,error:"Method not allowed."})); return; }
  if (!requireAdmin(req,res)) return;
  const contentType = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  if (!INPUT_TYPES.has(contentType)) { res.statusCode=415; res.end(JSON.stringify({ok:false,error:"Only JPEG, PNG, WebP, AVIF and GIF images are allowed."})); return; }
  let lockId = false;
  let lockToken = "";
  try {
    const originalBytes = await readBody(req);
    if (!originalBytes.length) { res.statusCode=400; res.end(JSON.stringify({ok:false,error:"Image file is empty."})); return; }
    const bytes = await optimizeToWebp(originalBytes);
    const db = await getDatabase();
    const locks = db.collection<{ _id: string; locked?: boolean; lockedAt?: Date; lockToken?: string }>("r2_upload_locks");
    await locks.updateOne({_id:"bucket-upload-lock"}, {$setOnInsert:{locked:false}}, {upsert:true});
    const staleBefore = new Date(Date.now() - 120000);
    lockToken = randomUUID();
    const lock = await locks.findOneAndUpdate({_id:"bucket-upload-lock", $or:[{locked:{$ne:true}},{lockedAt:{$lt:staleBefore}}]}, {$set:{locked:true, lockedAt:new Date(), lockToken}}, {returnDocument:"after"});
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
    const key = folder + "/" + Date.now() + "-" + randomUUID() + ".webp";
    await putR2Object(key, bytes, "image/webp");
    await db.collection("media").insertOne({key, contentType:"image/webp", sizeBytes:bytes.length, originalSizeBytes:originalBytes.length, uploadedAt:new Date().toISOString(), uploadedBy:"admin"});
    res.statusCode=201;
    res.end(JSON.stringify({ok:true,key,url:"/api/media-object?key="+encodeURIComponent(key),contentType:"image/webp",sizeBytes:bytes.length,originalSizeBytes:originalBytes.length,usedBytes:usedBytes+bytes.length,limitBytes:MAX_STORAGE_BYTES}));
  } catch (error) {
    const e = error as Error & {status?:number};
    console.error("R2 upload error:", e.message);
    res.statusCode=e.status || 502;
    res.end(JSON.stringify({ok:false,error:e.status ? e.message : "Image upload failed. Check the R2 and MongoDB connection, then try again."}));
  } finally {
    if (lockId) {
      try { await (await getDatabase()).collection<{ _id: string; locked?: boolean; lockedAt?: Date; lockToken?: string }>("r2_upload_locks").updateOne({_id:"bucket-upload-lock", lockToken}, {$set:{locked:false}, $unset:{lockedAt:"", lockToken:""}}); } catch {}
    }
  }
}
