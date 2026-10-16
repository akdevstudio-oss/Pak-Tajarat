import type { IncomingMessage, ServerResponse } from "node:http";
import { getDatabase } from "../../mongodb-server";
import { requireAdmin } from "../../admin-session";
type Request = IncomingMessage & { body?: any };
function json(res: ServerResponse, status: number, body: unknown) { res.statusCode=status; res.setHeader("Content-Type","application/json; charset=utf-8"); res.end(JSON.stringify(body)); }
export default async function handler(req: Request, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const products = (await getDatabase()).collection("products");
    if (req.method === "GET") {
      const items = await products.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(500).toArray();
      return json(res,200,{ok:true,products:items});
    }
    if (req.method === "POST") {
      const session = requireAdmin(req,res);
      if (!session) return;
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const name = String(body.name || "").trim();
      if (!name) return json(res,400,{ok:false,error:"Product name is required."});
      const id = String(body.id || `p-${Date.now()}-${Math.random().toString(36).slice(2,8)}`).slice(0,100);
      const document = { ...body, id, name, updatedAt:new Date().toISOString(), createdAt:body.createdAt || new Date().toISOString() };
      delete (document as any)._id;
      await products.replaceOne({id},document,{upsert:true});
      return json(res,200,{ok:true,product:document});
    }
    res.setHeader("Allow","GET, POST");
    return json(res,405,{ok:false,error:"Method not allowed."});
  } catch (error) {
    console.error("Products API error:", error instanceof Error ? error.message : "unknown");
    return json(res,500,{ok:false,error:"Product service is temporarily unavailable."});
  }
}
