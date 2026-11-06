import type { Metadata } from "next";
import { ProductGrid } from "@/components/ProductGrid";
import { SiteFooter } from "@/app/components/homepage/SiteFooter";
import { getJewelryProductPage, getStoreCategories } from "@/lib/swell";

type ProductsPageProps = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const { category: categorySlug } = await searchParams;
  const category = categorySlug
    ? (await getStoreCategories()).find((item) => item.slug === categorySlug)
    : undefined;
  const title =
    category?.meta_title?.trim() ||
    (category ? `${category.name} Jewelry` : "Shop Fine Jewelry");
  const description =
    category?.meta_description?.trim() ||
    category?.description ||
    "Discover handcrafted gold and diamond jewelry designed to be treasured for a lifetime.";
  const keywords = category?.meta_keywords
    ?.split(/[,|]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return {
    title: category?.meta_title?.trim() ? { absolute: title } : title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: {
      canonical: categorySlug
        ? `/products?category=${encodeURIComponent(categorySlug)}`
        : "/products",
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { category, page: pageParam } = await searchParams;
  const requestedPage = Number(pageParam ?? "1");
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, 1000)
      : 1;
  const productPage = await getJewelryProductPage(category, page);
  const title = category
    ? category.replaceAll("-", " ")
    : "The Collection";

  return (
    <>
      <div className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-20 pt-8 sm:px-6 lg:px-10">
        <div className="mb-7">
          <h1 className="mt-2 font-display text-3xl capitalize leading-tight text-neutral-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
            Discover handcrafted pieces designed to be treasured for a lifetime.
          </p>
        </div>

        <ProductGrid
          key={`${category ?? "all"}:${page}`}
          products={productPage.products}
          total={productPage.total}
          initialPage={page}
          hasMore={productPage.hasMore}
          categorySlug={category}
        />
      </div>
      <SiteFooter />
    </>
  );
}
