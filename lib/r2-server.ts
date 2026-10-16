import { createHash, createHmac, randomUUID } from "node:crypto";

const sha256 = (value: string | Buffer | Uint8Array) => createHash("sha256").update(value).digest("hex");
const hmac = (key: Buffer | string, value: string) => createHmac("sha256", key).update(value).digest();
const awsEncode = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
const encodePath = (value: string) => value.split("/").map(awsEncode).join("/");

export function r2Config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() || "";
  const accessKey = process.env.R2_ACCESS_KEY_ID?.trim() || "";
  const secretKey = process.env.R2_SECRET_ACCESS_KEY?.trim() || "";
  const bucket = process.env.R2_BUCKET_NAME?.trim() || "";
  const endpoint = (process.env.R2_ENDPOINT?.trim() || "").replace(/\/+$/, "");
  const missing = [
    ["R2_ACCOUNT_ID", accountId],
    ["R2_ACCESS_KEY_ID", accessKey],
    ["R2_SECRET_ACCESS_KEY", secretKey],
    ["R2_BUCKET_NAME", bucket],
    ["R2_ENDPOINT", endpoint],
  ].filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw Object.assign(new Error("R2 environment variables are missing."), { status: 503, missing });
  const url = new URL(endpoint);
  if (!/^[a-f0-9]{32}$/i.test(accountId) ||
      !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket) ||
      url.protocol !== "https:" ||
      url.hostname !== accountId + ".r2.cloudflarestorage.com" ||
      url.pathname !== "/" || url.search || url.hash) {
    throw Object.assign(new Error("R2 configuration format is invalid."), { status: 503 });
  }
  return { accountId, accessKey, secretKey, bucket, endpoint, host: url.host };
}

function signingKey(secret: string, dateStamp: string) {
  return hmac(hmac(hmac(hmac("AWS4" + secret, dateStamp), "auto"), "s3"), "aws4_request");
}

