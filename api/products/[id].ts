import type { IncomingMessage, ServerResponse } from "node:http";
import { getDatabase } from "../../lib/mongodb-server";
import { requireAdmin } from "../../lib/admin-session";
type Request = IncomingMessage & { body?: any; query?: Record<string,string|string[]|undefined> };
function json(res: ServerResponse, status: number, body: unknown) { res.statusCode=status; res.setHeader("Content-Type","application/json; charset=utf-8"); res.end(JSON.stringify(body)); }
export default async function handler(req: Request, res: ServerResponse) {
  res.setHeader("Cache-Control","no-store");
  if (!requireAdmin(req,res)) return;
  const rawId=req.query?.id;
  const id=String(Array.isArray(rawId)?rawId[0]:rawId||"").slice(0,100);
  if (!id) return json(res,400,{ok:false,error:"Product ID is required."});
  try {
    const products=(await getDatabase()).collection("products");
    if(req.method==="DELETE"){const result=await products.deleteOne({id});return json(res,result.deletedCount?200:404,{ok:!!result.deletedCount});}
    if(req.method==="PATCH"||req.method==="PUT"){
      const body=req.body&&typeof req.body==="object"?req.body:{};
      const document={...body,id,updatedAt:new Date().toISOString()}; delete (document as any)._id;
      await products.replaceOne({id},document,{upsert:true});
      return json(res,200,{ok:true,product:document});
    }
    res.setHeader("Allow","PUT, PATCH, DELETE");
    return json(res,405,{ok:false,error:"Method not allowed."});
  } catch(error) {
    console.error("Product item API error:",error instanceof Error?error.message:"unknown");
    return json(res,500,{ok:false,error:"Product service is temporarily unavailable."});
  }
}
