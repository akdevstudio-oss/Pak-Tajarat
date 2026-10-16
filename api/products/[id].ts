import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDatabase } from "../../lib/mongodb-server";
import { requireAdmin } from "../../lib/admin-session";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  const session = requireAdmin(req, res);
  if (!session) return;
  const id = String(req.query.id || "").slice(0, 100);
  if (!id) return res.status(400).json({ ok: false, error: "Product ID is required." });
  try {
    const products = (await getDatabase()).collection("products");
    if (req.method === "DELETE") {
      const result = await products.deleteOne({ id });
      return res.status(result.deletedCount ? 200 : 404).json({ ok: !!result.deletedCount });
    }
    if (req.method === "PATCH" || req.method === "PUT") {
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const document = { ...body, id, updatedAt: new Date().toISOString() };
      delete (document as any)._id;
      await products.replaceOne({ id }, document, { upsert: true });
      return res.status(200).json({ ok: true, product: document });
    }
    return res.status(405).json({ ok: false, error: "Method not allowed." });
  } catch (error) {
    console.error("Product item API error:", error instanceof Error ? error.message : "unknown");
    return res.status(500).json({ ok: false, error: "Product service is temporarily unavailable." });
  }
}
