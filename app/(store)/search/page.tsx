import { SearchExperience } from "@/components/SearchExperience";
import { getJewelryProducts } from "@/lib/swell";

export default async function SearchPage() {
  const products = await getJewelryProducts();

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-10 sm:px-6">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          Search
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          Find your piece
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-500">
          Search the Aurja catalogue by name, metal, or stone.
        </p>
      </div>

      <SearchExperience products={products} />
    </div>
  );
}
