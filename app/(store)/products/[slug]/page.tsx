import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/ProductActions";
import { ProductGallery } from "@/components/ProductGallery";
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
  const specifications: { label: string; value: string }[] = [
    {
      label: "Metal",
      value: `${attributes.metal_color} ${attributes.metal_type}`,
    },
    { label: "Metal weight", value: `${attributes.metal_weight_gms} g` },
    { label: "Gemstone", value: attributes.gemstone_type },
    ...(attributes.diamond_carat > 0
      ? [
          {
            label: "Diamond carat",
            value: `${attributes.diamond_carat} ct`,
          },
        ]
      : []),
    ...(attributes.diamond_clarity !== "N/A"
      ? [
          {
            label: "Diamond clarity",
            value: attributes.diamond_clarity,
          },
        ]
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

  const productStory =
    product.attributes.product_story ??
    "Handcrafted in our atelier, finished by hand, and accompanied by a certificate of authenticity.";
  const certificate = product.attributes.certificate ?? "Certificate of authenticity";
  const deliveryNote =
    product.attributes.delivery_text ??
    "Tomorrow, it's yours! 1-day delivery for orders placed before 3:30 PM for selected pincodes*.";

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
          <ProductGallery images={product.images} name={product.name} />

        </div>

        <div className="flex flex-col pt-2">
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
              {attributes.metal_type === "Gold" ? "18K Gold" : attributes.metal_type}
            </p>
            <h1 className="mt-4 font-display text-4xl uppercase leading-[1.05] tracking-[0.04em] text-neutral-900 sm:text-[2.8rem]">
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

          <div className="mt-6 space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            <p>{productStory}</p>
            <p className="text-neutral-500">{certificate}</p>
          </div>
        </div>
      </div>

      <div
        id="product-specifications"
        className="mt-12 scroll-mt-24 border-t border-neutral-200 pt-8"
      >
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {specifications.map((spec) => (
            <div
              key={spec.label}
              className="rounded-2xl border border-neutral-200 bg-white/40 p-5"
            >
              <dt className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                {spec.label}
              </dt>
              <dd className="mt-3 text-base text-neutral-900">{spec.value}</dd>
            </div>
          ))}
        </div>
      </div>

      <ProductActions product={product} />
    </div>
  );
}
