import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductActions } from "@/components/ProductActions";
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
  ];

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-10 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 text-xs uppercase tracking-[0.2em] text-neutral-500"
      >
        <Link href="/products" className="transition-colors hover:text-gold-link">
          Collection
        </Link>
        <span className="mx-2 text-neutral-300">/</span>
        <span className="text-neutral-700">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(min-width: 1024px) 46vw, 92vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-neutral-400">
                Image coming soon
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1).map((image, index) => (
                <div
                  key={image}
                  className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100"
                >
                  <Image
                    src={image}
                    alt={`${product.name} — view ${index + 2}`}
                    fill
                    sizes="(min-width: 1024px) 11vw, 23vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
              {attributes.metal_type === "Gold" ? "18k Gold" : attributes.metal_type}
            </p>
            <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
              {product.name}
            </h1>
          </div>

          <ProductActions product={product} />

          <div className="border-t border-neutral-200/80 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900">
              Specifications
            </h2>
            <dl className="mt-4 divide-y divide-neutral-200/80">
              {specifications.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <dt className="text-xs uppercase tracking-[0.15em] text-neutral-500">
                    {spec.label}
                  </dt>
                  <dd className="text-sm text-neutral-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="text-sm leading-6 text-neutral-500">
            Handcrafted in our atelier, finished by hand, and accompanied by a
            certificate of authenticity. Allow two to three weeks for made-to-
            order pieces.
          </p>
        </div>
      </div>
    </div>
  );
}
