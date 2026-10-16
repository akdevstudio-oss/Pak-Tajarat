import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDatabase } from "../../lib/mongodb-server";
import { requireAdmin } from "../../lib/admin-session";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const db = await getDatabase();
    const products = db.collection("products");
    if (req.method === "GET") {
      const items = await products.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(500).toArray();
      return res.status(200).json({ ok: true, products: items });
    }
    if (req.method === "POST") {
      const session = requireAdmin(req, res);
      if (!session) return;
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const name = String(body.name || "").trim();
      if (!name) return res.status(400).json({ ok: false, error: "Product name is required." });
      const id = String(body.id || `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).slice(0, 100);
      const document = { ...body, id, name, updatedAt: new Date().toISOString(), createdAt: body.createdAt || new Date().toISOString() };
      delete (document as any)._id;
      await products.replaceOne({ id }, document, { upsert: true });
      return res.status(200).json({ ok: true, product: document });
    }
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  } catch (error) {
    console.error("Products API error:", error instanceof Error ? error.message : "unknown");
    return res.status(500).json({ ok: false, error: "Product service is temporarily unavailable." });
  }
}
