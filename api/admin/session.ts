import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminSession } from "../../lib/admin-session";
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return res.status(405).json({ ok: false });
  const session = getAdminSession(req);
  if (!session) return res.status(401).json({ ok: false, authenticated: false });
  return res.status(200).json({ ok: true, authenticated: true, user: { email: session.email, role: session.role } });
}
