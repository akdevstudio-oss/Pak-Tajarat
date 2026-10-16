import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
const COOKIE = "paktijarat_user_session";
function secret(){ const s=process.env.PAK_TIJARAT_SESSION_SECRET?.trim(); if(!s||s.length<32) throw Object.assign(new Error("Session secret is not configured."),{status:503}); return s; }
function sign(p:string){ return createHmac("sha256",secret()).update(p).digest("base64url"); }
export function createUserToken(user:{id:string,email:string,role:"User"}){const p=Buffer.from(JSON.stringify({...user,exp:Math.floor(Date.now()/1000)+60*60*24*14})).toString("base64url");return p+"."+sign(p);}
export function readUserSession(req:IncomingMessage){try{const raw=(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="))?.slice(COOKIE.length+1);if(!raw)return null;const t=decodeURIComponent(raw);const [p,s,...extra]=t.split(".");if(!p||!s||extra.length)return null;const a=Buffer.from(s),b=Buffer.from(sign(p));if(a.length!==b.length||!timingSafeEqual(a,b))return null;const d=JSON.parse(Buffer.from(p,"base64url").toString());if(d.role!=="User"||d.exp<Date.now()/1000)return null;return {id:String(d.id),email:String(d.email),role:"User" as const};}catch{return null;}}
export function setUserCookie(res:ServerResponse,token:string){res.setHeader("Set-Cookie",COOKIE+"="+encodeURIComponent(token)+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=1209600");}
export function clearUserCookie(res:ServerResponse){res.setHeader("Set-Cookie",COOKIE+"=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");}
