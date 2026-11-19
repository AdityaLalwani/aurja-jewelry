# Neon store admin

The store catalog and category pages read from Neon. Open `/admin` to manage
products, categories, customers, imported orders, inventory, and discounts.
Admin access uses the site's existing Firebase sign-in.

Products can be assigned to multiple categories from the product editor.
Category assignments are stored in the product's `categories` array; the
first selected category is also stored as `category_id` for compatibility.

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

## Add a product and recalculate variant prices

Use the JSON payload in `scripts/product-example.json` as a template. It
contains one product and its variants, including
`attributes.price_breakup` with numeric `nwsilver`, `nw9k`, `nw14k`, `nw18k`,
`silverlabour`, `goldlabour`, and `Stonecost` values. Copy it and replace the
example IDs and product details with the new product data.

Validate the file without writing:

```powershell
npm run add:product:neon -- --file "scripts/product-example.json"
```

Insert the product and variants with the direct `DATABASE_URL_UNPOOLED`:

```powershell
npm run add:product:neon -- --file "scripts/product-example.json" --apply
```

This is insert-only: existing product or variant IDs (or a duplicate product
slug) cause the transaction to fail rather than overwrite existing records.

To preview a price recalculation, pass the gold and silver per-gram rates:

```powershell
npm run update:variant-prices:neon -- --goldrate 6000 --silverrate 100
npm run update:variant-prices:neon -- --goldrate 6000 --silverrate 100 --apply
```

The values can alternatively be set as `GOLDRATE` and `SILVERRATE` in
`.env.local`.
The script fetches the published INR-to-USD exchange rate from
`open.er-api.com` and prints its update timestamp. Variant INR prices are
calculated from each product's `content.price_breakup` or
`attributes.price_breakup`, accepting a JSON object/JSON-encoded object or
seven pipe-separated values in the order
`nwsilver|nw9k|nw14k|nw18k|silverlabour|goldlabour|Stonecost`. It updates INR
and USD prices on variants, matching metal option values, and parent products.
For products without variants, it preserves their USD price and derives
`price_inr` from that price using the same exchange rate.

The PLP shows INR to visitors detected in India. Products without variant
records previously had a valid USD price but no `price_inr`, so their PLP price
fell back to zero. The script now backfills those missing INR prices as well.
All database writes are transactional; an invalid breakup or unrecognized
variant metal stops the run.

For products without variants, a supplied INR price map can be applied by SKU
instead of deriving INR from the existing USD price. The map is a JSON object,
such as `scripts/asj-inr-prices.json`:

```powershell
npm run update:variant-prices:neon -- --inr-prices "scripts/asj-inr-prices.json"
npm run update:variant-prices:neon -- --inr-prices "scripts/asj-inr-prices.json" --apply
```

The script requires exactly one matching product per SKU and rejects mapped
products that have variants. It uses the same published INR-to-USD rate to set
the product's INR price, USD price, and `attributes.price_usd`.

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
