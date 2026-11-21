import "server-only";

import { cache } from "react";
import {
  getActiveProductSlugs,
  getActiveProductsBySkus,
  getCategories,
  getProductsByIds,
  getProductsPage,
  findProduct,
  searchActiveProducts,
} from "@/lib/store-db";
import {
  mapCatalogProduct,
  type JewelryProduct,
  type StoreCategory,
  type CatalogProduct,
} from "@/lib/catalog";

function toCatalogProduct(value: Record<string, unknown>): CatalogProduct {
  if (typeof value.id !== "string" || value.id.length === 0) {
    throw new Error("A product record in Neon is missing its id.");
  }
  return { ...value, id: value.id } as CatalogProduct;
}

export async function getJewelryProductPage(
  categorySlug: string | undefined,
  page = 1,
  limit = 24,
): Promise<{
  products: JewelryProduct[];
  total: number;
  page: number;
  hasMore: boolean;
}> {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.min(100, Math.max(1, Math.floor(limit)));
  const result = await getProductsPage(categorySlug, safePage, safeLimit);
  const products = result.products.map((product) =>
    mapCatalogProduct(toCatalogProduct(product), 2),
  );
  return {
    products,
    total: result.total,
    page: safePage,
    hasMore: safePage * safeLimit < result.total,
  };
}

export async function getJewelryProducts(
  categorySlug?: string,
): Promise<JewelryProduct[]> {
  const result = await getJewelryProductPage(categorySlug, 1, 100);
  return result.products;
}

export async function getJewelryProductRecommendations(
  product: JewelryProduct,
  limit = 4,
): Promise<JewelryProduct[]> {
  const products = await getJewelryProducts();
  const matchFields: Array<{
    key: keyof JewelryProduct["attributes"];
    weight: number;
  }> = [
    { key: "product_category", weight: 10 },
    { key: "jewelry_type", weight: 8 },
    { key: "collection", weight: 6 },
    { key: "gemstone_type", weight: 4 },
    { key: "stone_shape", weight: 3 },
    { key: "occasion", weight: 2 },
    { key: "setting_type", weight: 2 },
    { key: "metal_type", weight: 1 },
    { key: "shop_for", weight: 1 },
  ];
  const normalize = (value: string | undefined) => {
    const normalized = value?.trim().toLowerCase();
    return normalized && !["none", "n/a", "not applicable"].includes(normalized)
      ? normalized
      : undefined;
  };
  const productNameWords = new Set(
    product.name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(
        (word) =>
          word.length > 2 &&
          !["gold", "diamond", "jewelry", "jewellery", "ring", "rings"].includes(
            word,
          ),
      ),
  );
  const scoredProducts = products
    .filter((candidate) => candidate.slug !== product.slug)
    .map((candidate, index) => {
      const score = matchFields.reduce((total, { key, weight }) => {
        const productValue = product.attributes[key];
        const candidateValue = candidate.attributes[key];
        return typeof productValue === "string" &&
          normalize(productValue) === normalize(
            typeof candidateValue === "string" ? candidateValue : undefined,
          ) &&
          normalize(productValue)
          ? total + weight
          : total;
      }, 0);
      const sharedNameWords = candidate.name
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => productNameWords.has(word)).length;

      return { product: candidate, score: score + sharedNameWords, index };
    })
    .sort(
      (first, second) =>
        second.score - first.score || first.index - second.index,
    );

  return scoredProducts
    .slice(0, Math.max(0, limit))
    .map(({ product: recommendation }) => recommendation);
}

export async function searchJewelryProducts(
  query: string,
): Promise<JewelryProduct[]> {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const records = await searchActiveProducts(terms);
  return records.map((product) =>
    mapCatalogProduct(toCatalogProduct(product), 2),
  );
}

export const getJewelryProductBySlug = cache(
  async (slug: string): Promise<JewelryProduct | null> => {
    const record = await findProduct("slug", slug);
    if (!record || record.active === false) return null;
    return mapCatalogProduct(toCatalogProduct(record));
  },
);

export async function getJewelryProductsByIds(
  productIds: readonly string[],
): Promise<Array<{ id: string; product: JewelryProduct }>> {
  const ids = [...new Set(productIds.filter(Boolean))];
  const records = await getProductsByIds(ids);
  const productsById = new Map(
    records.map(({ store_id, payload }) => [
      store_id,
      {
        active: payload.active,
        product: mapCatalogProduct(toCatalogProduct({ ...payload, id: store_id })),
      },
    ]),
  );
  return ids.flatMap((id) => {
    const record = productsById.get(id);
    return record && record.active !== false
      ? [{ id, product: record.product }]
      : [];
  });
}

export async function getJewelryProductsBySkus(
  skus: readonly string[],
): Promise<Array<{ sku: string; product: JewelryProduct }>> {
  const records = await getActiveProductsBySkus(skus);
  const productsBySku = new Map<string, JewelryProduct>();
  for (const { store_id, sku, payload } of records) {
    const normalizedSku = sku.toUpperCase();
    if (!productsBySku.has(normalizedSku)) {
      productsBySku.set(
        normalizedSku,
        mapCatalogProduct(toCatalogProduct({ ...payload, id: store_id }), 2),
      );
    }
  }

  return skus.flatMap((sku) => {
    const product = productsBySku.get(sku.toUpperCase());
    return product ? [{ sku, product }] : [];
  });
}

export async function getJewelryProductSlugs(): Promise<string[]> {
  return getActiveProductSlugs();
}

export async function getStoreCategories(): Promise<StoreCategory[]> {
  const records = await getCategories();
  return records
    .filter((category) => category.active !== false)
    .map((category) => ({
      id: String(category.id ?? ""),
      name: String(category.name ?? ""),
      slug: String(category.slug ?? ""),
      parentId: typeof category.parent_id === "string" ? category.parent_id : null,
      description:
        typeof category.description === "string" ? category.description : undefined,
      meta_title:
        typeof category.meta_title === "string" ? category.meta_title : undefined,
      meta_description:
        typeof category.meta_description === "string"
          ? category.meta_description
          : undefined,
      meta_keywords:
        typeof category.meta_keywords === "string"
          ? category.meta_keywords
          : undefined,
    }));
}
