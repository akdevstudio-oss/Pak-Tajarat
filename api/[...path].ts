import type { IncomingMessage, ServerResponse } from "node:http";

type ApiRequest = IncomingMessage & {
  body?: any;
  query?: Record<string, string | string[] | undefined>;
};

type ApiHandler = (req: any, res: ServerResponse) => unknown;
const handlers: Record<string, () => Promise<{ default: ApiHandler }>> = {
  "admin/login": () => import("../lib/api-handlers/admin/login"),
  "admin/logout": () => import("../lib/api-handlers/admin/logout"),
  "admin/session": () => import("../lib/api-handlers/admin/session"),
  "analytics": () => import("../lib/api-handlers/analytics"),
  "auth": () => import("../lib/api-handlers/auth/index"),
  "auth/index": () => import("../lib/api-handlers/auth/index"),
  "auth/logout": () => import("../lib/api-handlers/auth/logout"),
  "auth/profile": () => import("../lib/api-handlers/auth/profile"),
  "auth/session": () => import("../lib/api-handlers/auth/session"),
  "cms": () => import("../lib/api-handlers/cms/[collection]"),
  "db-health": () => import("../lib/api-handlers/db-health"),
  "media-object": () => import("../lib/api-handlers/media-object"),
  "media/delete": () => import("../lib/api-handlers/media/delete"),
  "media/upload": () => import("../lib/api-handlers/media/upload"),
  "products": () => import("../lib/api-handlers/products/index"),
  "products/clear": () => import("../lib/api-handlers/products/clear"),
  "r2/health": () => import("../lib/api-handlers/r2/health"),
};

export const config = { api: { bodyParser: false } };

async function parseJsonBody(req: ApiRequest, res: ServerResponse): Promise<boolean> {
  const method = String(req.method || "GET").toUpperCase();
  const contentType = String(req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  if (method === "GET" || method === "HEAD" || contentType !== "application/json") return true;
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += part.length;
    if (size > 2 * 1024 * 1024) {
      res.statusCode = 413;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, error: "Request body is too large." }));
      return false;
    }
    chunks.push(part);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) { req.body = {}; return true; }
  try { req.body = JSON.parse(raw); return true; }
  catch {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: "Invalid JSON request body." }));
    return false;
  }
}

export default async function handler(req: ApiRequest, res: ServerResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  const internalRoute = req.query?.__internal_route;
  const route = (typeof internalRoute === "string" && internalRoute
    ? internalRoute
    : pathname.replace(/^\/api\/?/, "")).replace(/^\/+|\/+$/g, "");
  const parts = route.split("/").filter(Boolean).map(part => {
    try { return decodeURIComponent(part); } catch { return part; }
  });

  let key = route;
  if (parts[0] === "products" && parts.length === 2 && parts[1] !== "clear") {
    key = "products/[id]";
    req.query = { ...(req.query || {}), id: parts[1] };
  } else if (parts[0] === "cms" && parts.length === 2) {
    key = "cms";
    req.query = { ...(req.query || {}), collection: parts[1] };
  }

  const selected = handlers[key];
  if (!selected) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: "API route not found." }));
    return;
  }
  if (key !== "media/upload" && !(await parseJsonBody(req, res))) return;
  try {
    const module = await selected();
    return await module.default(req, res);
  } catch (error) {
    console.error("Consolidated API handler failed:", key, error instanceof Error ? error.message : "unknown");
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, error: "API temporarily unavailable." }));
    }
  }
}
