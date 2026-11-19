import { TRENDING_PRODUCT_SKUS } from "@/lib/site";
import {
  getJewelryProductsBySkus,
  searchJewelryProducts,
} from "@/lib/storefront-data";
import type { JewelryProductCard } from "@/lib/swell";

export const dynamic = "force-dynamic";
const searchCacheHeaders = {
  "Cache-Control": "public, max-age=15, s-maxage=60, stale-while-revalidate=300",
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length > 120) {
    return Response.json({ error: "Search query is too long." }, { status: 400 });
  }

  if (!query) {
    const trendingProducts = await getJewelryProductsBySkus(
      TRENDING_PRODUCT_SKUS,
    );
    return Response.json(
      {
        products: [],
        popularProducts: trendingProducts.map(({ product }) => ({
          name: product.name,
          slug: product.slug,
          images: product.images,
        })),
      },
      { headers: searchCacheHeaders },
    );
  }

  const searchResults = await searchJewelryProducts(query);
  const products: JewelryProductCard[] = searchResults.map(
    ({ name, slug, images, stock_level, price_inr, attributes }) => ({
      name,
      slug,
      images,
      stock_level,
      price_inr,
      attributes: { price_usd: attributes.price_usd },
    }),
  );
  return Response.json(
    { products, popularProducts: [] },
    { headers: searchCacheHeaders },
  );
}