export async function checkR2Bucket() {
  const c = r2Config();
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256("");
  const canonicalUri = "/" + encodePath(c.bucket);
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalHeaders = "host:" + c.host + "\n" +
    "x-amz-content-sha256:" + payloadHash + "\n" +
    "x-amz-date:" + amzDate + "\n";
  const canonicalRequest = ["HEAD", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const scope = dateStamp + "/auto/s3/aws4_request";
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
  const signature = hmac(signingKey(c.secretKey, dateStamp), stringToSign).toString("hex");
  const authorization = "AWS4-HMAC-SHA256 Credential=" + c.accessKey + "/" + scope +
    ", SignedHeaders=" + signedHeaders + ", Signature=" + signature;
  const response = await fetch(new URL(canonicalUri, c.endpoint), {
    method: "HEAD",
    headers: { Authorization: authorization, "x-amz-content-sha256": payloadHash, "x-amz-date": amzDate },
    signal: AbortSignal.timeout(8000),
  });
  if (response.status === 403) throw Object.assign(new Error("R2 rejected the credentials or bucket permissions."), { status: 502 });
  if (response.status === 404) throw Object.assign(new Error("R2 bucket was not found. Check R2_BUCKET_NAME."), { status: 502 });
  if (!response.ok) throw Object.assign(new Error("R2 did not accept the connectivity check (HTTP " + response.status + ")."), { status: 502 });
}


function canonicalQuery(values: Record<string, string>) {
  return Object.entries(values).sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => awsEncode(k) + "=" + awsEncode(v)).join("&");
}
function authorizationFor(method: string, canonicalUri: string, query: string, headers: Record<string,string>, signedHeaders: string, payloadHash: string, c: ReturnType<typeof r2Config>, now: Date) {
  const amzDate = now.toISOString().replace(/[:-]|\\.\\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const canonicalHeaders = signedHeaders.split(";").map(name => name + ":" + headers[name] + "\n").join("");
  const canonicalRequest = [method, canonicalUri, query, canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const scope = dateStamp + "/auto/s3/aws4_request";
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
  const signature = hmac(signingKey(c.secretKey, dateStamp), stringToSign).toString("hex");
  return { amzDate, authorization: "AWS4-HMAC-SHA256 Credential=" + c.accessKey + "/" + scope + ", SignedHeaders=" + signedHeaders + ", Signature=" + signature };
}
export async function getR2UsageBytes() {
  const c = r2Config();
  let total = 0;
  let token = "";
  for (let page = 0; page < 100; page++) {
    const params: Record<string,string> = { "list-type": "2" };
    if (token) params["continuation-token"] = token;
    const query = canonicalQuery(params);
    const uri = "/" + encodePath(c.bucket);
    const now = new Date();
    const payloadHash = sha256("");
    const headers = { host: c.host, "x-amz-content-sha256": payloadHash, "x-amz-date": now.toISOString().replace(/[:-]|\.\d{3}/g, "") };
    const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
    const signed = authorizationFor("GET", uri, query, headers, signedHeaders, payloadHash, c, now);
    const response = await fetch(c.endpoint + uri + "?" + query, { headers: { Authorization: signed.authorization, "x-amz-content-sha256": payloadHash, "x-amz-date": signed.amzDate }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw Object.assign(new Error("Could not calculate current R2 storage usage (HTTP " + response.status + ")."), { status: 502 });
    const xml = await response.text();
    for (const match of xml.matchAll(/<Size>(\d+)<\/Size>/g)) total += Number(match[1]);
    const truncated = /<IsTruncated>true<\/IsTruncated>/.test(xml);
    const next = xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/)?.[1];
    if (!truncated) return total;
    if (!next) throw Object.assign(new Error("R2 returned an incomplete storage listing."), { status: 502 });
    token = next.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  }
  throw Object.assign(new Error("R2 contains too many objects to verify storage usage safely."), { status: 503 });
}
export async function putR2Object(key: string, bytes: Uint8Array, contentType: string) {
  const c = r2Config();
  const uri = "/" + encodePath(c.bucket + "/" + key);
  const now = new Date();
  const payloadHash = sha256(Buffer.from(bytes));
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const headers = { host: c.host, "content-type": contentType, "x-amz-content-sha256": payloadHash, "x-amz-date": amzDate };
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const signed = authorizationFor("PUT", uri, "", headers, signedHeaders, payloadHash, c, now);
  const response = await fetch(c.endpoint + uri, { method: "PUT", headers: { Authorization: signed.authorization, "content-type": contentType, "x-amz-content-sha256": payloadHash, "x-amz-date": signed.amzDate }, body: Buffer.from(bytes), signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw Object.assign(new Error("Cloudflare R2 upload failed (HTTP " + response.status + ")."), { status: 502 });
}
export async function getR2Object(key: string) {
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const uri = "/" + encodePath(c.bucket + "/" + key);
  const now = new Date();
  const payloadHash = sha256("");
  const headers = { host: c.host, "x-amz-content-sha256": payloadHash, "x-amz-date": now.toISOString().replace(/[:-]|\\.\\d{3}/g, "") };
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const signed = authorizationFor("GET", uri, "", headers, signedHeaders, payloadHash, c, now);
  const response = await fetch(c.endpoint + uri, { headers: { Authorization: signed.authorization, "x-amz-content-sha256": payloadHash, "x-amz-date": signed.amzDate }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw Object.assign(new Error("Media object not found."), { status: response.status === 404 ? 404 : 502 });
  return { bytes: new Uint8Array(await response.arrayBuffer()), contentType: response.headers.get("content-type") || "application/octet-stream" };
}

export function createPresignedPut(contentType: string, folder: string, originalName: string) {
  const c = r2Config();
  const extByType: Record<string, string> = {
    "image/webp": ".webp",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/avif": ".avif",
    "image/gif": ".gif",
  };
  const extension = extByType[contentType];
  if (!extension) throw Object.assign(new Error("Only WebP, JPEG, PNG, AVIF, and GIF images are supported."), { status: 415 });
  const safeFolder = folder.toLowerCase().replace(/[^a-z0-9/_-]/g, "").replace(/\/{2,}/g, "/").replace(/^\/+|\/+$/g, "").slice(0, 80) || "general";
  const safeName = originalName.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 70) || "image";
  const key = safeFolder + "/" + Date.now() + "-" + randomUUID() + "-" + safeName + extension;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const scope = dateStamp + "/auto/s3/aws4_request";
  const credential = c.accessKey + "/" + scope;
  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": "60",
    "X-Amz-SignedHeaders": "content-type;host",
  };
  const canonicalQuery = Object.entries(query)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => awsEncode(k) + "=" + awsEncode(v))
    .join("&");
  const canonicalUri = "/" + encodePath(c.bucket + "/" + key);
  const canonicalHeaders = "content-type:" + contentType + "\n" + "host:" + c.host + "\n";
  const canonicalRequest = ["PUT", canonicalUri, canonicalQuery, canonicalHeaders, "content-type;host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
  const signature = hmac(signingKey(c.secretKey, dateStamp), stringToSign).toString("hex");
  const uploadUrl = c.endpoint + canonicalUri + "?" + canonicalQuery + "&X-Amz-Signature=" + signature;
  const publicBase = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  if (!publicBase) throw Object.assign(new Error("R2_PUBLIC_BASE_URL is required to display uploaded media publicly. Configure an R2 custom domain or an enabled public bucket URL."), { status: 503 });
  const publicUrl = new URL(encodePath(key), publicBase + "/").toString();
  return { key, uploadUrl, publicUrl, contentType };
}
