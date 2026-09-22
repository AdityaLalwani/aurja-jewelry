import { ProductGrid } from "@/components/ProductGrid";
import { getJewelryProducts } from "@/lib/swell";

type ProductsPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { category } = await searchParams;
  const products = await getJewelryProducts(category);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-10 sm:px-6">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          {category ? category.replaceAll("-", " ") : "The Collection"}
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          Every piece, made by hand
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-500">
          Browse the Aurja catalogue — filter by metal or stone, open a piece
          for its full story, or add it straight to your cart.
        </p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
