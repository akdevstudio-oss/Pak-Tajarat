import type { IncomingMessage, ServerResponse } from "node:http";
import { getDatabase } from "../../mongodb-server.js";
import { requireAdmin } from "../../admin-session.js";
type Request = IncomingMessage & { body?: any; query?: Record<string,string|string[]|undefined> };
const COLLECTIONS: Record<string,string> = { branding:"cms_branding", blogs:"blogs", worker_accounts:"worker_accounts", media:"cms_media", coupons:"coupons" };
function json(res:ServerResponse,status:number,body:unknown){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.end(JSON.stringify(body));}
function param(value:string|string[]|undefined){return String(Array.isArray(value)?value[0]:value||"");}
export default async function handler(req:Request,res:ServerResponse){
  res.setHeader("Cache-Control","no-store");
  const raw=req.query?.collection;
  const route=param(raw);
  const collectionName=COLLECTIONS[route];
  if(!collectionName)return json(res,404,{ok:false,error:"CMS collection not found."});
  const id=param(req.query?.id).slice(0,150);
  if(req.method==="GET"&&route==="worker_accounts"&&!requireAdmin(req,res))return;
  if(req.method!=="GET"&&!requireAdmin(req,res))return;
  try{
    const collection=(await getDatabase()).collection(collectionName);
    if(req.method==="GET"){
      if(id){const filter=route==="coupons"?{code:id.toUpperCase()}:{id};const doc=await collection.findOne(filter,{projection:{_id:0}});return json(res,doc?200:404,{ok:!!doc,item:doc});}
      const items=await collection.find({}, {projection:{_id:0}}).limit(1000).toArray();
      return json(res,200,{ok:true,items});
    }
    if(req.method==="DELETE"){
      if(!id)return json(res,400,{ok:false,error:"Document ID required."});
      const filter=route==="coupons"?{code:id.toUpperCase()}:{id};const result=await collection.deleteOne(filter);return json(res,result.deletedCount?200:404,{ok:!!result.deletedCount});
    }
    if(req.method==="POST"||req.method==="PUT"||req.method==="PATCH"){
      const body=req.body&&typeof req.body==="object"?req.body:{};
      const docId=String(body.id||id||(route==="coupons"?body.code:"")).slice(0,150);
      if(!docId)return json(res,400,{ok:false,error:"Document ID required."});
      const document={...body,id:docId,updatedAt:new Date().toISOString()};delete (document as any)._id;
      if(req.method==="PATCH"){
        const filter=route==="coupons"?{code:docId.toUpperCase()}:{id:docId};
        const existing=await collection.findOne(filter);
        await collection.replaceOne(filter,{...(existing||{}),...document,id:docId},{upsert:true});
      }else { const filter=route==="coupons"?{code:String(document.code||docId).toUpperCase()}:{id:docId}; await collection.replaceOne(filter,{...document},{upsert:true}); }
      return json(res,200,{ok:true,item:document});
    }
    res.setHeader("Allow","GET, POST, PUT, PATCH, DELETE");return json(res,405,{ok:false,error:"Method not allowed."});
  }catch(error){console.error("CMS API error:",error instanceof Error?error.message:"unknown");return json(res,500,{ok:false,error:"CMS service is temporarily unavailable."});}
}
