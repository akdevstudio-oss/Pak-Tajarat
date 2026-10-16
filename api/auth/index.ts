import type { IncomingMessage, ServerResponse } from "node:http";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getDatabase } from "../../lib/mongodb-server";
import { createUserToken, setUserCookie } from "../../lib/user-session";
type Req=IncomingMessage&{body?:any};
function json(res:ServerResponse,status:number,body:unknown){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(body));}
function safeUser(u:any){return {id:String(u.id),email:String(u.email),fullName:String(u.fullName||""),role:"User",phone:String(u.phone||""),addresses:Array.isArray(u.addresses)?u.addresses:[]};}
function verify(password:string,salt:string,hash:string){try{const got=scryptSync(password,salt,64);const expected=Buffer.from(hash,"hex");return got.length===expected.length&&timingSafeEqual(got,expected);}catch{return false;}}
export default async function handler(req:Req,res:ServerResponse){
 if(req.method!=="POST")return json(res,405,{ok:false,error:"Method not allowed."});
 const action=String(req.body?.action||"");const email=String(req.body?.email||"").trim().toLowerCase();const password=String(req.body?.password||"");
 try{
  const users=(await getDatabase()).collection("users");
  if(action==="register"){
   const fullName=String(req.body?.fullName||"").trim().slice(0,120);const phone=String(req.body?.phone||"").trim().slice(0,40);
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json(res,400,{ok:false,error:"Enter a valid email address."});
   if(password.length<8||password.length>200)return json(res,400,{ok:false,error:"Password must be at least 8 characters."});
   if(!fullName)return json(res,400,{ok:false,error:"Full name is required."});
   if(await users.findOne({email}))return json(res,409,{ok:false,error:"An account already exists for this email."});
   const salt=randomBytes(16).toString("hex");const hash=scryptSync(password,salt,64).toString("hex");const user={id:randomBytes(16).toString("hex"),email,fullName,phone,addresses:[],role:"User",passwordSalt:salt,passwordHash:hash,createdAt:new Date().toISOString()};
   await users.insertOne(user);setUserCookie(res,createUserToken({id:user.id,email:user.email,role:"User"}));return json(res,201,{ok:true,user:safeUser(user)});
  }
  if(action==="login"){
   const user=await users.findOne({email});if(!user||!user.passwordSalt||!user.passwordHash||!verify(password,user.passwordSalt,user.passwordHash))return json(res,401,{ok:false,error:"Invalid email or password."});
   setUserCookie(res,createUserToken({id:user.id,email:user.email,role:"User"}));return json(res,200,{ok:true,user:safeUser(user)});
  }
  return json(res,400,{ok:false,error:"Unsupported authentication action."});
 }catch(error){console.error("Customer auth API:",error instanceof Error?error.message:"unknown");return json(res,500,{ok:false,error:"Authentication service is temporarily unavailable."});}
}
