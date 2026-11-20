import "server-only";

import { randomUUID } from "node:crypto";
import { queryNeon } from "@/lib/neon-db";

export type StoreRecord = {
  store_id: string;
  payload: Record<string, unknown>;
  source_updated_at: Date | null;
};

export type AccountRecord = {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email_optin?: boolean;
  date_created?: string;
  date_updated?: string;
  auth_uid?: string | null;
  [key: string]: unknown;
};

const STOREFRONT_PRODUCT_VARIANTS_JOIN = `
  LEFT JOIN LATERAL (
    SELECT jsonb_agg((v.payload - 'source_data') ORDER BY v.store_id) AS results
    FROM store_variants v
    WHERE v.parent_id = p.store_id
  ) variant_records ON true`;

const STOREFRONT_PRODUCT_WITH_VARIANTS = `CASE
  WHEN variant_records.results IS NULL THEN p.payload - 'source_data'
  ELSE jsonb_set(
    p.payload - 'source_data',
    '{variants}',
    jsonb_build_object('results', variant_records.results),
    true
  )
END`;

const ACTIVE_PRODUCT_FILTER =
  "COALESCE(p.payload ->> 'active', 'true') NOT IN ('false', '0')";
const PRODUCT_SKU_EXPRESSION =
  "COALESCE(p.payload ->> 'sku', p.payload -> 'attributes' ->> 'sku', p.payload -> 'attributes' ->> 'product_sku')";
const SEARCHABLE_PRODUCT_TEXT = `lower(concat_ws(
  ' ',
  p.payload ->> 'name',
  ${PRODUCT_SKU_EXPRESSION},
  p.payload ->> 'description',
  p.payload -> 'attributes' ->> 'product_story',
  p.payload -> 'attributes' ->> 'metal_type',
  p.payload -> 'attributes' ->> 'metal_color',
  p.payload -> 'attributes' ->> 'gemstone_type',
  p.payload -> 'attributes' ->> 'diamond_clarity',
  p.payload -> 'attributes' ->> 'diamond_carat',
  p.payload -> 'attributes' ->> 'stone_shape',
  p.payload -> 'attributes' ->> 'diamond_cut',
  COALESCE((
    SELECT string_agg(detail.value, ' ')
    FROM jsonb_array_elements(
      CASE
        WHEN jsonb_typeof(p.payload -> 'stone_details') = 'array'
          THEN p.payload -> 'stone_details'
        ELSE '[]'::jsonb
      END
    ) AS stone_detail(value)
    CROSS JOIN LATERAL jsonb_each_text(
      CASE
        WHEN jsonb_typeof(stone_detail.value) = 'object'
          THEN stone_detail.value
        ELSE '{}'::jsonb
      END
    ) AS detail(key, value)
  ), '')
))`;

function nowIso(): string {
  return new Date().toISOString();
}

export async function listStoreRecords(
  table: "store_products" | "store_categories" | "store_customers" | "store_orders" | "store_discounts",
  search = "",
  limit = 100,
): Promise<StoreRecord[]> {
  const term = search.trim();
  if (!term) {
    return queryNeon<StoreRecord>(
      `SELECT store_id, payload, source_updated_at
       FROM ${table}
       ORDER BY imported_at DESC, store_id
       LIMIT $1`,
      [Math.min(500, Math.max(1, limit))],
    );
  }
  return queryNeon<StoreRecord>(
    `SELECT store_id, payload, source_updated_at
     FROM ${table}
     WHERE payload::text ILIKE $1
     ORDER BY imported_at DESC, store_id
     LIMIT $2`,
    [`%${term}%`, Math.min(500, Math.max(1, limit))],
  );
}

export async function getStoreRecord(
  table: "store_products" | "store_categories" | "store_customers" | "store_orders" | "store_discounts",
  id: string,
): Promise<StoreRecord | null> {
  const [record] = await queryNeon<StoreRecord>(
    `SELECT store_id, payload, source_updated_at
     FROM ${table}
     WHERE store_id = $1`,
    [id],
  );
  return record ?? null;
}

