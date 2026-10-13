# Pak-Tijarat UI/UX alignment plan

## Goal
Align the existing React + TypeScript + Vite storefront with the editable Figma homepage concept while preserving existing app state, Firebase-backed catalog, cart, search, account flows, admin tools, and reseller features.

Figma reference: https://www.figma.com/design/cwPyJSBEZuENdEOWGENxF0

## What the current app already has
- Shared header with search, account, cart, theme, promo banner and mobile navigation.
- Dynamic product cards, wishlist, compare, quick view and cart actions.
- Home view with hero carousel, categories, product collections and reviews.
- Separate admin and reseller areas.

## UI/UX changes (safe first pass)
1. Establish consistent premium green, neutral surface, border, radius and focus styles.
2. Improve hero and section spacing, CTA visibility and keyboard focus states.
3. Keep product cards responsive; make touch actions visible and targets usable on mobile.
4. Respect reduced-motion preference and avoid excessive animations.
5. Improve small-screen header/search layout without changing navigation behavior.
6. Ensure buttons/links have visible focus rings and images do not overflow.
7. Replace demo hero copy, fake countdowns, and unverified claims only after confirming real offers, policies and inventory with the owner.

## Implementation sequence
### Phase A — Visual alignment
- Apply shared design tokens and low-risk global UI polish.
- Compare desktop 1440px, tablet 768px, mobile 375px and 320px.
- Check dark mode, keyboard navigation, image failures and loading states.

### Phase B — Home page
- Use the real Pak-Tijarat logo and real bag/catalog photos.
- Make category tiles reflect actual admin-configured categories.
- Use product data already supplied by the app; do not hardcode prices or review counts.
- Add explicit CTAs for Shop and Reseller Program only where routes are functional.

### Phase C — Conversion and accessibility
- Audit cart → checkout on mobile.
- Show delivery fee, payment options, return terms and order summary before order submission.
- Verify WCAG AA contrast, semantic heading order, labels, alt text, and focus visibility.
- Keep motion subtle and honor prefers-reduced-motion.

### Phase D — SEO, reliability and trust
- Verify unique product title/description/canonical and product structured data.
- Fix stale sitemap dates and ensure social preview image URLs return actual image bytes.
- Remove unverified rating, review, address, warranty and delivery claims.
- Test login, checkout, Firebase rules, admin permissions and real payment-provider verification separately; visual changes must not imply these are verified.

## Acceptance checklist
- [ ] Production build passes
- [ ] Desktop/tablet/mobile layout checked
- [ ] Header search, menu, cart, wishlist and product actions still work
- [ ] Homepage products/categories remain data-driven
- [ ] Keyboard focus and reduced-motion behavior work
- [ ] No console errors or broken image assets
- [ ] Checkout and auth smoke-tested
- [ ] Production deployment verified on pak-tajarat.store

## Notes
This branch is a visual foundation, not a claim that checkout, payment integrations, security rules, SEO ranking, or all breakpoints have been fully tested. Keep changes in a pull request until build and manual smoke checks pass.
