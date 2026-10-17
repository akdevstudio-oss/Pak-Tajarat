import type { IncomingMessage, ServerResponse } from "node:http";
import { getDatabase } from "../../mongodb-server.js";
import { getAdminSession } from "../../admin-session.js";
import { hashAdminPassword, verifyAdminPassword } from "../../admin-password.js";
type Request = IncomingMessage & { body?: any };
function json(res:ServerResponse,status:number,body:unknown){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.end(JSON.stringify(body));}
export default async function handler(req:Request,res:ServerResponse){
  res.setHeader("Cache-Control","no-store");
  if(req.method!=="POST")return json(res,405,{ok:false,error:"Method not allowed."});
  const session=getAdminSession(req);
  if(!session)return json(res,401,{ok:false,error:"Please sign in again before changing your password."});
  const currentPassword=String(req.body?.currentPassword||"");
  const newPassword=String(req.body?.newPassword||"");
  if(newPassword.length<12)return json(res,400,{ok:false,error:"New password must be at least 12 characters."});
  if(newPassword.length>256)return json(res,400,{ok:false,error:"Password is too long."});
  if(newPassword===currentPassword)return json(res,400,{ok:false,error:"Choose a password different from the current one."});
  const email=process.env.PAK_TIJARAT_ADMIN_EMAIL?.trim().toLowerCase();
  const envPassword=process.env.PAK_TIJARAT_ADMIN_PASSWORD;
  if(!email||session.email!==email)return json(res,403,{ok:false,error:"Only the master administrator can change this password."});
  try{
    const collection=(await getDatabase()).collection("admin_credentials");
    const existing=await collection.findOne({id:"master-admin"});
    const currentValid=existing?.passwordHash&&existing?.passwordSalt
      ? verifyAdminPassword(currentPassword,existing.passwordSalt,existing.passwordHash)
      : !!envPassword&&currentPassword===envPassword;
    if(!currentValid)return json(res,401,{ok:false,error:"Current password is incorrect."});
    const hashed=hashAdminPassword(newPassword);
    await collection.replaceOne({id:"master-admin"},{id:"master-admin",email,...hashed},{upsert:true});
    return json(res,200,{ok:true,message:"Password changed successfully. Use the new password next time you sign in."});
  }catch(error){
    console.error("Admin password update failed:",error instanceof Error?error.name:"UnknownError");
    return json(res,503,{ok:false,error:"Password could not be saved. Check the MongoDB connection and try again."});
  }
}