export async function saveStoreRecord(
  table: "store_products" | "store_categories" | "store_orders" | "store_discounts",
  id: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await queryNeon(
    `INSERT INTO ${table} (store_id, payload, source_updated_at, imported_at)
     VALUES ($1, $2::jsonb, $3, now())
     ON CONFLICT (store_id) DO UPDATE SET
       payload = EXCLUDED.payload,
       source_updated_at = EXCLUDED.source_updated_at,
       imported_at = now()`,
    [id, JSON.stringify(payload), nowIso()],
  );
}

export async function saveOrderEnquiry(
  requestId: string,
  order: Record<string, unknown>,
): Promise<void> {
  const id = `enquiry-${requestId}`;
  await queryNeon(
    `INSERT INTO store_orders (store_id, payload, source_updated_at, imported_at)
     VALUES ($1, $2::jsonb, now(), now())
     ON CONFLICT (store_id) DO NOTHING`,
    [id, JSON.stringify({ ...order, id, type: "order-enquiry" })],
  );
}

export async function getProductsPage(
  categorySlug: string | undefined,
  page: number,
  limit: number,
): Promise<{ products: Record<string, unknown>[]; total: number }> {
  const categoryId = categorySlug
    ? (
        await queryNeon<{ store_id: string }>(
          "SELECT store_id FROM store_categories WHERE payload ->> 'slug' = $1 LIMIT 1",
          [categorySlug],
        )
      )[0]?.store_id
    : undefined;
  if (categorySlug && !categoryId) {
    return { products: [], total: 0 };
  }

  const whereCategory = categoryId
    ? "AND (p.payload ->> 'category_id' = $3 OR p.payload -> 'categories' @> to_jsonb(ARRAY[$3]::text[]))"
    : "";
  const countWhereCategory = categoryId
    ? "AND (p.payload ->> 'category_id' = $1 OR p.payload -> 'categories' @> to_jsonb(ARRAY[$1]::text[]))"
    : "";
  const values = categoryId
    ? [limit, (page - 1) * limit, categoryId]
    : [limit, (page - 1) * limit];
  const [records, [{ count }]] = await Promise.all([
    queryNeon<{ payload: Record<string, unknown> }>(
      `SELECT ${STOREFRONT_PRODUCT_WITH_VARIANTS} AS payload
       FROM store_products p
       ${STOREFRONT_PRODUCT_VARIANTS_JOIN}
       WHERE ${ACTIVE_PRODUCT_FILTER} ${whereCategory}
       ORDER BY p.payload ->> 'name', p.store_id
       LIMIT $1 OFFSET $2`,
      values,
    ),
    queryNeon<{ count: string }>(
      `SELECT count(*)::text AS count FROM store_products p
       WHERE ${ACTIVE_PRODUCT_FILTER} ${countWhereCategory}`,
      categoryId ? [categoryId] : [],
    ),
  ]);
  return {
    products: records.map(({ payload }) => payload),
    total: Number(count),
  };
}

export async function searchActiveProducts(
  terms: readonly string[],
): Promise<Record<string, unknown>[]> {
  const normalizedTerms = [...new Set(terms.map((term) => term.trim().toLowerCase()).filter(Boolean))];
  if (normalizedTerms.length === 0) return [];

  const records = await queryNeon<{ payload: Record<string, unknown> }>(
    `SELECT ${STOREFRONT_PRODUCT_WITH_VARIANTS} AS payload
     FROM store_products p
     ${STOREFRONT_PRODUCT_VARIANTS_JOIN}
     WHERE ${ACTIVE_PRODUCT_FILTER}
       AND NOT EXISTS (
         SELECT 1
         FROM unnest($1::text[]) AS search_term(term)
         WHERE strpos(${SEARCHABLE_PRODUCT_TEXT}, search_term.term) = 0
       )
     ORDER BY p.payload ->> 'name', p.store_id
     LIMIT 100`,
    [normalizedTerms],
  );
  return records.map(({ payload }) => payload);
}

