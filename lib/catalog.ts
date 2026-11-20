export interface CatalogProductVariant {
  id?: string;
  active?: boolean;
  option_value_ids?: string[];
  price?: number;
  price_inr?: number;
  [key: string]: unknown;
}

export interface CatalogProduct {
  id?: string;
  name?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  sku?: string;
  price?: number;
  price_inr?: number;
  stock_level?: number;
  active?: boolean;
  images?: Array<{ file?: { url?: string } }> | null;
  description?: string;
  options?: CatalogProductOption[];
  variants?: { results?: CatalogProductVariant[] } | null;
  attributes?: Record<string, unknown>;
  content?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CatalogProductOptionValue {
  id?: string | null;
  name?: string;
  price?: number | null;
  price_inr?: number | null;
  shipment_weight?: number;
  active?: boolean;
}

export interface CatalogProductOption {
  id?: string | null;
  name?: string;
  active?: boolean;
  values: CatalogProductOptionValue[];
}

export interface CatalogProductOptionSelection {
  id?: string;
  name?: string;
  value: string;
}

export interface ProductStoneDetail {
  type?: string;
  shape?: string;
  size?: string;
  weight?: string;
  color?: string;
  clarity?: string;
  pieces?: string;
}

export interface JewelryProduct {
  id?: string;
  name: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  sku?: string;
  price_inr: number;
  stock_level?: number;
  images: string[];
  description?: string;
  variant_options?: CatalogProductOption[];
  stone_details?: ProductStoneDetail[];
  attributes: {
    metal_type: string;
    metal_color?: string;
    metal_weight_gms: number;
    youtube_id?: string;
    size?: string;
    gemstone_type: string;
    diamond_carat: number;
    diamond_clarity: string;
    price_usd: number;
    product_story?: string;
    delivery_text?: string;
    certificate?: string;
    collection?: string;
    stone_shape?: string;
    setting_type?: string;
    ring_size?: string;
    price_breakup?: string;
    design_code?: string;
    gross_weight_gms?: string;
    occasion?: string;
    gold_purity?: string;
    jewelry_type?: string;
    product_category?: string;
    shop_for?: string;
    karatage?: string;
    gold_weight_gms?: string;
    gold_color?: string;
    diamond_count?: string;
    diamond_cut?: string;
    diamond_color?: string;
    shipping_text?: string;
    exchange_policy?: string;
    return_policy?: string;
  };
}

export type JewelryProductCard = Pick<
  JewelryProduct,
  "name" | "slug" | "price_inr" | "stock_level" | "images"
> & {
  attributes: Pick<JewelryProduct["attributes"], "price_usd">;
};

function coercePrice(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function coerceOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function readRecordValue(value: unknown, key: string): unknown {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return (value as Record<string, unknown>)[key];
}

function normalizeStoneDetails(input: unknown): ProductStoneDetail[] {
  const entries = Array.isArray(input)
    ? input
    : input !== null && typeof input === "object"
      ? Object.values(input)
      : [];
  if (entries.length === 0) {
    return [];
  }

  const toText = (value: unknown): string | undefined =>
    typeof value === "string" || typeof value === "number"
      ? String(value)
      : undefined;

  return entries.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }

    const detail = entry as Record<string, unknown>;
    const normalized: ProductStoneDetail = {
      type: toText(detail.type ?? detail.stone),
      shape: toText(detail.shape),
      size: toText(detail.size),
      weight: toText(detail.weight ?? detail.carats),
      color: toText(detail.color),
      clarity: toText(detail.clarity),
      pieces: toText(detail.pieces ?? detail.pcs),
    };

    return Object.values(normalized).some(Boolean) ? [normalized] : [];
  });
}

