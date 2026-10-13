import { ProductGrid } from "@/components/ProductGrid";
import { SiteFooter } from "@/app/components/homepage/SiteFooter";
import { getJewelryProducts } from "@/lib/swell";

type ProductsPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { category } = await searchParams;
  const products = await getJewelryProducts(category);
  const title = category
    ? category.replaceAll("-", " ")
    : "The Collection";

  return (
    <>
      <div className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-20 pt-8 sm:px-6 lg:px-10">
        <div className="mb-7">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            Aurja Fine Jewellery
          </p>
          <h1 className="mt-2 font-display text-3xl capitalize leading-tight text-neutral-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
            Discover handcrafted pieces designed to be treasured for a lifetime.
          </p>
        </div>

        <ProductGrid products={products} />
      </div>
      <SiteFooter />
    </>
  );
}
