import "server-only";

import { randomUUID } from "node:crypto";
import { queryNeon } from "@/lib/neon-db";

export type StoreRecord = {
  swell_id: string;
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
    SELECT jsonb_agg((v.payload - 'source_data') ORDER BY v.swell_id) AS results
    FROM swell_variants v
    WHERE v.parent_id = p.swell_id
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

function nowIso(): string {
  return new Date().toISOString();
}

export async function listStoreRecords(
  table: "swell_products" | "swell_categories" | "swell_customers" | "swell_orders" | "swell_discounts",
  search = "",
  limit = 100,
): Promise<StoreRecord[]> {
  const term = search.trim();
  if (!term) {
    return queryNeon<StoreRecord>(
      `SELECT swell_id, payload, source_updated_at
       FROM ${table}
       ORDER BY imported_at DESC, swell_id
       LIMIT $1`,
      [Math.min(500, Math.max(1, limit))],
    );
  }
  return queryNeon<StoreRecord>(
    `SELECT swell_id, payload, source_updated_at
     FROM ${table}
     WHERE payload::text ILIKE $1
     ORDER BY imported_at DESC, swell_id
     LIMIT $2`,
    [`%${term}%`, Math.min(500, Math.max(1, limit))],
  );
}

export async function getStoreRecord(
  table: "swell_products" | "swell_categories" | "swell_customers" | "swell_orders" | "swell_discounts",
  id: string,
): Promise<StoreRecord | null> {
  const [record] = await queryNeon<StoreRecord>(
    `SELECT swell_id, payload, source_updated_at
     FROM ${table}
     WHERE swell_id = $1`,
    [id],
  );
  return record ?? null;
}

export async function saveStoreRecord(
  table: "swell_products" | "swell_categories" | "swell_orders" | "swell_discounts",
  id: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await queryNeon(
    `INSERT INTO ${table} (swell_id, payload, source_updated_at, imported_at)
     VALUES ($1, $2::jsonb, $3, now())
     ON CONFLICT (swell_id) DO UPDATE SET
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
    `INSERT INTO swell_orders (swell_id, payload, source_updated_at, imported_at)
     VALUES ($1, $2::jsonb, now(), now())
     ON CONFLICT (swell_id) DO NOTHING`,
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
        await queryNeon<{ swell_id: string }>(
          "SELECT swell_id FROM swell_categories WHERE payload ->> 'slug' = $1 LIMIT 1",
          [categorySlug],
        )
      )[0]?.swell_id
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
       FROM swell_products p
       ${STOREFRONT_PRODUCT_VARIANTS_JOIN}
       WHERE ${ACTIVE_PRODUCT_FILTER} ${whereCategory}
       ORDER BY p.payload ->> 'name', p.swell_id
       LIMIT $1 OFFSET $2`,
      values,
    ),
    queryNeon<{ count: string }>(
      `SELECT count(*)::text AS count FROM swell_products p
       WHERE ${ACTIVE_PRODUCT_FILTER} ${countWhereCategory}`,
      categoryId ? [categoryId] : [],
    ),
  ]);
  return {
    products: records.map(({ payload }) => payload),
    total: Number(count),
  };
}

export async function getAllActiveProducts(): Promise<Record<string, unknown>[]> {
  const records = await queryNeon<{ payload: Record<string, unknown> }>(
    `SELECT ${STOREFRONT_PRODUCT_WITH_VARIANTS} AS payload
     FROM swell_products p
     ${STOREFRONT_PRODUCT_VARIANTS_JOIN}
     WHERE ${ACTIVE_PRODUCT_FILTER}
     ORDER BY p.payload ->> 'name', p.swell_id`,
  );
  return records.map(({ payload }) => payload);
}

export async function getActiveProductsBySkus(
  skus: readonly string[],
): Promise<Array<{ swell_id: string; sku: string; payload: Record<string, unknown> }>> {
  const normalizedSkus = [...new Set(skus.map((sku) => sku.toUpperCase()).filter(Boolean))];
  if (normalizedSkus.length === 0) return [];

  return queryNeon<{
    swell_id: string;
    sku: string;
    payload: Record<string, unknown>;
  }>(
    `SELECT p.swell_id,
            ${PRODUCT_SKU_EXPRESSION} AS sku,
            ${STOREFRONT_PRODUCT_WITH_VARIANTS} AS payload
     FROM swell_products p
     ${STOREFRONT_PRODUCT_VARIANTS_JOIN}
     WHERE ${ACTIVE_PRODUCT_FILTER}
       AND upper(${PRODUCT_SKU_EXPRESSION}) = ANY($1::text[])
     ORDER BY p.payload ->> 'name', p.swell_id`,
    [normalizedSkus],
  );
}