function normalizeProductOptions(input: unknown): CatalogProductOption[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((option): option is Record<string, unknown> => Boolean(option) && typeof option === "object")
    .map((option) => {
      const values = Array.isArray(option.values)
        ? option.values.filter(
            (value): value is Record<string, unknown> =>
              value !== null && typeof value === "object",
          )
        : [];

      return {
        id: typeof option.id === "string" ? option.id : undefined,
        name:
          typeof option.name === "string" && option.name.trim()
            ? option.name
            : "Option",
        active: option.active !== false,
        values: values.map((value) => {
          const shipmentWeight = coerceOptionalNumber(value.shipment_weight);
          const currencyPrices = readRecordValue(value, "$currency");
          const inrPrice =
            coerceOptionalNumber(value.price_inr) ??
            coerceOptionalNumber(
              readRecordValue(readRecordValue(currencyPrices, "INR"), "price"),
            );
          return {
            id: typeof value.id === "string" ? value.id : undefined,
            name:
              typeof value.name === "string" && value.name.trim()
                ? value.name
                : "Value",
            price: coercePrice(value.price),
            ...(inrPrice !== undefined ? { price_inr: inrPrice } : {}),
            ...(shipmentWeight !== undefined
              ? { shipment_weight: shipmentWeight }
              : {}),
            active: value.active !== false,
          };
        }),
      };
    })
    .filter((option) => option.values.length > 0 && option.active !== false);
}

export function getProductOptionValuePrice(
  optionValue: Pick<CatalogProductOptionValue, "price" | "price_inr"> | undefined,
  currency: "USD" | "INR" = "USD",
): number {
  if (!optionValue) {
    return 0;
  }

  return currency === "INR"
    ? coercePrice(optionValue.price_inr)
    : coercePrice(optionValue.price);
}

export function getDefaultVariantSelections(
  options: CatalogProductOption[] = [],
): Record<string, string> {
  const selections: Record<string, string> = {};

  for (const option of options) {
    const optionName = option.name?.trim() || "Option";
    if (!option.values.length) {
      continue;
    }

    const lowestValue = [...option.values]
      .filter((value) => value.active !== false)
      .sort(
        (first, second) =>
          getProductOptionValuePrice(first) - getProductOptionValuePrice(second),
      )[0];

    if (lowestValue?.name) {
      selections[optionName] = lowestValue.name;
    }
  }

  return selections;
}

export function resolveSelectedVariantId(
  product: Pick<CatalogProduct, "options" | "variants"> | null | undefined,
  selections: Record<string, string> = {},
): string | undefined {
  const activeVariants = (product?.variants?.results ?? []).filter(
    (variant) => variant.active !== false,
  );
  if (!activeVariants.length) {
    return undefined;
  }

  const selectedPairs = Object.entries(selections).filter(([, value]) => value?.trim());
  if (selectedPairs.length === 0) {
    return activeVariants[0]?.id;
  }

  const selectedValueIds: string[] = [];
  if (product?.options?.length) {
    for (const option of product.options) {
      const optionName = option.name?.trim() || "";
      const selectedName = optionName ? selections[optionName] : undefined;
      if (!selectedName) {
        continue;
      }

      const matchingValue = option.values.find(
        (value) =>
          value.active !== false &&
          value.name &&
          value.name.trim().toLowerCase() === selectedName.trim().toLowerCase(),
      );

      if (matchingValue?.id) {
        selectedValueIds.push(matchingValue.id);
      }
    }
  }

  if (selectedValueIds.length > 0) {
    const resolvedVariant = activeVariants.find((variant) => {
      const variantValueIds = variant.option_value_ids ?? [];
      if (!variantValueIds.length) {
        return false;
      }
      return (
        variantValueIds.length >= selectedValueIds.length &&
        selectedValueIds.every((id) => variantValueIds.includes(id))
      );
    });

    if (resolvedVariant) {
      return resolvedVariant.id;
    }
  }

  return activeVariants[0]?.id;
}

