import type { IncomingMessage, ServerResponse } from "node:http";
import { clearAdminCookie } from "../../admin-session";
function json(res: ServerResponse, status: number, body: unknown) { res.statusCode=status; res.setHeader("Content-Type","application/json; charset=utf-8"); res.end(JSON.stringify(body)); }
export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return json(res,405,{ok:false});
  clearAdminCookie(res);
  return json(res,200,{ok:true});
}
