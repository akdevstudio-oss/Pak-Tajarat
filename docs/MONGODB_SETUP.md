# MongoDB Atlas connection

Pak-Tijarat uses server-side MongoDB access for application data. Database credentials must remain on the server and must never be bundled into browser code.

## Vercel environment variables

Set these for Preview and Production:

- `MONGODB_URI` — Atlas connection string; keep it encrypted/sensitive and server-side only.
- `MONGODB_DB_NAME` — `paktijarat`

Never add either variable with a `VITE_` prefix and never return the URI to the browser.

## Test the connection

After deployment is ready, open:

`/api/db-health`

A successful response contains `ok: true`. A failed response does not expose the URI or credentials. If the test fails, check Atlas Network Access, the database user's permissions, and the Vercel environment target.

## Data safety

The health endpoint only verifies connectivity; it does not migrate or delete product, customer, order, affiliate, or administrator data. Verify the storefront, administrator login, product management, image uploads, and order checkout against the live database before treating the migration as complete.
