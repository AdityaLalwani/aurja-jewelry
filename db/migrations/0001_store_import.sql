CREATE TABLE IF NOT EXISTS store_products (
  store_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_products_slug_idx
  ON store_products ((payload ->> 'slug'));

CREATE TABLE IF NOT EXISTS store_categories (
  store_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_categories_slug_idx
  ON store_categories ((payload ->> 'slug'));

CREATE TABLE IF NOT EXISTS store_customers (
  store_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_customers_email_idx
  ON store_customers (lower(payload ->> 'email'));

ALTER TABLE store_customers
  ADD COLUMN IF NOT EXISTS auth_uid text;

CREATE UNIQUE INDEX IF NOT EXISTS store_customers_auth_uid_idx
  ON store_customers (auth_uid)
  WHERE auth_uid IS NOT NULL;

CREATE TABLE IF NOT EXISTS store_orders (
  store_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_orders_customer_idx
  ON store_orders ((payload ->> 'account_id'));

CREATE TABLE IF NOT EXISTS store_discounts (
  store_id text PRIMARY KEY,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_customer_activity (
  customer_id text PRIMARY KEY REFERENCES store_customers(store_id) ON DELETE CASCADE,
  cart jsonb NOT NULL DEFAULT '[]'::jsonb,
  wishlist jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
