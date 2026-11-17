import { BEST_SELLER_SKUS } from "@/lib/site";
import {
  getJewelryProductsBySkus,
  getStoreCategories,
} from "@/lib/storefront-data";

export async function GET() {
  const [categories, bestSellerProducts] = await Promise.all([
    getStoreCategories(),
    getJewelryProductsBySkus(BEST_SELLER_SKUS),
  ]);

  return Response.json({
    categories,
    bestSellers: bestSellerProducts.map(({ product }) => ({
      name: product.name,
      slug: product.slug,
      images: product.images,
    })),
  });
}
