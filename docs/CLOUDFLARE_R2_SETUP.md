# Cloudflare R2 setup for Pak-Tijarat

Pak-Tijarat stores product and site images in Cloudflare R2. Image uploads go through the server-side API; the browser never receives R2 access keys. Public image reads are served by `/api/media-object?key=...`.

## Vercel environment variables

Set these securely in Vercel for the environments you intend to use:

- `R2_ACCOUNT_ID` — Cloudflare account ID.
- `R2_ENDPOINT` — `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
- `R2_BUCKET_NAME` — existing R2 bucket name.
- `R2_ACCESS_KEY_ID` — R2 API token access key.
- `R2_SECRET_ACCESS_KEY` — secret key; never expose it in client code.
- `PAK_TIJARAT_ADMIN_EMAIL` — exact admin login email.
- `PAK_TIJARAT_ADMIN_PASSWORD` — strong admin password.
- `PAK_TIJARAT_SESSION_SECRET` — random secret of at least 32 characters, used to sign the HttpOnly admin session cookie.
- `MONGODB_URI` and `MONGODB_DB_NAME` — MongoDB connection and database name.

Do not use `VITE_` or `NEXT_PUBLIC_` prefixes for secrets. Redeploy after changing environment variables. Never paste database URIs, passwords, or R2 secret keys into chat or commit them to Git.

## Health checks

- `GET /api/db-health` checks the MongoDB connection.
- `GET /api/r2/health` performs a signed, read-only R2 bucket check. A successful response contains `ok: true`.

Vercel preview deployments may require authentication before either endpoint can be opened. Test these endpoints from an authenticated preview session or the deployment logs; do not assume a health check passed just because the deployment built successfully.

## Upload access and image delivery

- `POST /api/media/upload` requires the signed administrator session created by the admin login endpoint.
- Only JPEG, PNG, WebP, AVIF and GIF are accepted; each upload is limited to 4 MiB.
- Uploaded media is delivered through `/api/media-object?key=...`; a public R2 custom domain is not required by this delivery path.
- The upload API checks total bucket object size before writing. It uses a MongoDB lock to reduce concurrent-upload races and refuses the upload if the 8 GiB cap would be exceeded.
- The R2 access token must have permission to list objects (for usage checks), read objects, write objects and delete objects as needed by the app. If listing fails, uploads fail closed rather than bypassing the limit.

## 8 GiB storage guardrail

The application enforces an 8 GiB upload guardrail; Cloudflare R2 itself does not automatically stop usage at that value. Do not treat this application guardrail as a provider-level quota: existing uploads made outside this API, simultaneous external writers, provider-side accounting, and operational failures can affect actual bucket usage. Keep this bucket dedicated to Pak-Tijarat media and avoid writing to it outside the application if you want the guardrail to remain meaningful.

## Verification before production

1. Confirm the required environment variables exist in Vercel Preview and Production without exposing their values.
2. Sign in to the admin area on a protected preview deployment.
3. Confirm `/api/db-health` and `/api/r2/health` report success.
4. Test one small image upload, confirm it displays on the site, and test deletion.
5. Confirm an unauthenticated upload returns HTTP 401.
6. Confirm oversized uploads are rejected and that the 8 GiB check fails closed if bucket listing is unavailable.
7. Only then consider merging the migration branch into production.
