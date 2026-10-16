import type { IncomingMessage, ServerResponse } from "node:http";
import adminLogin from "../lib/api-handlers/admin/login.js";
import adminLogout from "../lib/api-handlers/admin/logout.js";
import adminSession from "../lib/api-handlers/admin/session.js";
import analytics from "../lib/api-handlers/analytics.js";
import authIndex from "../lib/api-handlers/auth/index.js";
import authLogout from "../lib/api-handlers/auth/logout.js";
import authProfile from "../lib/api-handlers/auth/profile.js";
import authSession from "../lib/api-handlers/auth/session.js";
import cmsCollection from "../lib/api-handlers/cms/[collection].js";
import dbHealth from "../lib/api-handlers/db-health.js";
import mediaObject from "../lib/api-handlers/media-object.js";
import mediaDelete from "../lib/api-handlers/media/delete.js";
import mediaUpload from "../lib/api-handlers/media/upload.js";
import productItem from "../lib/api-handlers/products/[id].js";
import productClear from "../lib/api-handlers/products/clear.js";
import productIndex from "../lib/api-handlers/products/index.js";
import r2Health from "../lib/api-handlers/r2/health.js";

type ApiRequest = IncomingMessage & {
  body?: any;
  query?: Record<string, string | string[] | undefined>;
};
const handlers: Record<string, (req: any, res: ServerResponse) => unknown> = {
  "admin/login": adminLogin, "admin/logout": adminLogout, "admin/session": adminSession,
  "analytics": analytics, "auth": authIndex, "auth/index": authIndex,
  "auth/logout": authLogout, "auth/profile": authProfile, "auth/session": authSession,
  "cms": cmsCollection, "db-health": dbHealth, "media-object": mediaObject,
  "media/delete": mediaDelete, "media/upload": mediaUpload, "products": productIndex,
  "products/clear": productClear, "r2/health": r2Health,
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
      res.statusCode = 413; res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ ok: false, error: "Request body is too large." })); return false;
    }
    chunks.push(part);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) { req.body = {}; return true; }
  try { req.body = JSON.parse(raw); return true; }
  catch {
    res.statusCode = 400; res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: "Invalid JSON request body." })); return false;
  }
}

export default async function handler(req: ApiRequest, res: ServerResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  const pathname = new URL(req.url || "/", "http://localhost").pathname;
  const internalRoute = req.query?.__internal_route;
  const route = (typeof internalRoute === "string" && internalRoute
    ? internalRoute : pathname.replace(/^\/api\/?/, "")).replace(/^\/+|\/+$/g, "");
  const parts = route.split("/").filter(Boolean).map(part => {
    try { return decodeURIComponent(part); } catch { return part; }
  });
  let key = route;
  if (parts[0] === "products" && parts.length === 2 && parts[1] !== "clear") {
    key = "products/[id]"; req.query = { ...(req.query || {}), id: parts[1] };
  } else if (parts[0] === "cms" && parts.length === 2) {
    key = "cms"; req.query = { ...(req.query || {}), collection: parts[1] };
  }
  const selected = handlers[key];
  if (!selected) {
    res.statusCode = 404; res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ ok: false, error: "API route not found." })); return;
  }
  if (key !== "media/upload" && !(await parseJsonBody(req, res))) return;
  return selected(req, res);
}