export async function getProductsByIds(
  ids: readonly string[],
): Promise<Array<{ swell_id: string; payload: Record<string, unknown> }>> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  return queryNeon<{ swell_id: string; payload: Record<string, unknown> }>(
    `SELECT p.swell_id,
            ${STOREFRONT_PRODUCT_WITH_VARIANTS} AS payload
     FROM swell_products p
     ${STOREFRONT_PRODUCT_VARIANTS_JOIN}
     WHERE p.swell_id = ANY($1::text[])
     ORDER BY p.swell_id`,
    [uniqueIds],
  );
}

export async function getActiveProductSlugs(): Promise<string[]> {
  const rows = await queryNeon<{ slug: string }>(
    `SELECT p.payload ->> 'slug' AS slug
     FROM swell_products p
     WHERE ${ACTIVE_PRODUCT_FILTER}
       AND jsonb_typeof(p.payload -> 'slug') = 'string'
     ORDER BY p.payload ->> 'name', p.swell_id`,
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
    `SELECT p.swell_id,
            (p.payload - 'source_data') AS payload,
            p.source_updated_at
     FROM swell_products p
     ${where}
     ORDER BY p.imported_at DESC, p.swell_id
     LIMIT ${limitParameter}`,
    values,
  );
}

export async function getCategories(): Promise<
  Array<Record<string, unknown> & { id: string }>
> {
  const records = await queryNeon<{ payload: Record<string, unknown> }>(
    "SELECT payload FROM swell_categories ORDER BY COALESCE((payload ->> 'sort')::int, 0), payload ->> 'name'",
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
    id: "p.swell_id",
  }[field];
  const queryValue = field === "sku" ? value.toUpperCase() : value;
  const [record] = await queryNeon<{ payload: Record<string, unknown> }>(
    `SELECT ${STOREFRONT_PRODUCT_WITH_VARIANTS} AS payload
     FROM swell_products p
     ${STOREFRONT_PRODUCT_VARIANTS_JOIN}
     WHERE ${expression} = $1
     LIMIT 1`,
    [queryValue],
  );
  return record?.payload ?? null;
}

export async function getAccountById(id: string): Promise<AccountRecord | null> {
  const record = await getStoreRecord("swell_customers", id);
  return record ? ({ ...record.payload, id } as AccountRecord) : null;
}

export async function getAccountByEmail(email: string): Promise<AccountRecord | null> {
  const [row] = await queryNeon<StoreRecord & { auth_uid: string | null }>(
    "SELECT swell_id, payload, source_updated_at, auth_uid FROM swell_customers WHERE lower(payload ->> 'email') = lower($1) LIMIT 1",
    [email],
  );
  return row
    ? ({ ...row.payload, id: row.swell_id, auth_uid: row.auth_uid } as AccountRecord)
    : null;
}

export async function getAccountByAuthUid(uid: string): Promise<AccountRecord | null> {
  const [row] = await queryNeon<StoreRecord & { auth_uid: string | null }>(
    "SELECT c.swell_id, c.payload, c.source_updated_at, c.auth_uid FROM swell_customers c WHERE c.auth_uid = $1 LIMIT 1",
    [uid],
  );
  return row
    ? ({ ...row.payload, id: row.swell_id, auth_uid: row.auth_uid } as AccountRecord)
    : null;
}

export async function linkAccountAuthUid(id: string, uid: string): Promise<boolean> {
  const [linked] = await queryNeon<{ swell_id: string }>(
    `UPDATE swell_customers
     SET auth_uid = $2
     WHERE swell_id = $1 AND (auth_uid IS NULL OR auth_uid = $2)
     RETURNING swell_id`,
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
    `INSERT INTO swell_customers (swell_id, payload, auth_uid, source_updated_at)
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
    `UPDATE swell_customers
     SET payload = payload || $2::jsonb || jsonb_build_object('date_updated', now()::text),
         source_updated_at = now(),
         imported_at = now()
     WHERE swell_id = $1
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

