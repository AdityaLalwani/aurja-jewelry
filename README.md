# AURJA — Shaped for Stories

Pre-launch marketing site for a Surat-based jewellery atelier. Built with Next.js (App Router), React, TypeScript and Tailwind CSS v4.

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

## Launch-signup flow

The email signup posts to `/api/subscribe`, which forwards to a Google Sheets webhook. Setup is documented in [docs/google-sheets-subscriptions.md](docs/google-sheets-subscriptions.md); the Apps Script server side is in [scripts/google-apps-script/Code.gs](scripts/google-apps-script/Code.gs).

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint
