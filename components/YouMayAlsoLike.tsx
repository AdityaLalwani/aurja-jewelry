import { ProductCard } from "@/components/ProductCard";
import type { JewelryProduct } from "@/lib/catalog";

export function YouMayAlsoLike({
  products,
}: {
  products: JewelryProduct[];
}) {
  return (
    <ProductRecommendationSection
      products={products}
      eyebrow="Curated for you"
      title="You may also like"
      description="Discover more pieces chosen to complement your style."
      background="bg-[#f8f6f2]"
    />
  );
}

export function ExploreSimilarDesigns({
  products,
}: {
  products: JewelryProduct[];
}) {
  return (
    <ProductRecommendationSection
      products={products}
      eyebrow="More to discover"
      title="Explore similar designs"
      description="Discover more designs selected to match your style."
      background="bg-[#f8f6f2]"
    />
  );
}

function ProductRecommendationSection({
  products,
  eyebrow,
  title,
  description,
  background,
}: {
  products: JewelryProduct[];
  eyebrow: string;
  title: string;
  description: string;
  background: string;
}) {
  if (products.length === 0) return null;

  return (
    <section
      aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-title`}
      className={`w-full ${background} py-12 sm:py-16`}
    >
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-gold-link">
            {eyebrow}
          </p>
          <h2
            id={`${title.toLowerCase().replaceAll(" ", "-")}-title`}
            className="font-display text-2xl text-neutral-900 sm:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">
            {description}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              variant="recommendation"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
