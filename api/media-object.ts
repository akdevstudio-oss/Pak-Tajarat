import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getR2Object } from "../lib/r2-server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "HEAD") return res.status(405).end();
  const key = String(req.query.key || "");
  if (!key || key.length > 500 || key.startsWith("/") || key.split("/").some(part => part === "..") || !/^[a-zA-Z0-9_./-]+$/.test(key)) {
    return res.status(400).json({ok:false,error:"Invalid media key."});
  }
  try {
    const object = await getR2Object(key);
    res.setHeader("Content-Type", object.contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Length", String(object.bytes.length));
    if (req.method === "HEAD") return res.status(200).end();
    return res.status(200).send(Buffer.from(object.bytes));
  } catch (error) {
    const e = error as Error & {status?:number};
    return res.status(e.status === 404 ? 404 : 502).json({ok:false,error:e.status === 404 ? "Media not found." : "Media service is temporarily unavailable."});
  }
}
