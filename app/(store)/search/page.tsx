import { SearchExperience } from "@/components/SearchExperience";
import { BEST_SELLER_SKUS } from "@/lib/site";
import { getJewelryProducts, getJewelryProductsBySkus } from "@/lib/swell";

export default async function SearchPage() {
  const [products, bestSellerProducts] = await Promise.all([
    getJewelryProducts(),
    getJewelryProductsBySkus(BEST_SELLER_SKUS),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-10 sm:px-6">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          Search
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          Find your piece
        </h1>
      </div>

      <SearchExperience
        products={products}
        popularProducts={bestSellerProducts.map(({ product }) => product)}
      />
    </div>
  );
}
