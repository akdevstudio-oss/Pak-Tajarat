import type { IncomingMessage, ServerResponse } from "node:http";
import { getR2Object } from "../r2-server.js";
type Request = IncomingMessage & { query?: Record<string,string|string[]|undefined> };
function json(res: ServerResponse,status:number,body:unknown){res.statusCode=status;res.setHeader("Content-Type","application/json; charset=utf-8");res.end(JSON.stringify(body));}
export default async function handler(req: Request, res: ServerResponse) {
  if(req.method!=="GET"&&req.method!=="HEAD") return json(res,405,{ok:false,error:"Method not allowed."});
  const raw=req.query?.key; const key=String(Array.isArray(raw)?raw[0]:raw||"");
  if(!key||key.length>500||key.startsWith("/")||key.split("/").some(part=>part==="..")||!/^[a-zA-Z0-9_./-]+$/.test(key)) return json(res,400,{ok:false,error:"Invalid media key."});
  try {
    const object=await getR2Object(key);
    res.setHeader("Content-Type",object.contentType);res.setHeader("Cache-Control","public, max-age=86400, stale-while-revalidate=604800");res.setHeader("X-Content-Type-Options","nosniff");res.setHeader("Content-Length",String(object.bytes.length));
    if(req.method==="HEAD"){res.statusCode=200;return res.end();}
    res.statusCode=200;return res.end(Buffer.from(object.bytes));
  } catch(error) {
    const e=error as Error&{status?:number};
    return json(res,e.status===404?404:502,{ok:false,error:e.status===404?"Media not found.":"Media service is temporarily unavailable."});
  }
}
