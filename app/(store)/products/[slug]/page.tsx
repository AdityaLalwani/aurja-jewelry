import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductVariantSelector } from "@/components/ProductVariantSelector";
import { SiteFooter } from "@/app/components/homepage/SiteFooter";
import { getJewelryProductBySlug } from "@/lib/swell";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  props: ProductPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getJewelryProductBySlug(slug);
  const description =
    product?.meta_description?.trim() ||
    product?.description
      ?.replace(/<\/p>\s*<p\b[^>]*>/gi, " ")
      .replace(/<\/?p\b[^>]*>/gi, "")
      .replace(/<[^>]+>/g, "")
      .trim()
      .slice(0, 160);
  const title =
    product?.meta_title?.trim() ||
    (product ? `${product.name} — Aurja` : "Piece not found — Aurja");
  const keywords = product?.meta_keywords
    ?.split(/[,|]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return {
    title: { absolute: title },
    ...(description ? { description } : {}),
    ...(keywords?.length ? { keywords } : {}),
    ...(product
      ? {
          alternates: { canonical: `/products/${product.slug}` },
          openGraph: {
            title,
            ...(description ? { description } : {}),
            type: "website" as const,
            images: product.images[0]
              ? [{ url: product.images[0], alt: product.name }]
              : undefined,
          },
          twitter: {
            card: "summary_large_image" as const,
            title,
            ...(description ? { description } : {}),
            images: product.images[0] ? [product.images[0]] : undefined,
          },
        }
      : {}),
  };
}

export default async function ProductPage(props: ProductPageProps) {
  const { slug } = await props.params;
  const product = await getJewelryProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const { attributes } = product;
  const description = product.description
    ?.replace(/<\/p>\s*<p\b[^>]*>/gi, "\n\n")
    .replace(/<\/?p\b[^>]*>/gi, "")
    .trim();
  const specifications: { label: string; value: string }[] = [
    ...(attributes.product_category
      ? [{ label: "Category", value: attributes.product_category }]
      : []),
    ...(attributes.occasion
      ? [{ label: "Occasion", value: attributes.occasion }]
      : []),
    ...(attributes.size ? [{ label: "Size", value: attributes.size }] : []),
    ...(attributes.metal_type
      ? [{ label: "Metal", value: attributes.metal_type }]
      : []),
    ...(attributes.gross_weight_gms
      ? [{ label: "Gross weight", value: `${attributes.gross_weight_gms} g` }]
      : []),
    ...(attributes.metal_weight_gms > 0
      ? [{ label: "Metal weight", value: `${attributes.metal_weight_gms} g` }]
      : []),
    ...(attributes.gemstone_type && attributes.gemstone_type !== "None"
      ? [{ label: "Gemstone", value: attributes.gemstone_type }]
      : []),
    ...(attributes.diamond_carat > 0
      ? [{ label: "Diamond carat", value: `${attributes.diamond_carat} ct` }]
      : []),
    ...(attributes.diamond_clarity && attributes.diamond_clarity !== "N/A"
      ? [{ label: "Diamond clarity", value: attributes.diamond_clarity }]
      : []),
    ...(attributes.collection
      ? [{ label: "Collection", value: attributes.collection }]
      : []),
    ...(attributes.stone_shape
      ? [{ label: "Stone shape", value: attributes.stone_shape }]
      : []),
    ...(attributes.setting_type
      ? [{ label: "Setting type", value: attributes.setting_type }]
      : []),
  ];
  return (
    <>
      <div className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-56 pt-8 sm:px-6 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden lg:px-10 lg:pb-0">
        <nav
          aria-label="Breadcrumb"
          className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-neutral-500"
        >
          <Link href="/" className="transition-colors hover:text-gold-link">
            Home
          </Link>
          <span className="text-neutral-300">&gt;</span>
          <Link
            href="/products"
            className="transition-colors hover:text-gold-link"
          >
            Product
          </Link>
          <span className="text-neutral-300">&gt;</span>
          <span className="min-w-0 truncate text-neutral-700">
            {product.name.toUpperCase()}
          </span>
        </nav>

        <div className="grid min-w-0 grid-cols-1 gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[1.08fr_0.92fr] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch">
          <div className="min-w-0 space-y-4">
            <ProductGallery
              images={product.images}
              name={product.name}
              stockLevel={product.stock_level}
              youtubeId={attributes.youtube_id}
            />
          </div>

          <div className="min-w-0 flex flex-col gap-8 pb-0 pt-2 lg:min-h-0 lg:overflow-y-auto lg:pb-56">
            <ProductVariantSelector
              product={product}
              description={description}
              specifications={specifications}
            />
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
