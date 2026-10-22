# AURJA — Shaped for Stories

Storefront and brand site for a Surat-based jewellery atelier. Built with Next.js (App Router), React, TypeScript and Tailwind CSS v4.

## Getting started

```bash
npm install
npm run dev
```

The dev server binds to `0.0.0.0` so the site is reachable from other devices on the LAN. Open `http://localhost:3000` (or your machine's LAN IP) in a browser.

## How the site is organised

- All copy and content lives in [lib/site.ts](lib/site.ts) — sections read from this config, so most content edits never touch markup.
- Homepage sections live in [app/components/homepage/](app/components/homepage/); pages in [app/](app/).
- Brand fonts (Playfair Display + Jost) load via `next/font/google` in [app/layout.tsx](app/layout.tsx).

## Email subscriptions

Email subscription forms post to `/api/subscribe`, which forwards to a Google Sheets webhook. Setup is documented in [docs/google-sheets-subscriptions.md](docs/google-sheets-subscriptions.md); the Apps Script server side is in [scripts/google-apps-script/Code.gs](scripts/google-apps-script/Code.gs).

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint

## Storefront performance

- The product listing requests 24 active products at a time. **Load 24 more** appends subsequent pages; sorting and filtering apply to the products currently loaded.
- Public Swell product and category GET requests are cached for five minutes and one hour respectively. Shopper-specific cart requests remain uncached.
- Development server logs show the method, status, Swell resource, and elapsed time for each Swell request. Query strings and identifiers are omitted.
- Compare cold and warm navigation with `npm run build` followed by `npm run start`. Use browser DevTools Network/Performance to compare PLP TTFB, LCP, image bytes, and JavaScript transfer; development timings include compiler overhead.
