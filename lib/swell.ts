const SWELL_API_URL = "https://api.swell.store";

type SwellRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /**
   * Authenticate with SWELL_SECRET_KEY instead of the public key. Swell
  * rejects the public key on admin/write endpoints (e.g. account, category,
  * product management, and order creation).
   */
  useSecretKey?: boolean;
};

function getSwellCredentials(useSecretKey = false) {
  const storeId = process.env.SWELL_STORE_ID;
  const apiKey = useSecretKey
    ? process.env.SWELL_SECRET_KEY
    : process.env.SWELL_PUBLIC_KEY || process.env.SWELL_SECRET_KEY;

  if (!storeId || !apiKey) {
    const keyName = useSecretKey
      ? "SWELL_SECRET_KEY"
      : "SWELL_PUBLIC_KEY or SWELL_SECRET_KEY";
    throw new Error(
      `Missing Swell configuration. Set SWELL_STORE_ID and ${keyName}.`,
    );
  }

  return { storeId, apiKey };
}

/**
 * Make an authenticated request to the Swell REST API. Pass
 * `useSecretKey: true` for account and admin/write endpoints that require the
 * secret key.
 *
 * Keep this helper on the server. Do not expose the credentials through
 * client-side code or NEXT_PUBLIC_* environment variables.
 */
