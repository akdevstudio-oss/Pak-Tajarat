import type { IncomingMessage, ServerResponse } from "node:http";
import { getAdminSession } from "../../admin-session.js";
function json(res: ServerResponse, status: number, body: unknown) { res.statusCode=status; res.setHeader("Content-Type","application/json; charset=utf-8"); res.end(JSON.stringify(body)); }
export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") return json(res,405,{ok:false});
  const session = getAdminSession(req);
  if (!session) return json(res,401,{ok:false,authenticated:false});
  return json(res,200,{ok:true,authenticated:true,user:{email:session.email,role:session.role}});
}
