import type { VercelRequest, VercelResponse } from "@vercel/node";
import { clearAdminCookie } from "../../lib/admin-session";
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  clearAdminCookie(res);
  return res.status(200).json({ ok: true });
}