export function getSelectedVariantPrice(
  options: CatalogProductOption[] = [],
  selections: Record<string, string> = {},
  currency: "USD" | "INR" = "USD",
): number {
  let total = 0;

  for (const option of options) {
    const optionName = option.name?.trim() || "";
    const selectionName = optionName ? selections[optionName] : undefined;
    if (!selectionName) {
      continue;
    }

    const selectedValue = option.values.find(
      (value) =>
        value.active !== false &&
        value.name &&
        value.name.trim().toLowerCase() === selectionName.trim().toLowerCase(),
    );

    if (selectedValue) {
      total += getProductOptionValuePrice(selectedValue, currency);
    }
  }

  return total;
}

export function getSelectionNameKey(name: string): string {
  return name.trim().toLowerCase();
}

export function isNaturalGemstoneSelection(
  options: CatalogProductOption[] = [],
  selections: Record<string, string> = {},
): boolean {
  const gemstoneOption = options.find((option) => {
    const optionName = option.name ?? "";
    return (
      getSelectionNameKey(optionName) === "gemstone" ||
      getSelectionNameKey(optionName) === "gem stone"
    );
  });

  if (!gemstoneOption) {
    return false;
  }

  const optionName = gemstoneOption.name ?? "";
  const selectedValueName = optionName ? selections[optionName] : undefined;
  const selectedValue = gemstoneOption.values.find(
    (value) =>
      value.active !== false &&
      value.name &&
      value.name === selectedValueName,
  );

  return selectedValue?.name?.toLowerCase() === "natural";
}

export function getVariantSelectionSummary(
  optionGroups: CatalogProductOption[] = [],
  selections: Record<string, string> = {},
): string[] {
  return optionGroups
    .map((option) => {
      const optionName = option.name ?? "";
      const selectedValueName = optionName ? selections[optionName] : undefined;
      if (!selectedValueName) {
        return null;
      }

      const selectedValue = option.values.find(
        (value) =>
          value.active !== false &&
          value.name &&
          value.name.toLowerCase() === selectedValueName.toLowerCase(),
      );

      if (!selectedValue?.name) {
        return null;
      }

      return `${optionName}: ${selectedValue.name}`;
    })
    .filter((value): value is string => Boolean(value));
}

export function getItemOptionSummary(
  product: Pick<JewelryProduct, "variant_options"> | undefined,
  itemOptions: CatalogProductOptionSelection[] = [],
): string[] {
  const lookup = new Map<string, string>();
  for (const option of itemOptions) {
    if (!option.name || !option.value) {
      continue;
    }
    lookup.set(getSelectionNameKey(option.name), String(option.value));
  }

  if (!product?.variant_options?.length) {
    return Array.from(lookup.entries()).map(([name, value]) => `${name}: ${value}`);
  }

  return product.variant_options
    .map((option) => {
      const optionName = option.name ?? "";
      if (!optionName) {
        return null;
      }
      const value = lookup.get(getSelectionNameKey(optionName));
      if (!value) {
        return null;
      }
      return `${optionName}: ${value}`;
    })
    .filter((value): value is string => Boolean(value));
}

export function isNaturalGemstoneItemOption(
  itemOptions: CatalogProductOptionSelection[] = [],
): boolean {
  return itemOptions.some(
    (option) =>
      option.name &&
      (getSelectionNameKey(option.name) === "gemstone" ||
        getSelectionNameKey(option.name) === "gem stone") &&
      String(option.value).toLowerCase() === "natural",
  );
}

export function getLowestActiveVariantPrice(
  product: Pick<CatalogProduct, "price" | "price_inr" | "options" | "variants">,
  currency: "USD" | "INR" = "USD",
): number {
  const optionGroups = normalizeProductOptions(product.options);
  if (optionGroups.length === 0) {
    return currency === "INR"
      ? coercePrice(product.price_inr)
      : coercePrice(product.price);
  }

  const lowestVariantPrice = optionGroups.reduce((sum, option) => {
    const candidateValues = option.values.filter((value) => value.active !== false);
    if (!candidateValues.length) {
      return sum;
    }

    const lowestValuePrice = candidateValues.reduce(
      (min, value) => Math.min(min, getProductOptionValuePrice(value, currency)),
      Number.POSITIVE_INFINITY,
    );

    return sum + (Number.isFinite(lowestValuePrice) ? lowestValuePrice : 0);
  }, 0);

  return lowestVariantPrice > 0
    ? lowestVariantPrice
    : currency === "USD"
      ? coercePrice(product.price)
      : coercePrice(product.price_inr);
}

