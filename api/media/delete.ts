import type { IncomingMessage, ServerResponse } from "node:http";
import { getDatabase } from "../../lib/mongodb-server";
import { requireAdmin } from "../../lib/admin-session";
import { deleteR2Object } from "../../lib/r2-server";
type Request = IncomingMessage & { body?: any };
function json(res:ServerResponse,status:number,body:unknown){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.end(JSON.stringify(body));}
export default async function handler(req:Request,res:ServerResponse){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST")return json(res,405,{ok:false,error:"Method not allowed."});
  if(!requireAdmin(req,res))return;
  const key=String(req.body?.key||"");
  const id=String(req.body?.id||"").slice(0,150);
  if(!key||key.length>500||key.startsWith("/")||key.split("/").some(part=>part==="..")||!/^[a-zA-Z0-9_./-]+$/.test(key))return json(res,400,{ok:false,error:"Invalid media key."});
  try{
    await deleteR2Object(key);
    const db=await getDatabase();
    await db.collection("media").deleteOne({key});
    await db.collection("cms_media").deleteOne(id ? {id} : {path:key});
    return json(res,200,{ok:true});
  }catch(error){
    console.error("R2 media delete error:",error instanceof Error?error.message:"unknown");
    return json(res,502,{ok:false,error:"Could not delete media from R2."});
  }
}
