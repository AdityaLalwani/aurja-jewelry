"use server";

import { getJewelryProductPage } from "@/lib/swell";

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
