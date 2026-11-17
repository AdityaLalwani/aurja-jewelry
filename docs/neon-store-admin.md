# Neon store admin

The store catalog and category pages read from Neon. Open `/admin` to manage
products, categories, customers, imported orders, inventory, and discounts.
Admin access uses the site's existing Firebase sign-in.

## Admin access

Set `ADMIN_EMAILS` to a comma-separated allowlist of exact email addresses in
local `.env.local` and in the deployment environment. The local workspace is
configured for `aurja.aditya@gmail.com`. Sign out and sign back in after
changing the allowlist or session format; an allowlisted Firebase email is
redirected to `/admin` after sign-in.

Every admin page and server action checks the signed session and allowlist.
The Neon connection strings remain server-side; never expose them as
`NEXT_PUBLIC_*` variables.

## Schema and migration

The schema is managed in `db/migrations/`. Run the idempotent migrations
against Neon with the direct `DATABASE_URL_UNPOOLED` before deploying the
variant-aware storefront:

```powershell
npm run migrate:neon:schema
```

This only updates the schema; it does not call Swell or import records.

To preview the source data import:

```powershell
npm run migrate:swell:neon
```

The dry run requests product, variant, category, account, order, and coupon
counts but does not write to Neon. When the Swell API allows access, import
those records with:

```powershell
npm run migrate:swell:neon -- --apply
```

The importer reads Swell's products, product variants, categories, accounts,
orders, and coupons APIs using `SWELL_STORE_ID` and `SWELL_SECRET_KEY`, and
writes to the linked Neon project with the direct `DATABASE_URL_UNPOOLED`.
Product and variant API records are retained as complete JSONB payloads;
variants are stored separately with their parent product ID and are joined
back into product reads for the storefront. Stock adjustments are requested
alongside the current stock totals. The importer upserts records without
deleting source or destination records. Customer and order payloads exclude
password, reset/session token, payment token, and card fields. Customer
addresses and other non-credential fields are retained.

Swell returned HTTP 402 during the initial API export attempt. Product data can
instead be imported from the consolidated CSV sheet, without Swell API access:

```powershell
npm run import:products:neon -- --file "C:\path\to\aurja-products-final.csv"
npm run import:products:neon -- --file "C:\path\to\aurja-products-final.csv" --apply
```

The first command validates and previews the sheet; `--apply` upserts its
products, variants, and categories using the direct `DATABASE_URL_UNPOOLED`.
Product and variant IDs are taken from the sheet, while original Swell IDs and
source fields remain in the JSONB provenance payloads. Category IDs are
deterministically derived from the category paths. The importer does not delete
records, and it does not import customers, orders, or discounts from the sheet.

## Existing site behavior

- Products, categories, search, product pages, navigation, and sitemap data
  now read from Neon.
- Customer profiles and new Firebase sign-ins use Neon. Existing Swell
  customers are matched by email if their records are imported.
- Signed-in carts and wishlists sync from browser storage to Neon. Guest
  activity remains browser-local until sign-in.
- The current cart submits quote/order enquiries, not paid orders. Enquiries
  are saved in Neon and still sent to the configured Google Sheets webhook.
  Imported Swell orders can be viewed and assigned an admin status; the site
  does not yet process payments, refunds, or fulfillment. Discount codes are
  stored for management but are not yet applied to enquiry totals.
- Product and variant image URLs and metadata are retained in their JSONB
  payloads; the image binary files themselves remain on Swell's CDN. Move
  images to ImageKit or another object storage provider before removing the
  Swell CDN image host from `next.config.ts`.
