"use server";

import { getJewelryProductPage } from "@/lib/swell";
import type { JewelryProduct } from "@/lib/swell";

export async function loadJewelryProductsForFilters(
  categorySlug: string | undefined,
): Promise<JewelryProduct[]> {
  if (
    categorySlug !== undefined &&
    (typeof categorySlug !== "string" || categorySlug.length > 100)
  ) {
    throw new Error("Invalid product category request.");
  }

  const products: JewelryProduct[] = [];
  for (let page = 1; page <= 1000; page += 1) {
    const productPage = await getJewelryProductPage(categorySlug, page, 24);
    products.push(...productPage.products);
    if (!productPage.hasMore) return products;
  }

  throw new Error("The product collection exceeds the supported page limit.");
}

export async function loadMoreJewelryProducts(
  categorySlug: string | undefined,
  page: number,
) {
  if (
    (categorySlug !== undefined &&
      (typeof categorySlug !== "string" || categorySlug.length > 100)) ||
    !Number.isInteger(page) ||
    page < 1 ||
    page > 1000
  ) {
    throw new Error("Invalid product page request.");
  }

  return getJewelryProductPage(categorySlug, page, 24);
}
