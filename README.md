# Pak-Tijarat
### Pakistan’s Trusted Digital Marketplace

Pak-Tijarat is a Pakistan-focused e-commerce marketplace with a responsive storefront, product discovery, cart and checkout, order management, affiliate workflows, and an administration area.

**Designed and developed by AK Dev Studio.**

Website: https://www.pak-tajarat.store

## Technology
- React, TypeScript, Vite, Tailwind CSS
- MongoDB for application data
- Cloudflare R2 for product and site media
- Express-compatible API handlers
- React Router, Lucide React, Motion

## Features
- Storefront, product listings and product detail pages
- Cart, checkout, coupons and order management
- Admin-managed products, categories, content and media
- Affiliate applications, referrals, commissions and payout requests
- Image upload endpoint restricted to authorized administrators
- R2 media storage guardrail: maximum 8 GiB total bucket usage enforced before uploads; each image is limited to 4 MiB

## Run locally
1. Install Node.js LTS and npm.
2. Clone the repository:
   ```bash
   git clone https://github.com/akdevstudio-oss/Pak-Tajarat.git
   cd Pak-Tajarat
   ```
3. Install dependencies with `npm install`.
4. Configure the required environment variables in `.env.local` (never commit credentials). See `docs/MONGODB_SETUP.md` and `docs/CLOUDFLARE_R2_SETUP.md`.
5. Run `npm run dev`.

## Build and checks
```bash
npm run build
npm run lint
```

## Required deployment configuration
Configure MongoDB and Cloudflare R2 credentials as environment variables in the hosting dashboard. Keep all access keys server-side. The public website must never receive R2 secret keys or database credentials.

## Important deployment notes
- This repository's migration work is developed on the `remove-firebase-add-mongodb-r2` branch; production `main` is kept separate until migration checks pass.
- The application must be tested against real configured MongoDB and R2 credentials before launch.
- Storage usage checks require the R2 credentials to have permission to list bucket objects, in addition to read/write/delete permissions required by the app.
- No paid hosting or add-on upgrade is required as part of these code changes. Provider usage, quotas, and billing are controlled by the account and provider plan.

## Project
**Pak-Tijarat** — *Pakistan’s Trusted Digital Marketplace*  
Created by **AK Dev Studio**.
