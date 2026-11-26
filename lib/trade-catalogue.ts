import "server-only";

import { getJewelryProductPage } from "@/lib/storefront-data";

const TRADE_SKU_CATEGORIES = [
  { prefix: "ASR", category: "Rings" },
  { prefix: "ASER", category: "Earrings" },
  { prefix: "ASN", category: "Necklaces and neckpieces" },
  { prefix: "ASB", category: "Bracelets" },
] as const;

export async function getTradeCatalogueProducts() {
  const products = [];
  let pageNumber = 1;
  let hasMore = true;

  while (hasMore && pageNumber <= 1000) {
    const page = await getJewelryProductPage(undefined, pageNumber, 100);
    products.push(...page.products);
    hasMore = page.hasMore;
    pageNumber += 1;
  }

  if (hasMore) {
    throw new Error("The trade catalogue exceeds the supported page limit.");
  }

  return products
    .flatMap((product) => {
      const sku = product.sku?.trim().toUpperCase();
      if (!sku) return [];

      const match = TRADE_SKU_CATEGORIES.find(({ prefix }) =>
        sku.startsWith(prefix),
      );
      return match
        ? [
            {
              sku,
              name: product.name,
              slug: product.slug,
              images: product.images,
              category: match.category,
            },
          ]
        : [];
    })
    .sort((first, second) => first.sku.localeCompare(second.sku));
}
