# MongoDB Atlas connection

Pak-Tijarat now has a server-only MongoDB connection helper and a read-only health endpoint on the migration branch.

## Vercel environment variables

Set these for Preview and Production:

- `MONGODB_URI` — Atlas connection string; keep it encrypted/sensitive and server-side only.
- `MONGODB_DB_NAME` — `paktijarat`

Never add either variable with a `VITE_` prefix and never return the URI to the browser.

## Test the connection

After the branch preview deployment is ready, open:

`/api/db-health`

A successful response contains `ok: true`. A failed response does not expose the URI or credentials. If the test fails, check Atlas Network Access, the database user's permissions, and the Vercel environment target.

## Migration status and safety

This endpoint only verifies connectivity; it does not migrate product, customer, order, affiliate, or admin data. Firebase is still required by existing frontend contexts. Do not remove Firebase configuration or its package until those workflows have been migrated and tested against authenticated server-side APIs. The production domain should not be switched until preview tests pass.