export async function swellFetch<T>(
  path: string,
  options: SwellRequestOptions = {},
): Promise<T> {
  const { useSecretKey = false, body, headers, ...requestOptions } = options;
  const { storeId, apiKey } = getSwellCredentials(useSecretKey);
  const auth = Buffer.from(`${storeId}:${apiKey}`).toString("base64");

  const response = await fetch(`${SWELL_API_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const responseText = await response.text();
  let responseData: unknown = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    const error = new Error(
      `Swell API request failed with status ${response.status}.`,
    );
    Object.assign(error, {
      status: response.status,
      data: responseData,
    });
    throw error;
  }

  return responseData as T;
}

export interface JewelryProduct {
  name: string;
  slug: string;
  price_inr: number;
  images: string[];
  attributes: {
    metal_type: string;
    metal_color: string;
    metal_weight_gms: number;
    gemstone_type: string;
    diamond_carat: number;
    diamond_clarity: string;
    price_usd: number;
  };
}

/** Catalog feed for the storefront, filtered by a Swell category slug. */
function firstAttributeValue(
  attributes: Record<string, unknown> | undefined,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = attributes?.[key];
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (typeof firstValue === "string" || typeof firstValue === "number") {
      return String(firstValue);
    }
  }
  return undefined;
}

function mapSwellProduct(product: SwellProduct): JewelryProduct {
  const attributes = product.attributes;
  const priceUsd = product.price ?? 0;
  const metalType = firstAttributeValue(attributes, ["metal_type", "metal"]);
  const gemstoneType = firstAttributeValue(attributes, [
    "gemstone_type",
    "gemstone",
  ]);
  const images = (product.images ?? [])
    .map((image) => image.file?.url)
    .filter((url): url is string => Boolean(url));

  return {
    name: product.name ?? product.slug ?? "Untitled product",
    slug: product.slug ?? product.id,
    price_inr: Math.round(priceUsd * 83),
    images,
    attributes: {
      metal_type: metalType ?? "Gold",
      metal_color:
        firstAttributeValue(attributes, ["metal_color", "color"]) ?? "Yellow",
      metal_weight_gms: Number(
        firstAttributeValue(attributes, ["metal_weight_gms", "gross_weight"]) ??
          0,
      ),
      gemstone_type: gemstoneType ?? "None",
      diamond_carat: Number(
        firstAttributeValue(attributes, ["diamond_carat"]) ?? 0,
      ),
      diamond_clarity:
        firstAttributeValue(attributes, ["diamond_clarity"]) ?? "N/A",
      price_usd: priceUsd,
    },
  };
}

/** Fetch active Swell products, optionally narrowed to a category slug. */
export async function getJewelryProducts(
  categorySlug?: string,
): Promise<JewelryProduct[]> {
  let categoryId: string | undefined;
  if (categorySlug) {
    const categories = await swellFetch<SwellCategoryListResult>(
      "/categories?limit=100",
      { useSecretKey: true },
    );
    categoryId = categories.results.find(
      (category) => category.slug === categorySlug,
    )?.id;
  }

  const params = new URLSearchParams({
    limit: "100",
    where: JSON.stringify({ active: true }),
  });
  if (categoryId) {
    params.set("categories", categoryId);
  }

  const result = await swellFetch<SwellProductListResult>(
    `/products?${params.toString()}`,
    { useSecretKey: true },
  );
  return result.results.map(mapSwellProduct);
}

/** Category shape consumed by the storefront header navigation. */
export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

/**
 * Header navigation categories for the storefront, sourced from the Swell
 * categories API. Includes parent relationships so the header can render
 * nested categories. Server-only: this call requires the store credentials.
 */
export async function getStoreCategories(): Promise<StoreCategory[]> {
  try {
    const result = await swellFetch<SwellCategoryListResult>(
      "/categories?limit=100",
      {
        useSecretKey: true,
      },
    );
    return result.results
      .filter((category) => category.active !== false)
      .map(({ id, name, slug, parent_id }) => ({
        id,
        name,
        slug,
        parentId: parent_id ?? null,
      }));
  } catch {
    return [];
  }
}

export interface CustomQuoteRequest {
  productSlug: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

/** Temporary enquiry handler until an email or CRM destination is configured. */
export async function submitCustomQuoteRequest(
  request: CustomQuoteRequest,
): Promise<{ ok: true }> {
  void request;
  return { ok: true };
}

export interface SwellAccount {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email_optin?: boolean;
  date_created?: string;
  date_updated?: string;
}

export type SwellAccountInput = {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

/**
 * Create an account in the Swell store. Swell bcrypt-encrypts the password
 * before storing it. Server-only: this call requires the store credentials.
 */
export async function createSwellAccount(
  input: SwellAccountInput,
): Promise<SwellAccount> {
  return swellFetch<SwellAccount>("/accounts", {
    method: "POST",
    body: input,
    useSecretKey: true,
  });
}

/**
 * Verify credentials against the Swell store. `:login` is a literal
 * pseudo-id path segment on the accounts endpoint, with the email and
 * password passed as query params. Returns the account record on a match,
 * or null when the credentials do not belong to any account.
 *
 * Swell does not issue a session token — the app is responsible for
 * keeping the user logged in (see src/lib/session.ts).
 */
export async function loginSwellAccount(
  email: string,
  password: string,
): Promise<SwellAccount | null> {
  const query = new URLSearchParams({ email, password });
  const account = await swellFetch<SwellAccount | null>(
    `/accounts/:login?${query.toString()}`,
    { useSecretKey: true },
  );
  return account ?? null;
}

/**
 * Retrieve an account by id. Server-only: this call requires the store
 * credentials.
 */
export async function getSwellAccount(
  accountId: string,
): Promise<SwellAccount | null> {
  const account = await swellFetch<SwellAccount | null>(
    `/accounts/${encodeURIComponent(accountId)}`,
    { useSecretKey: true },
  );
  return account ?? null;
}

/**
 * Update an account by id (same writable fields as creation, minus the
 * password rules). Server-only: this call requires the store credentials.
 */
export async function updateSwellAccount(
  accountId: string,
  input: Partial<Omit<SwellAccountInput, "password">>,
): Promise<SwellAccount> {
  return swellFetch<SwellAccount>(
    `/accounts/${encodeURIComponent(accountId)}`,
    {
      method: "PUT",
      body: input,
      useSecretKey: true,
    },
  );
}

/* ---------------------------------------------------------------------------
 * Variants — https://developers.swell.is/backend-api/variants
 *
 * Variants are namespaced under `products:variants` (the colon is a literal
 * path segment, same convention as the `:login` pseudo-id on accounts).
 * Server-only: these calls require the store credentials.
 * ------------------------------------------------------------------------- */

export interface SwellVariantPriceRule {
  /** Conditional price; required within each rule. */
  price: number;
  /** Restrict the rule to an account group. */
  account_group?: string;
  /** Apply the rule up to this quantity (inclusive). */
  quantity_max?: number;
  /** Apply the rule from this quantity (inclusive). */
  quantity_min?: number;
}

export interface SwellVariantImage {
  id?: string;
  caption?: string;
  file?: Record<string, unknown>;
}

export interface SwellVariantInput {
  /** Human-friendly label; defaults to the combined option names. */
  name?: string;
  /** The parent product's id. Required when creating a variant. */
  parent_id: string;
  /** Whether the variant is visible on the storefront. */
  active?: boolean;
  /** Custom attribute values; overrides the product's attributes. */
  attributes?: Record<string, unknown>;
  /** Cost of goods, for margin calculations. */
  cost?: number;
  images?: SwellVariantImage[];
  /** Option value ids that make up this variant. */
  option_value_ids?: string[];
  /** Default list price. */
  price?: number;
  /** Conditional price rules (account group / quantity breaks). */
  prices?: SwellVariantPriceRule[];
  /** Whether the sale price applies. */
  sale?: boolean;
  /** Used when `sale` is true. */
  sale_price?: number;
  /** Overrides the product's shipping weight. */
  shipment_weight?: number;
  /** Warehouse inventory code. */
  sku?: string;
}

export interface SwellVariant extends SwellVariantInput {
  id: string;
  code?: string;
  /** Three-letter ISO code; defaults to the store base currency. */
  currency?: string;
  date_created?: string;
  date_updated?: string;
  /** Non-sale price. */
  orig_price?: number;
  stock_level?: number;
  stock_level_in_locations?: number;
}

export interface SwellVariantFetchOptions {
  /** Related records to expand, e.g. ["parent", "prices"]. */
  expand?: string[];
  /** Fields to limit the response to, e.g. ["name", "price"]. id is always returned. */
  fields?: string[];
}

/**
 * Query params accepted by the variant list endpoint. `where` is passed
 * through to Swell's filter syntax (e.g. { active: true, price: { $gt: 100 } }).
 */
export interface SwellVariantListQuery extends SwellVariantFetchOptions {
  /** Filter object, e.g. { active: true }. Supports $eq, $ne, $gt, ... operators. */
  where?: Record<string, unknown>;
  /** Full-text search across variant fields. */
  search?: string;
  /** Page size between 1 and 1000. Defaults to 15 server-side. */
  limit?: number;
  /** 1-based page number. */
  page?: number;
  /** SQL-like sort expression, e.g. "name asc". */
  sort?: string;
  /** Related records to include, e.g. ["parent"]. */
  include?: string[];
}

export interface SwellVariantListResult {
  count: number;
  page: number;
  pages: Record<string, { start: number; end: number }>;
  results: SwellVariant[];
}

/**
 * Update payload for PUT /products:variants/:id — the call merges, so only
 * changed fields are needed. parent_id can't change after creation.
 */
export type SwellVariantUpdateInput = Partial<
  Omit<SwellVariantInput, "parent_id">
> & {
  /**
   * Replace fields wholesale instead of merging. Required to explicitly
   * override array fields — e.g. { $set: { option_value_ids: [...] } }
   * replaces the option values instead of merging them.
   */
  $set?: Partial<Omit<SwellVariantInput, "parent_id">>;
};

/**
 * Create a variant under its parent product. Server-only: this call
 * requires the store's secret key.
 */
export async function createSwellVariant(
  input: SwellVariantInput,
): Promise<SwellVariant> {
  return swellFetch<SwellVariant>("/v1/products:variants", {
    method: "POST",
    body: input,
    useSecretKey: true,
  });
}

/**
 * Serialize variant fetch/list params into a query string. Nested objects and
 * arrays use bracket notation — `where[active]=true`, `expand[0]=parent` —
 * matching how Swell's own JS clients serialize params, rather than
 * JSON-encoding whole values.
 */
function buildSwellVariantQuery(
  params: SwellVariantFetchOptions | SwellVariantListQuery,
): string {
  const search = new URLSearchParams();

  const appendParam = (name: string, value: unknown): void => {
    if (value === undefined || value === null) {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => appendParam(`${name}[${index}]`, item));
    } else if (typeof value === "object") {
      for (const [key, item] of Object.entries(value)) {
        appendParam(`${name}[${key}]`, item);
      }
    } else {
      search.set(name, String(value));
    }
  };

  for (const [key, value] of Object.entries(params)) {
    appendParam(key, value);
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

/**
 * Retrieve a variant by id, or null when the id does not match any variant.
 * Server-only: this call requires the store credentials.
 */
export async function getSwellVariant(
  variantId: string,
  options: SwellVariantFetchOptions = {},
): Promise<SwellVariant | null> {
  const query = buildSwellVariantQuery(options);
  const variant = await swellFetch<SwellVariant | null>(
    `/v1/products:variants/${encodeURIComponent(variantId)}${query}`,
  );
  return variant ?? null;
}

/**
 * Update a variant by id. Updating performs a merge operation, so pass only
 * the fields that change; to explicitly override values such as arrays, use
 * the $set operator — e.g. { $set: { option_value_ids: [...] } } replaces the
 * option values instead of merging them. Server-only: this call requires the
 * store's secret key.
 */
export async function updateSwellVariant(
  variantId: string,
  input: SwellVariantUpdateInput,
): Promise<SwellVariant> {
  return swellFetch<SwellVariant>(
    `/v1/products:variants/${encodeURIComponent(variantId)}`,
    {
      method: "PUT",
      body: input,
      useSecretKey: true,
    },
  );
}

/**
 * List all variants with optional filtering, search, and pagination. Returns
 * Swell's paginated collection envelope. Server-only: this call requires the
 * store credentials.
 */
export async function listSwellVariants(
  options: SwellVariantListQuery = {},
): Promise<SwellVariantListResult> {
  const query = buildSwellVariantQuery(options);
  return swellFetch<SwellVariantListResult>(`/v1/products:variants${query}`);
}

/**
 * Delete a variant by id and return the deleted record. Try to avoid
 * deleting variants that have been sold to a customer, as the link to
 * existing orders will be broken. Server-only: this call requires the
 * store's secret key.
 */
export async function deleteSwellVariant(
  variantId: string,
): Promise<SwellVariant> {
  return swellFetch<SwellVariant>(
    `/v1/products:variants/${encodeURIComponent(variantId)}`,
    { method: "DELETE", useSecretKey: true },
  );
}

/**
 * Serialize query params for the Swell REST API. Structured values (objects,
 * arrays) are JSON-encoded to match how the API expects them, e.g.
 * `where={"active":true}`.
 */
function buildSwellQuery(
  params:
    | SwellCategoryFetchOptions
    | SwellCategoryListOptions
    | SwellCartFetchOptions
    | SwellCartListOptions,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }
    search.set(
      key,
      typeof value === "object" ? JSON.stringify(value) : String(value),
    );
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

export type SwellCategorySorting =
  | "popularity"
  | "price_asc"
  | "price_desc"
  | "date_asc"
  | "date_desc";

/**
 * Shared image record as returned by the Swell API. On responses the file is
 * already uploaded and carries a CDN-hosted URL (cdn.swell.store).
 */
export interface SwellImage {
  id?: string;
  caption?: string;
  file?: {
    id?: string;
    filename?: string;
    url?: string;
    width?: number;
    height?: number;
    length?: number;
    content_type?: string;
    md5?: string;
  };
}

/** Category record as returned by the Swell API. */
export interface SwellCategory {
  id: string;
  name: string;
  slug: string;
  active?: boolean;
  description?: string;
  parent_id?: string;
  images?: SwellImage[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  sort?: number;
  sorting?: SwellCategorySorting;
  theme_template?: string;
  attributes?: Record<string, unknown>;
  date_created?: string;
  date_updated?: string;
}

/** Writable category fields; `name` is the only one Swell requires. */
export interface SwellCategoryInput {
  name: string;
  slug?: string;
  active?: boolean;
  description?: string;
  parent_id?: string;
  images?: SwellImage[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  sort?: number;
  sorting?: SwellCategorySorting;
  theme_template?: string;
  attributes?: Record<string, unknown>;
}

export interface SwellCategoryFetchOptions {
  /** Related records to expand, e.g. ["parent", "children"]. */
  expand?: string[];
  /** Fields to limit the response to, e.g. ["name", "slug"]. id is always returned. */
  fields?: string[];
}

export interface SwellCategoryListOptions extends SwellCategoryFetchOptions {
  /** Filter object, e.g. { active: true }. Supports $eq, $ne, $gt, ... operators. */
  where?: Record<string, unknown>;
  /** Full-text search across category fields. */
  search?: string;
  /** Page size between 1 and 1000. Defaults to 15 server-side. */
  limit?: number;
  /** 1-based page number. */
  page?: number;
  /** SQL-like sort expression, e.g. "name asc". */
  sort?: string;
}

export interface SwellCategoryListResult {
  count: number;
  page: number;
  pages: Record<string, { start: number; end: number }>;
  results: SwellCategory[];
}

/**
 * Create a category in the Swell store. The slug defaults to a hyphenated,
 * lowercased name (prefixed with the parent slug when nested). Server-only:
 * this call requires the store's secret key.
 */
export async function createSwellCategory(
  input: SwellCategoryInput,
): Promise<SwellCategory> {
  return swellFetch<SwellCategory>("/categories", {
    method: "POST",
    body: input,
    useSecretKey: true,
  });
}

/**
 * Retrieve a category by id, or null when the id does not match any
 * category. Server-only: this call requires the store credentials.
 */
export async function getSwellCategory(
  categoryId: string,
  options: SwellCategoryFetchOptions = {},
): Promise<SwellCategory | null> {
  const query = buildSwellQuery(options);
  const category = await swellFetch<SwellCategory | null>(
    `/categories/${encodeURIComponent(categoryId)}${query}`,
  );
  return category ?? null;
}

/**
 * Update a category by id (same writable fields as creation). Server-only:
 * this call requires the store's secret key.
 */
export async function updateSwellCategory(
  categoryId: string,
  input: Partial<SwellCategoryInput>,
): Promise<SwellCategory> {
  return swellFetch<SwellCategory>(
    `/categories/${encodeURIComponent(categoryId)}`,
    {
      method: "PUT",
      body: input,
      useSecretKey: true,
    },
  );
}

/**
 * List all categories with optional filtering, search, and pagination.
 * Returns Swell's paginated collection envelope. Server-only: this call
 * requires the store credentials.
 */
export async function listSwellCategories(
  options: SwellCategoryListOptions = {},
): Promise<SwellCategoryListResult> {
  const query = buildSwellQuery(options);
  return swellFetch<SwellCategoryListResult>(`/categories${query}`);
}

/**
 * Delete a category by id. Returns the deleted record. Server-only: this
 * call requires the store's secret key.
 */
export async function deleteSwellCategory(
  categoryId: string,
): Promise<SwellCategory> {
  return swellFetch<SwellCategory>(
    `/categories/${encodeURIComponent(categoryId)}`,
    { method: "DELETE", useSecretKey: true },
  );
}

/* ---------------------------------------------------------------------------
 * Products — https://developers.swell.is/backend-api/products
 *
 * Minimal product surface for linking catalog slugs to Swell product ids
 * (cart items reference products by id). Extend into a full products model
 * when the storefront reads its catalog from Swell.
 * Server-only: these calls require the store credentials.
 * ------------------------------------------------------------------------- */

/** Minimal product record; the storefront catalog ships richer fields. */
export interface SwellProduct {
  id: string;
  name?: string;
  slug?: string;
  price?: number;
  currency?: string;
  active?: boolean;
  attributes?: Record<string, unknown>;
  images?: SwellImage[] | null;
  variable?: boolean;
  variants?: {
    results?: SwellProductVariant[];
  };
}

export interface SwellProductVariant {
  id: string;
  active?: boolean;
  option_value_ids?: string[];
}

export interface SwellProductInput {
  name: string;
  slug?: string;
  price?: number;
  currency?: string;
  active?: boolean;
}

export interface SwellProductListResult {
  count: number;
  results: SwellProduct[];
  page?: number;
}

/**
 * Create a product in the Swell store. Server-only: this call requires the
 * store's secret key.
 */
export async function createSwellProduct(
  input: SwellProductInput,
): Promise<SwellProduct> {
  return swellFetch<SwellProduct>("/products", {
    method: "POST",
    body: input,
    useSecretKey: true,
  });
}

/**
 * Find a product by its catalog slug, or null when no product matches.
 * Server-only: this call requires the store credentials.
 */
export async function findSwellProductBySlug(
  slug: string,
): Promise<SwellProduct | null> {
  const params = new URLSearchParams({ search: slug, limit: "100" });
  const result = await swellFetch<SwellProductListResult>(
    `/products?${params.toString()}`,
    { useSecretKey: true },
  );
  const product = result.results.find((item) => item.slug === slug);
  if (!product) {
    return null;
  }

  return swellFetch<SwellProduct>(
    `/products/${encodeURIComponent(product.id)}?expand=variants:100`,
    { useSecretKey: true },
  );
}

/** Retrieve and normalize one live Swell product for the storefront PDP. */
export async function getJewelryProductBySlug(
  slug: string,
): Promise<JewelryProduct | null> {
  const product = await findSwellProductBySlug(slug);
  return product ? mapSwellProduct(product) : null;
}

/* ---------------------------------------------------------------------------
 * Carts — https://developers.swell.is/backend-api/carts
 *
 * A cart holds the items a shopper intends to buy plus billing/shipping
 * info, coupons, and running totals. Carts start "active", are abandoned
 * after roughly 3h of inactivity, and become orders via
 * convertSwellCartToOrder (which marks the cart "converted").
 * Server-only: these calls require the store credentials.
 * ------------------------------------------------------------------------- */

export type SwellCartStatus = "active" | "converted" | "abandoned" | "recovered";

/** Option selection on a cart item; match by id or name, case-insensitive. */
export interface SwellCartItemOption {
  id?: string;
  name?: string;
  /** Selected value id or name. */
  value: string;
  /** Resolved variant; present on cart item responses. */
  variant?: unknown;
}

/**
 * Item payload for cart create/update calls. When adding an item,
 * `product_id` is required; when updating an item already in the cart,
 * reference it by its `id` — not the product id — per the Swell docs.
 */
export interface SwellCartItemInput {
  id?: string;
  product_id?: string;
  /** Resolved from the item's options when omitted. */
  variant_id?: string;
  /** Defaults to 1. */
  quantity?: number;
  options?: SwellCartItemOption[];
  /** Custom price override. */
  price?: number;
  description?: string;
  metadata?: Record<string, unknown>;
}

/** Cart item record as returned by the Swell API. */
export interface SwellCartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  /** Line total (price × quantity, net of item discounts/taxes). */
  price_total: number;
  orig_price?: number;
  discount_each?: number;
  discount_total?: number;
  tax_each?: number;
  tax_total?: number;
  delivery?: boolean;
  shipment_weight?: number;
  options?: SwellCartItemOption[];
  product_name?: string;
  bundle_items?: SwellCartItem[];
  metadata?: Record<string, unknown>;
}

export interface SwellCartAddress {
  name?: string;
  first_name?: string;
  last_name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

/** Shipping address plus the selected delivery service. */
export interface SwellCartShipping extends SwellCartAddress {
  /** Service code, e.g. "standard". */
  service?: string;
  service_name?: string;
  price?: number;
}

/** Writable cart fields (POST /carts). */
export interface SwellCartInput {
  items?: SwellCartItemInput[];
  billing?: SwellCartAddress;
  shipping?: SwellCartShipping;
  coupon_code?: string;
  account_id?: string;
  currency?: string;
  /** Giftcards to apply toward the total. */
  giftcards?: Array<{ id: string; amount?: number }>;
  /** Whether the order is a gift. */
  gift?: boolean;
  gift_message?: string;
  metadata?: Record<string, unknown>;
}

/** Cart record as returned by the Swell API. */
export interface SwellCart {
  id: string;
  status?: SwellCartStatus;
  number?: string;
  currency?: string;
  /** Linked Swell Checkout session, when one exists. */
  checkout_id?: string;
  checkout_url?: string;
  items?: SwellCartItem[];
  /** Total number of items across the cart. */
  item_quantity?: number;
  sub_total?: number;
  discount_total?: number;
  tax_total?: number;
  grand_total?: number;
  item_discount?: number;
  item_tax?: number;
  item_shipment_weight?: number;
  shipment_price?: number;
  shipment_discount?: number;
  shipment_total?: number;
  giftcard_total?: number;
  auth_total?: number;
  capture_total?: number;
  account_id?: string;
  guest?: boolean;
  account_logged_in?: boolean;
  account_info_saved?: boolean;
  billing?: SwellCartAddress;
  shipping?: SwellCartShipping;
  coupon_code?: string;
  coupon_id?: string;
  /** Set once the cart is converted into an order. */
  target_order_id?: string;
  draft?: boolean;
  notes?: string;
  metadata?: Record<string, unknown>;
  date_created?: string;
  date_updated?: string;
  date_abandoned?: string;
}

/**
 * Update payload for PUT /carts/:id — the call merges, so only changed
 * fields are needed.
 */
export interface SwellCartUpdateInput {
  /**
   * Merge into the items array; existing items are matched by their `id`
   * (not their product id), e.g. { items: [{ id, quantity: 3 }] }.
   */
  items?: SwellCartItemInput[];
  billing?: SwellCartAddress;
  shipping?: SwellCartShipping;
  coupon_code?: string;
  account_id?: string;
  currency?: string;
  metadata?: Record<string, unknown>;
  /**
   * Replace fields wholesale instead of merging. Required to override
   * arrays — e.g. { $set: { items: [...] } } replaces every cart item.
   */
  $set?: Partial<SwellCartInput>;
}

export interface SwellCartFetchOptions {
  /** Related records to expand, e.g. ["items.product"]. */
  expand?: string[];
  /** Fields to limit the response to, e.g. ["id", "items"]. id is always returned. */
  fields?: string[];
  /** Related records to include, e.g. ["items"]. */
  include?: string[];
}

export interface SwellCartListOptions extends SwellCartFetchOptions {
  /** Filter object, e.g. { status: "active" }. Supports $eq, $ne, $gt, ... operators. */
  where?: Record<string, unknown>;
  /** Full-text search across cart fields. */
  search?: string;
  /** Page size between 1 and 1000. Defaults to 15 server-side. */
  limit?: number;
  /** 1-based page number. */
  page?: number;
  /** SQL-like sort expression, e.g. "date_created desc". */
  sort?: string;
}

export interface SwellCartListResult {
  count: number;
  page: number;
  pages: Record<string, { start: number; end: number }>;
  results: SwellCart[];
}

/**
 * Order record as returned by POST /orders when converting a cart — a
 * minimal slice of the orders model
 * (https://developers.swell.is/backend-api/orders). Extend it when the app
 * grows a full orders model.
 */
export interface SwellOrder {
  id: string;
  number?: string;
  /** Order lifecycle status — "payment_pending" right after conversion. */
  status?: string;
  cart_id?: string;
  account_id?: string;
  currency?: string;
  items?: SwellCartItem[];
  billing?: SwellCartAddress;
  shipping?: SwellCartShipping;
  sub_total?: number;
  discount_total?: number;
  tax_total?: number;
  grand_total?: number;
  item_quantity?: number;
  item_discount?: number;
  item_tax?: number;
  item_shipment_weight?: number;
  shipment_price?: number;
  shipment_total?: number;
  coupon_code?: string;
  paid?: boolean;
  payment_balance?: number;
  payment_total?: number;
  refund_total?: number;
  refunded?: boolean;
  delivered?: boolean;
  date_created?: string;
}

/**
 * Create a cart in the Swell store. Each item needs a product_id; quantity
 * defaults to 1 and variant_id is resolved from the item's options when
 * omitted. New carts start with status "active". Server-only: this call
 * requires the store credentials.
 */
export async function createSwellCart(
  input: SwellCartInput,
): Promise<SwellCart> {
  return swellFetch<SwellCart>("/carts", {
    method: "POST",
    body: input,
    useSecretKey: true,
  });
}

/**
 * Retrieve a cart by id, or null when the id does not match any cart.
 * Server-only: this call requires the store credentials.
 */
export async function getSwellCart(
  cartId: string,
  options: SwellCartFetchOptions = {},
): Promise<SwellCart | null> {
  const query = buildSwellQuery(options);
  const cart = await swellFetch<SwellCart | null>(
    `/carts/${encodeURIComponent(cartId)}${query}`,
    { useSecretKey: true },
  );
  return cart ?? null;
}

/**
 * Update a cart by id. PUT merges, so pass only the fields that change;
 * wrap arrays like items in the $set operator to replace them wholesale.
 * Reference existing items by their cart item id, not their product id.
 * Server-only: this call requires the store credentials.
 */
export async function updateSwellCart(
  cartId: string,
  input: SwellCartUpdateInput,
): Promise<SwellCart> {
  return swellFetch<SwellCart>(
    `/carts/${encodeURIComponent(cartId)}`,
    { method: "PUT", body: input, useSecretKey: true },
  );
}

/**
 * Convert a cart into an order. POST /orders with the cart's id maps the
 * cart's items and properties onto a new order — status "payment_pending" —
 * and marks the cart as converted. Order creation is an admin operation
 * (the cart calls above also use the secret key), so this requires the
 * store's secret key. Throws when required order properties are missing or
 * stock is unavailable. Server-only.
 */
export async function convertSwellCartToOrder(
  cartId: string,
): Promise<SwellOrder> {
  return swellFetch<SwellOrder>("/orders", {
    method: "POST",
    body: { cart_id: cartId },
    useSecretKey: true,
  });
}

/**
 * Retrieve an order by id — the confirmation record after converting a
 * cart — or null when the id does not match any order. Server-only: this
 * call requires the store credentials.
 */
export async function getSwellOrder(
  orderId: string,
): Promise<SwellOrder | null> {
  const order = await swellFetch<SwellOrder | null>(
    `/orders/${encodeURIComponent(orderId)}`,
    { useSecretKey: true },
  );
  return order ?? null;
}

/**
 * List all carts with optional filtering, search, and pagination. Returns
 * Swell's paginated collection envelope. Server-only: this call requires
 * the store credentials.
 */
export async function listSwellCarts(
  options: SwellCartListOptions = {},
): Promise<SwellCartListResult> {
  const query = buildSwellQuery(options);
  return swellFetch<SwellCartListResult>(`/carts${query}`, {
    useSecretKey: true,
  });
}

/**
 * Delete a cart by id. Returns the deleted record. Server-only: this call
 * requires the store credentials.
 */
export async function deleteSwellCart(
  cartId: string,
): Promise<SwellCart> {
  return swellFetch<SwellCart>(
    `/carts/${encodeURIComponent(cartId)}`,
    { method: "DELETE", useSecretKey: true },
  );
}
