import type { IncomingMessage, ServerResponse } from "node:http";
import { getDatabase } from "../lib/mongodb-server";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, message: "Method not allowed." }));
    return;
  }
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, message: "MongoDB connection successful." }));
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: unknown }).status) : 502;
    console.error("MongoDB health check failed:", error instanceof Error ? error.name : "UnknownError");
    res.statusCode = status >= 400 && status < 600 ? status : 502;
    res.end(JSON.stringify({
      ok: false,
      message: status === 503 ? "MongoDB connection string is not configured." : "Unable to connect to MongoDB. Check Atlas network access and connection settings."
    }));
  }
}
