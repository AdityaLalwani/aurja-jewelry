import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/ProductActions";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductSpecifications } from "@/components/ProductSpecifications";
import { getJewelryProductBySlug } from "@/lib/swell";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  props: ProductPageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getJewelryProductBySlug(slug);

  return {
    title: product ? `${product.name} — Aurja` : "Piece not found — Aurja",
  };
}

export default async function ProductPage(props: ProductPageProps) {
  const { slug } = await props.params;
  const product = await getJewelryProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const { attributes } = product;
  const metalLabel =
    [attributes.metal_color, attributes.metal_type].filter(Boolean).join(" ") ||
    "Metal";
  const specifications: { label: string; value: string }[] = [
    ...(metalLabel && metalLabel !== "Metal"
      ? [{ label: "Metal", value: metalLabel }]
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
    ...(attributes.size
      ? [{ label: "Size", value: attributes.size }]
      : []),
  ];
  return (
    <div className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-32 pt-8 sm:px-6 lg:px-10">
      <nav
        aria-label="Breadcrumb"
        className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-neutral-500"
      >
        <Link href="/" className="transition-colors hover:text-gold-link">
          Home
        </Link>
        <span className="text-neutral-300">&gt;</span>
        <Link href="/products" className="transition-colors hover:text-gold-link">
          Product
        </Link>
        <span className="text-neutral-300">&gt;</span>
        <span className="text-neutral-700">{product.name.toUpperCase()}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
        <div className="space-y-4">
          <ProductGallery
            images={product.images}
            name={product.name}
            stockLevel={product.stock_level}
            youtubeId={attributes.youtube_id}
          />

        </div>

        <div className="flex flex-col gap-8 pt-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
              {attributes.metal_type === "Gold" ? "18K Gold" : attributes.metal_type}
            </p>
            <h1 className="mt-3 font-display text-4xl uppercase leading-[1.05] tracking-[0.04em] text-neutral-900 sm:text-[2.8rem]">
              {product.name}
            </h1>
          </div>

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-[2.75rem] leading-none tracking-[-0.04em] text-neutral-900">
                ₹{new Intl.NumberFormat("en-IN").format(product.price_inr)}
              </p>
              <p className="mt-2 text-sm text-neutral-500">Inclusive of all taxes*</p>
            </div>
          </div>

          {product.description ? (
            <section aria-labelledby="product-description">
              <h2
                id="product-description"
                className="text-xs uppercase tracking-[0.2em] text-neutral-500"
              >
                Product description
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-neutral-700">
                {product.description}
              </p>
            </section>
          ) : null}

          <section
            id="product-specifications"
            className="scroll-mt-24 border-t border-neutral-200"
            aria-labelledby="product-specifications-heading"
          >
            <h2
              id="product-specifications-heading"
              className="mb-4 text-xs uppercase tracking-[0.2em] text-neutral-500"
            >
              Product specifications
            </h2>
            <ProductSpecifications specifications={specifications} />
          </section>
        </div>
      </div>

      <ProductActions product={product} />
    </div>
  );
}
