import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createAdminToken, setAdminCookie } from "../../lib/admin-session";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed." });
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const expectedEmail = process.env.PAK_TIJARAT_ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.PAK_TIJARAT_ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword || !process.env.PAK_TIJARAT_SESSION_SECRET) {
    return res.status(503).json({ ok: false, error: "Secure admin login is not configured on the server yet." });
  }
  if (email !== expectedEmail || password !== expectedPassword) {
    return res.status(401).json({ ok: false, error: "Invalid administrator email or password." });
  }
  try {
    setAdminCookie(res, createAdminToken(expectedEmail));
    return res.status(200).json({ ok: true, user: { email: expectedEmail, role: "Admin" } });
  } catch {
    return res.status(503).json({ ok: false, error: "Secure admin session could not be created." });
  }
}
