import type { IncomingMessage, ServerResponse } from "node:http";
import { checkR2Bucket } from "../../r2-server";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, message: "Method not allowed." }));
    return;
  }
  try {
    await checkR2Bucket();
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, message: "Cloudflare R2 bucket connection successful." }));
  } catch (error) {
    const e = error as Error & { status?: number; missing?: string[] };
    console.error("R2 health check failed:", e.message);
    res.statusCode = e.status || 502;
    res.end(JSON.stringify({
      ok: false,
      message: e.message || "Unable to reach Cloudflare R2.",
      ...(e.missing ? { missing: e.missing } : {}),
    }));
  }
}
