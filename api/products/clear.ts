import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDatabase } from "../../lib/mongodb-server";
import { requireAdmin } from "../../lib/admin-session";
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ok:false,error:"Method not allowed."});
  if (!requireAdmin(req,res)) return;
  try {
    const result = await (await getDatabase()).collection("products").deleteMany({});
    return res.status(200).json({ok:true,deletedCount:result.deletedCount});
  } catch (error) {
    console.error("Clear products API error:", error instanceof Error ? error.message : "unknown");
    return res.status(500).json({ok:false,error:"Could not clear the product catalog."});
  }
}
