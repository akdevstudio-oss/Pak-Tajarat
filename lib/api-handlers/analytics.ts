import type { IncomingMessage,ServerResponse } from "node:http";
import { getDatabase } from "../mongodb-server.js";
import { requireAdmin } from "../admin-session.js";
type Req=IncomingMessage&{body?:any};
function json(res:ServerResponse,status:number,data:unknown){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(data));}
const clean=(v:any,max=160)=>String(v??"").slice(0,max);
export default async function handler(req:Req,res:ServerResponse){
 if(req.method==="GET"){
  if(!requireAdmin(req,res))return;
  try{
   const db=await getDatabase();
   const [visitors,events,sessions]=await Promise.all([
    db.collection("liveVisitors").find({},{projection:{_id:0}}).sort({lastActiveMs:-1}).limit(500).toArray(),
    db.collection("liveEvents").find({},{projection:{_id:0}}).sort({timestampMs:-1}).limit(50).toArray(),
    db.collection("trafficSessions").find({},{projection:{_id:0}}).sort({timestamp:-1}).limit(5000).toArray()
   ]);
   const cutoff=Date.now()-5*60*1000;
   return json(res,200,{ok:true,visitors:visitors.filter(v=>Number(v.lastActiveMs||0)>=cutoff),events,sessions});
  }catch(error){console.error("Analytics read API:",error instanceof Error?error.message:"unknown");return json(res,503,{ok:false,error:"Analytics storage is temporarily unavailable."});}
 }
 if(req.method!=="POST")return json(res,405,{ok:false,error:"Method not allowed."});
 try{const body=req.body||{};const db=await getDatabase();
 if(body.kind==="heartbeat"&&body.visitor&&body.session){const v=body.visitor,s=body.session,id=clean(v.sessionId,120);if(!id)return json(res,400,{ok:false,error:"Invalid session."});
 const visitor={id,visitorId:clean(v.visitorId,120),sessionId:id,currentView:clean(v.currentView,120),deviceType:["mobile","desktop","tablet"].includes(v.deviceType)?v.deviceType:"desktop",browser:clean(v.browser,80),os:clean(v.os,80),city:"Unknown",country:"Unknown",referrer:clean(v.referrer,180),lastActive:new Date().toISOString(),lastActiveMs:Date.now(),active:true,userId:"guest",userName:"Guest Customer",userRole:"Guest",screenResolution:clean(v.screenResolution,40)};
 await db.collection("liveVisitors").replaceOne({id},visitor,{upsert:true});await db.collection("trafficSessions").updateOne({id},{$set:{...s,id,uid:"guest",city:"Unknown",country:"Unknown",updatedAt:new Date().toISOString()}},{upsert:true});return json(res,200,{ok:true});}
 if(body.kind==="event"&&body.event){const e=body.event,id=clean(e.id,120);if(!id)return json(res,400,{ok:false,error:"Invalid event."});
 const event={id,sessionId:clean(e.sessionId,120),visitorId:clean(e.visitorId,120),eventType:clean(e.eventType,40),target:clean(e.target,150),view:clean(e.view,120),timestamp:new Date().toISOString(),timestampMs:Date.now(),deviceType:["mobile","desktop","tablet"].includes(e.deviceType)?e.deviceType:"desktop",browser:clean(e.browser,80),city:"Unknown",userName:"Guest Customer",userId:"guest",extra:{}};
 await db.collection("liveEvents").updateOne({id},{$setOnInsert:event},{upsert:true});return json(res,200,{ok:true});}
 return json(res,400,{ok:false,error:"Unsupported analytics event."});
 }catch(error){console.error("Analytics API:",error instanceof Error?error.message:"unknown");return json(res,503,{ok:false,error:"Analytics storage is temporarily unavailable."});}
}