export async function getAllActiveProducts(): Promise<Record<string, unknown>[]> {
  const records = await queryNeon<{ payload: Record<string, unknown> }>(
    `SELECT ${STOREFRONT_PRODUCT_WITH_VARIANTS} AS payload
     FROM store_products p
     ${STOREFRONT_PRODUCT_VARIANTS_JOIN}
     WHERE ${ACTIVE_PRODUCT_FILTER}
     ORDER BY p.payload ->> 'name', p.store_id`,
  );
  return records.map(({ payload }) => payload);
}

export async function getActiveProductsBySkus(
  skus: readonly string[],
): Promise<Array<{ store_id: string; sku: string; payload: Record<string, unknown> }>> {
  const normalizedSkus = [...new Set(skus.map((sku) => sku.toUpperCase()).filter(Boolean))];
  if (normalizedSkus.length === 0) return [];

  return queryNeon<{
    store_id: string;
    sku: string;
    payload: Record<string, unknown>;
  }>(
    `SELECT p.store_id,
            ${PRODUCT_SKU_EXPRESSION} AS sku,
            ${STOREFRONT_PRODUCT_WITH_VARIANTS} AS payload
     FROM store_products p
     ${STOREFRONT_PRODUCT_VARIANTS_JOIN}
     WHERE ${ACTIVE_PRODUCT_FILTER}
       AND upper(${PRODUCT_SKU_EXPRESSION}) = ANY($1::text[])
     ORDER BY p.payload ->> 'name', p.store_id`,
    [normalizedSkus],
  );
}

export async function getProductsByIds(
  ids: readonly string[],
): Promise<Array<{ store_id: string; payload: Record<string, unknown> }>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  return queryNeon<{ store_id: string; payload: Record<string, unknown> }>(
    `SELECT p.store_id,
            ${STOREFRONT_PRODUCT_WITH_VARIANTS} AS payload
     FROM store_products p
     ${STOREFRONT_PRODUCT_VARIANTS_JOIN}
     WHERE p.store_id = ANY($1::text[])
     ORDER BY p.store_id`,
    [uniqueIds],
  );
}

export async function getActiveProductSlugs(): Promise<string[]> {
  const rows = await queryNeon<{ slug: string }>(
    `SELECT p.payload ->> 'slug' AS slug
     FROM store_products p
     WHERE ${ACTIVE_PRODUCT_FILTER}
       AND jsonb_typeof(p.payload -> 'slug') = 'string'
     ORDER BY p.payload ->> 'name', p.store_id`,
  );
  return rows.map(({ slug }) => slug);
}

export async function listProducts(
  search = "",
  limit = 100,
): Promise<StoreRecord[]> {
  const term = search.trim();
  const boundedLimit = Math.min(500, Math.max(1, limit));
  const where = term ? "WHERE p.payload::text ILIKE $1" : "";
  const values = term
    ? [`%${term}%`, boundedLimit]
    : [boundedLimit];
  const limitParameter = term ? "$2" : "$1";
  return queryNeon<StoreRecord>(
    `SELECT p.store_id,
            (p.payload - 'source_data') AS payload,
            p.source_updated_at
     FROM store_products p
     ${where}
     ORDER BY p.imported_at DESC, p.store_id
     LIMIT ${limitParameter}`,
    values,
  );
}

export async function getCategories(): Promise<
  Array<Record<string, unknown> & { id: string }>
> {
  const records = await queryNeon<{ payload: Record<string, unknown> }>(
    "SELECT payload FROM store_categories ORDER BY COALESCE((payload ->> 'sort')::int, 0), payload ->> 'name'",
  );
  return records.map(({ payload }) => ({
    ...payload,
    id: String(payload.id ?? ""),
  }));
}

export async function findProduct(
  field: "slug" | "sku" | "id",
  value: string,
): Promise<Record<string, unknown> | null> {
  const expression = {
    slug: "p.payload ->> 'slug'",
    sku: "upper(p.payload ->> 'sku')",
    id: "p.store_id",
  }[field];
  const queryValue = field === "sku" ? value.toUpperCase() : value;
  const [record] = await queryNeon<{ payload: Record<string, unknown> }>(
    `SELECT ${STOREFRONT_PRODUCT_WITH_VARIANTS} AS payload
     FROM store_products p
     ${STOREFRONT_PRODUCT_VARIANTS_JOIN}
     WHERE ${expression} = $1
     LIMIT 1`,
    [queryValue],
  );
  return record?.payload ?? null;
}

