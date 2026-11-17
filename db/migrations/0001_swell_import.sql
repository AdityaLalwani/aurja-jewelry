CREATE TABLE IF NOT EXISTS swell_products (
  swell_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS swell_products_slug_idx
  ON swell_products ((payload ->> 'slug'));

CREATE TABLE IF NOT EXISTS swell_categories (
  swell_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS swell_categories_slug_idx
  ON swell_categories ((payload ->> 'slug'));

CREATE TABLE IF NOT EXISTS swell_customers (
  swell_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS swell_customers_email_idx
  ON swell_customers (lower(payload ->> 'email'));

ALTER TABLE swell_customers
  ADD COLUMN IF NOT EXISTS auth_uid text;

CREATE UNIQUE INDEX IF NOT EXISTS swell_customers_auth_uid_idx
  ON swell_customers (auth_uid)
  WHERE auth_uid IS NOT NULL;

CREATE TABLE IF NOT EXISTS swell_orders (
  swell_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS swell_orders_customer_idx
  ON swell_orders ((payload ->> 'account_id'));

CREATE TABLE IF NOT EXISTS swell_discounts (
  swell_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_customer_activity (
  customer_id text PRIMARY KEY REFERENCES swell_customers(swell_id) ON DELETE CASCADE,
  cart jsonb NOT NULL DEFAULT '[]'::jsonb,
  wishlist jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
