import { createHmac, timingSafeEqual } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

const COOKIE_NAME = "paktijarat_admin_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function secret() {
  const value = process.env.PAK_TIJARAT_SESSION_SECRET?.trim();
  if (!value || value.length < 32) throw Object.assign(new Error("Admin session secret is not configured."), { status: 503 });
  return value;
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
export function createAdminToken(email: string) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS, role: "Admin" })).toString("base64url");
  return payload + "." + sign(payload);
}
export function verifyAdminToken(token: string | undefined) {
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;
  try {
    const expected = Buffer.from(sign(payload));
    const actual = Buffer.from(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.role !== "Admin" || typeof data.email !== "string" || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { email: data.email as string, role: "Admin" as const, exp: data.exp as number };
  } catch { return null; }
}
function cookies(req: IncomingMessage) {
  return Object.fromEntries((req.headers.cookie || "").split(";").map(part => {
    const i = part.indexOf("=");
    return i < 0 ? [part.trim(), ""] : [part.slice(0, i).trim(), decodeURIComponent(part.slice(i + 1).trim())];
  }));
}
export function getAdminSession(req: IncomingMessage) {
  return verifyAdminToken(cookies(req)[COOKIE_NAME]);
}
export function setAdminCookie(res: ServerResponse, token: string) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}`);
}
export function clearAdminCookie(res: ServerResponse) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}
export function requireAdmin(req: IncomingMessage, res: ServerResponse) {
  const session = getAdminSession(req);
  if (!session) {
    res.statusCode = 401;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "Admin authentication required." }));
    return null;
  }
  return session;
}
