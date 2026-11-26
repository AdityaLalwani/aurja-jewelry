"use server";

import {
  getJewelryProductBySlug,
  getJewelryProductPage,
} from "@/lib/storefront-data";
import type { JewelryProduct } from "@/lib/catalog";
import { getIsIndiaStorefront } from "@/lib/storefront-region";

export async function loadJewelryProductsForFilters(
  categorySlug: string | undefined,
): Promise<JewelryProduct[]> {
  if (
    categorySlug !== undefined &&
    (typeof categorySlug !== "string" || categorySlug.length > 100)
  ) {
    throw new Error("Invalid product category request.");
  }

  if (!(await getIsIndiaStorefront())) return [];

  const products: JewelryProduct[] = [];
  for (let page = 1; page <= 1000; page += 1) {
    const productPage = await getJewelryProductPage(categorySlug, page, 24);
    products.push(...productPage.products);
    if (!productPage.hasMore) return products;
  }

  throw new Error("The product collection exceeds the supported page limit.");
}

export async function loadJewelryProductsBySlugs(
  slugs: string[],
): Promise<JewelryProduct[]> {
  if (
    !Array.isArray(slugs) ||
    slugs.length > 100 ||
    slugs.some((slug) => typeof slug !== "string" || slug.length > 200)
  ) {
    throw new Error("Invalid wishlist product request.");
  }

  if (!(await getIsIndiaStorefront())) return [];

  const uniqueSlugs = [...new Set(slugs.filter(Boolean))];
  const products = await Promise.all(
    uniqueSlugs.map((slug) => getJewelryProductBySlug(slug)),
  );
  return products.filter(
    (product): product is JewelryProduct => product !== null,
  );
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

  if (!(await getIsIndiaStorefront())) {
    return { products: [], total: 0, page, hasMore: false };
  }

  return getJewelryProductPage(categorySlug, page, 24);
}
