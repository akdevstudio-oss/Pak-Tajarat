# Cloudflare R2 setup for Pak-Tijarat

## Vercel variables

Configure these on both Production and Preview:

- `R2_ACCOUNT_ID`
- `R2_ENDPOINT` — `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY` (sensitive; never expose in browser code)
- `R2_PUBLIC_BASE_URL` — an actual R2 custom domain or enabled public bucket URL for serving images
- `FIREBASE_API_KEY` — Firebase Web API key for the existing Firebase app
- `R2_ADMIN_EMAILS` — comma-separated exact administrator email allowlist

Do not prefix R2 secrets with `VITE_` or `NEXT_PUBLIC_`. Redeploy after changing environment variables.

## Health endpoint

`GET /api/r2/health` is a read-only signed bucket check and never returns credentials or bucket contents. A successful response contains `ok: true`.

## Upload security and media delivery

Uploads must be authorized against the Firebase login and an explicit server-side administrator allowlist. The browser must never receive R2 access keys. Use short-lived, content-type-restricted presigned PUT URLs. The bucket needs a configured public delivery domain if product images should be displayed to visitors; keep write credentials private.

## 8 GB storage policy

Cloudflare R2 does not automatically stop at 8 GB. A per-file size limit alone is not a hard total-storage quota. Do not assume a hard 8 GB cap until total bucket usage tracking and concurrent-upload reservations are implemented and verified. Monitor R2 usage and billing in Cloudflare.

## Verification

1. Set all variables for Preview and Production.
2. Open `/api/r2/health` on the deployed site.
3. Confirm the response has `ok: true` before moving media uploads from Firebase Storage to R2.
4. Never share the Secret Access Key in chat, source code, or screenshots.
