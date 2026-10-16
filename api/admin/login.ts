import type { IncomingMessage, ServerResponse } from "node:http";
import { createAdminToken, setAdminCookie } from "../../lib/admin-session";
type Request = IncomingMessage & { body?: any };
function json(res: ServerResponse, status: number, body: unknown) { res.statusCode=status; res.setHeader("Content-Type","application/json; charset=utf-8"); res.end(JSON.stringify(body)); }
export default function handler(req: Request, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return json(res,405,{ok:false,error:"Method not allowed."});
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const expectedEmail = process.env.PAK_TIJARAT_ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.PAK_TIJARAT_ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword || !process.env.PAK_TIJARAT_SESSION_SECRET) return json(res,503,{ok:false,error:"Secure admin login is not configured on the server yet."});
  if (email !== expectedEmail || password !== expectedPassword) return json(res,401,{ok:false,error:"Invalid administrator email or password."});
  try {
    setAdminCookie(res, createAdminToken(expectedEmail));
    return json(res,200,{ok:true,user:{email:expectedEmail,role:"Admin"}});
  } catch { return json(res,503,{ok:false,error:"Secure admin session could not be created."}); }
}
