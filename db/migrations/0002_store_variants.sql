CREATE TABLE IF NOT EXISTS store_variants (
  store_id text PRIMARY KEY,
  parent_id text NOT NULL,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_variants_parent_idx
  ON store_variants (parent_id);
