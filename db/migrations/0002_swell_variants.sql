CREATE TABLE IF NOT EXISTS swell_variants (
  swell_id text PRIMARY KEY,
  parent_id text NOT NULL,
  payload jsonb NOT NULL,
  source_updated_at timestamptz,
  imported_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS swell_variants_parent_idx
  ON swell_variants (parent_id);
