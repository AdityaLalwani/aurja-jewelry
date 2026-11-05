import { SearchDialog } from "@/components/SearchDialog";
import { SearchExperience } from "@/components/SearchExperience";
import { TRENDING_PRODUCT_SKUS } from "@/lib/site";
import { getJewelryProducts, getJewelryProductsBySkus } from "@/lib/swell";

export default async function SearchModalPage() {
  const [products, trendingProducts] = await Promise.all([
    getJewelryProducts(),
    getJewelryProductsBySkus(TRENDING_PRODUCT_SKUS),
  ]);

  return (
    <SearchDialog>
      <SearchExperience
        products={products}
        popularProducts={trendingProducts.map(({ product }) => product)}
      />
    </SearchDialog>
  );
}
