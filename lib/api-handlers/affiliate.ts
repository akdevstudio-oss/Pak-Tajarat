import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { getDatabase } from "../mongodb-server.js";
import { getAdminSession, requireAdmin } from "../admin-session.js";
import { readUserSession } from "../user-session.js";
type Req=IncomingMessage&{body?:any;query?:Record<string,string|string[]|undefined>};
function json(res:ServerResponse,status:number,body:unknown){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(body));}
const date=()=>new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
export default async function handler(req:Req,res:ServerResponse){
 const db=await getDatabase(), admin=getAdminSession(req), user=readUserSession(req);
 const body=req.body&&typeof req.body==="object"?req.body:{};
 if(req.method==="GET"){
  if(!admin&&!user)return json(res,401,{ok:false,error:"Please sign in to view affiliate information."});
  const uid=user?.id||"";
  const [affiliate,application,referrals,withdrawals,allAffiliates,allApplications,allWithdrawals,allReferrals,config]=await Promise.all([
   uid?db.collection("affiliates").findOne({id:uid},{projection:{_id:0}}):null,
   uid?db.collection("affiliateApplications").findOne({uid},{projection:{_id:0}}):null,
   uid?db.collection("referrals").find({affiliateId:uid},{projection:{_id:0}}).toArray():[],
   uid?db.collection("withdrawals").find({affiliateId:uid},{projection:{_id:0}}).toArray():[],
   admin?db.collection("affiliates").find({},{projection:{_id:0}}).limit(1000).toArray():[],
   admin?db.collection("affiliateApplications").find({},{projection:{_id:0}}).limit(1000).toArray():[],
   admin?db.collection("withdrawals").find({},{projection:{_id:0}}).limit(1000).toArray():[],
   admin?db.collection("referrals").find({},{projection:{_id:0}}).limit(2000).toArray():[],
   db.collection("config").findOne({_id:"global"})
  ]);
  return json(res,200,{ok:true,affiliate,application,referrals,withdrawals,allAffiliates,allApplications,allWithdrawals,allReferrals,commissionRate:Number(config?.commissionPercentage)||10});
 }
 if(req.method!=="POST")return json(res,405,{ok:false,error:"Method not allowed."});
 const action=String(body.action||"");
 if(action==="click"){
  const code=String(body.refCode||"").trim().slice(0,100);if(!code)return json(res,400,{ok:false,error:"Referral code required."});
  const aff=await db.collection("affiliates").findOne({referralCode:code});if(!aff)return json(res,404,{ok:false,error:"Referral code not found."});
  await db.collection("affiliates").updateOne({id:aff.id},{$inc:{totalClicks:1}});
  await db.collection("referrals").insertOne({id:"click-"+randomUUID(),affiliateId:aff.id,referredUserId:user?.id||"guest-user",status:"pending",date:date(),type:"click"});
  return json(res,200,{ok:true,affiliateId:aff.id});
 }
 if(action==="apply"){
  if(!user)return json(res,401,{ok:false,error:"Please sign in before applying."});
  const app={...body.application,uid:user.id,id:user.id,status:"Pending",affiliateActivated:false,emailVerified:false,adminNotes:"",submittedAt:new Date().toISOString()};
  delete app.action;await db.collection("affiliateApplications").replaceOne({uid:user.id},app,{upsert:true});return json(res,200,{ok:true,application:app});
 }
 if(action==="register"){
  if(!user)return json(res,401,{ok:false,error:"Please sign in before activating affiliate access."});
  const app=await db.collection("affiliateApplications").findOne({uid:user.id});
  if(!app||app.status!=="Approved"||!app.affiliateActivated)return json(res,403,{ok:false,error:"Your affiliate application must be approved and activated first."});
  const existing=await db.collection("affiliates").findOne({id:user.id});
  if(existing){await db.collection("affiliates").updateOne({id:user.id},{$set:{paymentMethod:String(body.paymentMethod||existing.paymentMethod||""),paymentDetails:String(body.payoutDetails||existing.paymentDetails||"")}});return json(res,200,{ok:true,affiliate:existing});}
  const aff={id:user.id,userId:user.id,referralCode:"PT"+randomUUID().replace(/-/g,"").slice(0,8).toUpperCase(),totalClicks:0,totalReferrals:0,totalEarnings:0,pendingCommission:0,paidCommission:0,status:"active",paymentMethod:String(body.paymentMethod||""),paymentDetails:String(body.payoutDetails||""),createdAt:new Date().toISOString(),isTopSeller:false,activated:true};
  await db.collection("affiliates").insertOne(aff);return json(res,201,{ok:true,affiliate:aff});
 }
 if(action==="withdraw"){
  if(!user)return json(res,401,{ok:false,error:"Please sign in to request a payout."});
  const amount=Number(body.amount),method=String(body.method||"").slice(0,60),details=String(body.details||"").slice(0,500);
  const aff=await db.collection("affiliates").findOne({id:user.id});
  if(!aff||!Number.isFinite(amount)||amount<=0||amount>Number(aff.pendingCommission||0))return json(res,400,{ok:false,error:"Withdrawal amount exceeds your available commission."});
  const item={id:"with-"+randomUUID(),affiliateId:user.id,amount,paymentMethod:method,paymentDetails:details,status:"pending",date:date()};
  const debit=await db.collection("affiliates").updateOne({id:user.id,pendingCommission:{$gte:amount}},{$inc:{pendingCommission:-amount}});
  if(!debit.modifiedCount)return json(res,409,{ok:false,error:"Commission balance changed; refresh and retry."});
  await db.collection("withdrawals").insertOne(item);return json(res,201,{ok:true,withdrawal:item});
 }
 if(action==="setCommissionRate"){
  if(!requireAdmin(req,res))return;const rate=Number(body.rate);
  if(!Number.isFinite(rate)||rate<0||rate>100)return json(res,400,{ok:false,error:"Commission rate must be between 0 and 100."});
  await db.collection("config").updateOne({_id:"global"},{$set:{commissionPercentage:rate}},{upsert:true});return json(res,200,{ok:true,commissionRate:rate});
 }
 if(action==="applicationStatus"){
  if(!requireAdmin(req,res))return;const id=String(body.id||"").slice(0,150),status=String(body.status||"");
  if(!id||!["Pending","Approved","Rejected","Suspended"].includes(status))return json(res,400,{ok:false,error:"Invalid application status."});
  await db.collection("affiliateApplications").updateOne({$or:[{id},{uid:id}]},{$set:{status,adminNotes:String(body.adminNotes||"").slice(0,1000),affiliateActivated:status==="Approved"&&Boolean(body.affiliateActivated)}});
  if(status==="Approved"&&body.affiliateActivated){const app=await db.collection("affiliateApplications").findOne({$or:[{id},{uid:id}]});if(app)await db.collection("affiliates").updateOne({id:app.uid},{$setOnInsert:{id:app.uid,userId:app.uid,referralCode:"PT"+randomUUID().replace(/-/g,"").slice(0,8).toUpperCase(),totalClicks:0,totalReferrals:0,totalEarnings:0,pendingCommission:0,paidCommission:0,status:"active",createdAt:new Date().toISOString(),activated:true}},{upsert:true});}
  return json(res,200,{ok:true});
 }
 if(action==="affiliateStatus"){
  if(!requireAdmin(req,res))return;const id=String(body.id||"").slice(0,150),status=String(body.status||"");
  if(!id||!["active","inactive","pending_approval","rejected"].includes(status))return json(res,400,{ok:false,error:"Invalid affiliate status."});
  await db.collection("affiliates").updateOne({id},{$set:{status}});return json(res,200,{ok:true});
 }
 if(action==="withdrawalStatus"){
  if(!requireAdmin(req,res))return;const id=String(body.id||"").slice(0,150),status=String(body.status||"");
  if(!id||!["pending","approved","rejected"].includes(status))return json(res,400,{ok:false,error:"Invalid withdrawal status."});
  const item=await db.collection("withdrawals").findOne({id});if(!item)return json(res,404,{ok:false,error:"Withdrawal not found."});
  await db.collection("withdrawals").updateOne({id},{$set:{status}});
  if(status==="approved"&&item.status!=="approved")await db.collection("affiliates").updateOne({id:item.affiliateId},{$inc:{paidCommission:Number(item.amount)||0}});
  if(status==="rejected"&&item.status!=="rejected")await db.collection("affiliates").updateOne({id:item.affiliateId},{$inc:{pendingCommission:Number(item.amount)||0}});
  return json(res,200,{ok:true});
 }
 if(action==="processCooling"){
  if(!user)return json(res,401,{ok:false,error:"Sign in required."});
  const rows=await db.collection("referrals").find({affiliateId:user.id,status:"cooling"},{projection:{_id:0}}).toArray();let cleared=0;
  for(const row of rows){if(!row.deliveryDate||(Date.now()-new Date(row.deliveryDate).getTime())/86400000<7)continue;
   const result=await db.collection("referrals").updateOne({id:row.id,status:"cooling"},{$set:{status:"approved"}});
   if(result.modifiedCount){const amount=Number(row.commissionAmount)||0;await db.collection("affiliates").updateOne({id:user.id},{$inc:{pendingCommission:amount,totalEarnings:amount}});cleared+=amount;}
  }
  return json(res,200,{ok:true,cleared});
 }
 if(action==="checkTopSeller"){
  if(!requireAdmin(req,res))return;
  const list=await db.collection("affiliates").find({},{projection:{_id:0}}).sort({totalEarnings:-1}).limit(1).toArray();
  const winner=list[0];await db.collection("affiliates").updateMany({},{$set:{isTopSeller:false}});
  if(winner)await db.collection("affiliates").updateOne({id:winner.id},{$set:{isTopSeller:true}});
  return json(res,200,{ok:true,winnerId:winner?.id||null});
 }
 return json(res,400,{ok:false,error:"Unsupported affiliate action."});
}