export async function getAccountById(id: string): Promise<AccountRecord | null> {
  const record = await getStoreRecord("store_customers", id);
  return record ? ({ ...record.payload, id } as AccountRecord) : null;
}

export async function getAccountByEmail(email: string): Promise<AccountRecord | null> {
  const [row] = await queryNeon<StoreRecord & { auth_uid: string | null }>(
    "SELECT store_id, payload, source_updated_at, auth_uid FROM store_customers WHERE lower(payload ->> 'email') = lower($1) LIMIT 1",
    [email],
  );
  return row
    ? ({ ...row.payload, id: row.store_id, auth_uid: row.auth_uid } as AccountRecord)
    : null;
}

export async function getAccountByAuthUid(uid: string): Promise<AccountRecord | null> {
  const [row] = await queryNeon<StoreRecord & { auth_uid: string | null }>(
    "SELECT c.store_id, c.payload, c.source_updated_at, c.auth_uid FROM store_customers c WHERE c.auth_uid = $1 LIMIT 1",
    [uid],
  );
  return row
    ? ({ ...row.payload, id: row.store_id, auth_uid: row.auth_uid } as AccountRecord)
    : null;
}

export async function linkAccountAuthUid(id: string, uid: string): Promise<boolean> {
  const [linked] = await queryNeon<{ store_id: string }>(
    `UPDATE store_customers
     SET auth_uid = $2
     WHERE store_id = $1 AND (auth_uid IS NULL OR auth_uid = $2)
     RETURNING store_id`,
    [id, uid],
  );
  if (linked) return true;

  const existing = await getAccountByAuthUid(uid);
  return existing?.id === id;
}

export async function createAccount(
  input: Partial<AccountRecord> & { email: string },
  authUid?: string,
): Promise<AccountRecord> {
  const id = randomUUID();
  const payload = {
    ...input,
    id,
    email: input.email.trim().toLowerCase(),
    date_created: nowIso(),
    date_updated: nowIso(),
  };
  await queryNeon(
    `INSERT INTO store_customers (store_id, payload, auth_uid, source_updated_at)
     VALUES ($1, $2::jsonb, $3, now())`,
    [id, JSON.stringify(payload), authUid ?? null],
  );
  return payload as AccountRecord;
}

export async function updateAccount(
  id: string,
  input: Partial<AccountRecord>,
): Promise<AccountRecord | null> {
  const [row] = await queryNeon<{ payload: Record<string, unknown> }>(
    `UPDATE store_customers
     SET payload = payload || $2::jsonb || jsonb_build_object('date_updated', now()::text),
         source_updated_at = now(),
         imported_at = now()
     WHERE store_id = $1
     RETURNING payload`,
    [id, JSON.stringify(input)],
  );
  return row ? ({ ...row.payload, id } as AccountRecord) : null;
}

export async function upsertCustomerActivity(
  customerId: string,
  cart: unknown[],
  wishlist: string[],
): Promise<void> {
  await queryNeon(
    `INSERT INTO store_customer_activity (customer_id, cart, wishlist, updated_at)
     VALUES ($1, $2::jsonb, $3::jsonb, now())
     ON CONFLICT (customer_id) DO UPDATE SET
       cart = EXCLUDED.cart,
       wishlist = EXCLUDED.wishlist,
       updated_at = now()`,
    [customerId, JSON.stringify(cart), JSON.stringify(wishlist)],
  );
}

export async function getCustomerActivity(customerId: string): Promise<{
  cart: unknown[];
  wishlist: string[];
}> {
  const [row] = await queryNeon<{ cart: unknown[]; wishlist: string[] }>(
    "SELECT cart, wishlist FROM store_customer_activity WHERE customer_id = $1",
    [customerId],
  );
  return { cart: row?.cart ?? [], wishlist: row?.wishlist ?? [] };
}

