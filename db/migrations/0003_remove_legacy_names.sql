DO $$
BEGIN
  IF to_regclass('public.swell_products') IS NOT NULL THEN
    INSERT INTO public.store_products (store_id, payload, source_updated_at, imported_at)
      SELECT swell_id, payload, source_updated_at, imported_at
      FROM public.swell_products
      ON CONFLICT (store_id) DO UPDATE SET
        payload = EXCLUDED.payload,
        source_updated_at = EXCLUDED.source_updated_at,
        imported_at = EXCLUDED.imported_at;
    DROP TABLE public.swell_products;
  ELSIF to_regclass('public.store_products') IS NULL THEN
    NULL;
  END IF;

  IF to_regclass('public.swell_variants') IS NOT NULL THEN
    INSERT INTO public.store_variants (store_id, parent_id, payload, source_updated_at, imported_at)
      SELECT swell_id, parent_id, payload, source_updated_at, imported_at
      FROM public.swell_variants
      ON CONFLICT (store_id) DO UPDATE SET
        parent_id = EXCLUDED.parent_id,
        payload = EXCLUDED.payload,
        source_updated_at = EXCLUDED.source_updated_at,
        imported_at = EXCLUDED.imported_at;
    DROP TABLE public.swell_variants;
  END IF;

  IF to_regclass('public.swell_categories') IS NOT NULL THEN
    INSERT INTO public.store_categories (store_id, payload, source_updated_at, imported_at)
      SELECT swell_id, payload, source_updated_at, imported_at
      FROM public.swell_categories
      ON CONFLICT (store_id) DO UPDATE SET
        payload = EXCLUDED.payload,
        source_updated_at = EXCLUDED.source_updated_at,
        imported_at = EXCLUDED.imported_at;
    DROP TABLE public.swell_categories;
  END IF;

  IF to_regclass('public.swell_customers') IS NOT NULL THEN
    ALTER TABLE public.store_customer_activity
      DROP CONSTRAINT IF EXISTS store_customer_activity_customer_id_fkey;
    INSERT INTO public.store_customers (store_id, payload, source_updated_at, imported_at, auth_uid)
      SELECT swell_id, payload, source_updated_at, imported_at, auth_uid
      FROM public.swell_customers
      ON CONFLICT (store_id) DO UPDATE SET
        payload = EXCLUDED.payload,
        source_updated_at = EXCLUDED.source_updated_at,
        imported_at = EXCLUDED.imported_at,
        auth_uid = COALESCE(EXCLUDED.auth_uid, public.store_customers.auth_uid);
    DROP TABLE public.swell_customers;
    ALTER TABLE public.store_customer_activity
      ADD CONSTRAINT store_customer_activity_customer_id_fkey
      FOREIGN KEY (customer_id) REFERENCES public.store_customers(store_id)
      ON DELETE CASCADE;
  END IF;

  IF to_regclass('public.swell_orders') IS NOT NULL THEN
    INSERT INTO public.store_orders (store_id, payload, source_updated_at, imported_at)
      SELECT swell_id, payload, source_updated_at, imported_at
      FROM public.swell_orders
      ON CONFLICT (store_id) DO UPDATE SET
        payload = EXCLUDED.payload,
        source_updated_at = EXCLUDED.source_updated_at,
        imported_at = EXCLUDED.imported_at;
    DROP TABLE public.swell_orders;
  END IF;

  IF to_regclass('public.swell_discounts') IS NOT NULL THEN
    INSERT INTO public.store_discounts (store_id, payload, source_updated_at, imported_at)
      SELECT swell_id, payload, source_updated_at, imported_at
      FROM public.swell_discounts
      ON CONFLICT (store_id) DO UPDATE SET
        payload = EXCLUDED.payload,
        source_updated_at = EXCLUDED.source_updated_at,
        imported_at = EXCLUDED.imported_at;
    DROP TABLE public.swell_discounts;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'store_products' AND column_name = 'swell_id'
  ) THEN
    ALTER TABLE public.store_products RENAME COLUMN swell_id TO store_id;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'store_variants' AND column_name = 'swell_id'
  ) THEN
    ALTER TABLE public.store_variants RENAME COLUMN swell_id TO store_id;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'store_categories' AND column_name = 'swell_id'
  ) THEN
    ALTER TABLE public.store_categories RENAME COLUMN swell_id TO store_id;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'store_customers' AND column_name = 'swell_id'
  ) THEN
    ALTER TABLE public.store_customers RENAME COLUMN swell_id TO store_id;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'store_orders' AND column_name = 'swell_id'
  ) THEN
    ALTER TABLE public.store_orders RENAME COLUMN swell_id TO store_id;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'store_discounts' AND column_name = 'swell_id'
  ) THEN
    ALTER TABLE public.store_discounts RENAME COLUMN swell_id TO store_id;
  END IF;
END $$;
