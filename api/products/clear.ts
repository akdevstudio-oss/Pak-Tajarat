import type { IncomingMessage, ServerResponse } from "node:http";
import { getDatabase } from "../../lib/mongodb-server";
import { requireAdmin } from "../../lib/admin-session";
function json(res: ServerResponse, status: number, body: unknown) { res.statusCode=status; res.setHeader("Content-Type","application/json; charset=utf-8"); res.end(JSON.stringify(body)); }
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST") return json(res,405,{ok:false,error:"Method not allowed."});
  if(!requireAdmin(req,res)) return;
  try {
    const result=await (await getDatabase()).collection("products").deleteMany({});
    return json(res,200,{ok:true,deletedCount:result.deletedCount});
  } catch(error) {
    console.error("Clear products API error:",error instanceof Error?error.message:"unknown");
    return json(res,500,{ok:false,error:"Could not clear the product catalog."});
  }
}