/** Pure catalog helpers for data normalized from Neon. */
function firstAttributeValue(
  attributes: Record<string, unknown> | undefined,
  keys: string[],
): string | undefined {
  function readPath(path: string): unknown {
    const literalValue = attributes?.[path];
    if (literalValue !== undefined) return literalValue;

    return path.split(".").reduce<unknown>((value, segment) => {
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        return (value as Record<string, unknown>)[segment];
      }
      return undefined;
    }, attributes);
  }

  for (const key of keys) {
    const value =
      readPath(key) ??
      (key.startsWith("content.") ? readPath(key.slice("content.".length)) : undefined) ??
      readPath(`content.${key}`);
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (typeof firstValue === "string" || typeof firstValue === "number") {
      return String(firstValue);
    }
  }
  return undefined;
}

export function extractImageUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractImageUrls(entry));
  }

  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}"))
    ) {
      try {
        return extractImageUrls(JSON.parse(trimmed));
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  }

  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if ("urls" in record) {
      return extractImageUrls(record.urls);
    }

    if ("url" in record && typeof record.url === "string" && record.url.trim()) {
      return [record.url];
    }

    return Object.values(record).flatMap((entry) => extractImageUrls(entry));
  }

  return [];
}

export function getFirstImageUrl(value: unknown): string | null {
  const [firstUrl] = extractImageUrls(value);
  return firstUrl ?? null;
}

export function mapCatalogProduct(
  product: CatalogProduct,
  imageLimit?: number,
): JewelryProduct {
  const attributes = {
    ...product.attributes,
    ...product.content,
    content: product.content ?? product.attributes?.content,
  };
  const normalizedOptions = normalizeProductOptions(product.options);
  const variantPriceUsd = getLowestActiveVariantPrice(product);
  const priceUsd = variantPriceUsd > 0 ? variantPriceUsd : coercePrice(product.price);
  const variantPriceInr = getLowestActiveVariantPrice(product, "INR");
  const metalType =
    firstAttributeValue(product.content, ["metal"]) ??
    firstAttributeValue(attributes, ["metal_type", "metal"]);
  const gemstoneType = firstAttributeValue(attributes, [
    "gemstone_type",
    "gemstone",
  ]);
  const imageKitValue =
    product.content?.imagekit_urls ??
    product.attributes?.imagekit_urls ??
    product.content?.imagekitUrls ??
    product.attributes?.imagekitUrls;
  const imageKitImages = extractImageUrls(imageKitValue);
  const images =
    imageKitImages.length > 0
      ? imageKitImages
      : (product.images ?? [])
          .map((image) => image.file?.url)
          .filter((url): url is string => Boolean(url));

  return {
    id: product.id,
    name: product.name ?? product.slug ?? "Untitled product",
    slug: product.slug ?? product.id ?? "untitled-product",
    meta_title:
      product.meta_title ??
      firstAttributeValue(attributes, ["meta_title", "seo_title"]),
    meta_description:
      product.meta_description ??
      firstAttributeValue(attributes, ["meta_description", "seo_description"]),
    meta_keywords:
      product.meta_keywords ??
      firstAttributeValue(attributes, ["meta_keywords", "seo_keywords", "tags"]),
    sku:
      product.sku ??
      firstAttributeValue(attributes, ["sku", "product_sku"]) ??
      undefined,
    price_inr:
      variantPriceInr > 0
        ? variantPriceInr
        : coercePrice(product.price_inr),
    stock_level: product.stock_level,
    images: imageLimit === undefined ? images : images.slice(0, imageLimit),
    description:
      product.description ||
      firstAttributeValue(attributes, ["description", "product_story", "story"]),
    variant_options: normalizedOptions,
    stone_details: normalizeStoneDetails(
      product.content?.stone_details ??
        product.attributes?.stone_details ??
        readRecordValue(product.attributes?.content, "stone_details"),
    ),
    attributes: {
      metal_type: metalType ?? "Gold",
      metal_color:
        firstAttributeValue(attributes, ["metal_color", "color"]) ?? undefined,
      metal_weight_gms: Number(
        firstAttributeValue(attributes, ["metal_weight_gms", "metal_weight"]) ??
          0,
      ),
      youtube_id: firstAttributeValue(attributes, ["youtube_id"]),
      size: firstAttributeValue(product.content, ["size"]) ?? undefined,
      gemstone_type: gemstoneType ?? "None",
      diamond_carat: Number(
        firstAttributeValue(attributes, ["diamond_carat"]) ?? 0,
      ),
      diamond_clarity:
        firstAttributeValue(attributes, ["diamond_clarity"]) ?? "N/A",
      price_usd: priceUsd,
      product_story:
        firstAttributeValue(attributes, ["product_story", "story"]) ??
        undefined,
      delivery_text:
        firstAttributeValue(attributes, [
          "delivery_text",
          "delivery_window",
          "shipping_message",
        ]) ?? undefined,
      certificate:
        firstAttributeValue(attributes, ["certificate", "certification"]) ??
        undefined,
      collection:
        firstAttributeValue(attributes, ["collection", "collection_name"]) ??
        undefined,
      stone_shape:
        firstAttributeValue(attributes, ["stone_shape", "shape"]) ?? undefined,
      setting_type:
        firstAttributeValue(attributes, ["setting_type", "setting"]) ??
        undefined,
      ring_size:
        firstAttributeValue(attributes, ["ring_size", "size"]) ?? undefined,
      price_breakup:
        firstAttributeValue(attributes, ["price_breakup"]) ?? undefined,
      design_code:
        firstAttributeValue(attributes, ["design_code", "style_code"]) ??
        undefined,
      gross_weight_gms:
        firstAttributeValue(attributes, ["gross_weight_gms", "gross_weight"]) ??
        undefined,
      occasion:
        firstAttributeValue(attributes, ["occasion"]) ?? undefined,
      gold_purity:
        firstAttributeValue(attributes, ["gold_purity", "purity"]) ?? undefined,
      jewelry_type:
        firstAttributeValue(attributes, [
          "jewelry_type",
          "jewellery_type",
          "product_type",
        ]) ?? undefined,
      product_category:
        firstAttributeValue(attributes, [
          "product_category",
          "category",
          "category_name",
        ]) ?? undefined,
      shop_for:
        firstAttributeValue(attributes, [
          "shop_for",
          "target_gender",
          "gender",
        ]) ?? undefined,
      karatage:
        firstAttributeValue(attributes, ["karatage", "gold_purity", "purity"]) ??
        undefined,
      gold_weight_gms:
        firstAttributeValue(attributes, ["gold_weight_gms"]) ?? undefined,
      gold_color:
        firstAttributeValue(attributes, ["gold_color"]) ?? undefined,
      diamond_count:
        firstAttributeValue(attributes, ["diamond_count"]) ?? undefined,
      diamond_cut:
        firstAttributeValue(attributes, ["diamond_cut", "stone_shape"]) ??
        undefined,
      diamond_color:
        firstAttributeValue(attributes, ["diamond_color"]) ?? undefined,
      shipping_text:
        firstAttributeValue(attributes, ["shipping_text"]) ?? undefined,
      exchange_policy:
        firstAttributeValue(attributes, ["exchange_policy"]) ?? undefined,
      return_policy:
        firstAttributeValue(attributes, ["return_policy"]) ?? undefined,
    },
  };
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}
