"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import type { JewelryProduct } from "@/lib/swell";
import { imageKitLoader, normalizeImageSource } from "@/lib/imagekit";
import { home } from "@/lib/site";

const inputClasses =
  "w-full rounded-full border border-neutral-300 bg-white py-3.5 pl-5 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold focus:outline-none";
const SECTION_SPACING = "mt-12";
const SECTION_CONTENT_SPACING = "mt-6";
const SECTION_HEADING_CLASS =
  "font-display text-base font-normal text-neutral-700";
const PLACEHOLDER_TERMS = ["necklace", "diamond jewellery", "rings", "SKU"];

type CategoryIllustrationName =
  | "rings"
  | "earrings"
  | "pendant"
  | "bracelet"
  | "necklace"
  | "pendant-chain"
  | "pendant-set"
  | "silver"
  | "solitaire";

type SearchCategory = {
  slug: string;
  name: string;
  illustration: CategoryIllustrationName;
};

const SEARCH_CATEGORIES: SearchCategory[] = home.categories.items.map(
  (category) => ({
    slug: category.slug,
    name: category.name,
    illustration:
      category.slug === "rings"
        ? "rings"
        : category.slug === "earrings"
          ? "earrings"
          : category.slug === "pendants"
            ? "pendant"
            : category.slug === "bracelets"
              ? "bracelet"
              : category.slug === "necklaces"
                ? "necklace"
                : category.slug === "silver"
                  ? "silver"
                  : "solitaire",
  }),
);

function CategoryIllustration({
  name,
}: {
  name: CategoryIllustrationName;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.25"
      className="h-12 w-12 text-neutral-700"
      aria-hidden="true"
    >
      {name === "solitaire" && (
        <>
          <ellipse cx="31" cy="39" rx="19" ry="8" transform="rotate(-35 31 39)" />
          <ellipse cx="31" cy="39" rx="14" ry="4.5" transform="rotate(-35 31 39)" />
          <path d="m25 24 6-7 6 7-6 10-6-10Z" />
          <path d="m25 24 6 3 6-3M31 27v7" className="text-[#a51f27]" />
          <path d="m21 41 16-11" className="text-[#a51f27]" />
        </>
      )}
      {name === "earrings" && (
        <>
          <path d="M22 15c0 3-4 4-4 8s4 4 4 7 4 4 4 7-4 4-4 7" />
          <path d="M42 15c0 3 4 4 4 8s-4 4-4 7-4 4-4 7 4 4 4 7" />
          <path d="m22 22-5 5 5 5 5-5-5-5ZM42 22l-5 5 5 5 5-5-5-5Z" className="text-[#a51f27]" />
          <path d="m22 36-4 5 4 7 4-7-4-5ZM42 36l-4 5 4 7 4-7-4-5Z" />
          <path d="m22 36 4 5-4 7-4-7 4-5ZM42 36l4 5-4 7-4-7 4-5Z" className="text-[#a51f27]" />
          <circle cx="22" cy="14" r="2" />
          <circle cx="42" cy="14" r="2" />
        </>
      )}
      {name === "rings" && (
        <>
          <ellipse cx="31" cy="38" rx="21" ry="9" transform="rotate(35 31 38)" />
          <ellipse cx="31" cy="38" rx="16" ry="5.5" transform="rotate(35 31 38)" />
          <path d="m20 23 8-7 8 7-8 9-8-9Z" />
          <path d="m20 23 8 3 8-3M28 26v6" className="text-[#a51f27]" />
          <path d="m14 36 24 15" className="text-[#a51f27]" />
        </>
      )}
      {name === "silver" && (
        <>
          <ellipse cx="28" cy="32" rx="20" ry="9" transform="rotate(-35 28 32)" />
          <ellipse cx="28" cy="32" rx="15" ry="5" transform="rotate(-35 28 32)" />
          <ellipse cx="36" cy="32" rx="20" ry="9" transform="rotate(35 36 32)" />
          <ellipse cx="36" cy="32" rx="15" ry="5" transform="rotate(35 36 32)" />
          <path d="m15 41 5-2m24-14 5-2M19 24l5-2m17 20 5-2" className="text-neutral-400" />
        </>
      )}
      {name === "pendant" && (
        <>
          <path d="M31 7v11" />
          <path d="m28 18 3-4 3 4" />
          <path d="M31 20c-2 7-12 11-12 20a12 12 0 0 0 24 0c0-9-10-13-12-20Z" />
          <path d="m31 25-7 13 7 12 7-12-7-13Z" />
          <path d="m24 38 7 3 7-3M31 25v26" className="text-[#a51f27]" />
        </>
      )}
      {name === "bracelet" && (
        <g transform="translate(1 7)">
          <path d="M15 40C4 40 4 30 7 22 12 10 25 5 37 6c12 1 21 7 21 16 0 3-1 6-3 8" />
          <g transform="rotate(-8 16 39)">
            <rect x="12" y="36" width="8" height="6" rx="2" />
            <path d="M16 36v6" className="text-[#a51f27]" />
          </g>
          <g transform="rotate(-5 23 40)">
            <rect x="19" y="37" width="8" height="6" rx="2" />
            <path d="M23 37v6" className="text-[#a51f27]" />
          </g>
          <g transform="rotate(-8 30 39)">
            <rect x="26" y="36" width="8" height="6" rx="2" />
            <path d="M30 36v6" className="text-[#a51f27]" />
          </g>
          <g transform="rotate(-15 37 37)">
            <rect x="33" y="34" width="8" height="6" rx="2" />
            <path d="M37 34v6" className="text-[#a51f27]" />
          </g>
          <g transform="rotate(-25 43 34)">
            <rect x="39" y="31" width="8" height="6" rx="2" />
            <path d="M43 31v6" className="text-[#a51f27]" />
          </g>
          <g transform="rotate(-38 48 30)">
            <rect x="44" y="27" width="8" height="6" rx="2" />
            <path d="M48 27v6" className="text-[#a51f27]" />
          </g>
          <g transform="rotate(-52 52 25)">
            <rect x="48" y="22" width="8" height="6" rx="2" />
            <path d="M52 22v6" className="text-[#a51f27]" />
          </g>
          <g transform="rotate(-65 55 20)">
            <rect x="51" y="17" width="8" height="6" rx="2" />
            <path d="M55 17v6" className="text-[#a51f27]" />
          </g>
        </g>
      )}
      {name === "necklace" && (
        <g transform="translate(0 -2)">
          <path d="M14 5c0 16 6 31 18 37 12-6 18-21 18-37" />
          <path d="M32 42v3" />
          <path d="m32 46 7 4v8l-7 4-7-4v-8l7-4Z" />
          <path d="m32 46v8m0 8v-8m0 0 7-4m-7 4-7-4m7 4 7 4m-7-4-7 4" />
        </g>
      )}
      {name === "pendant-chain" && (
        <>
          <path d="m12 7 16 31M52 7 36 38" />
          <path d="M31 7v25" />
          <path d="m28 32 3-4 3 4" />
          <path d="M31 34c-2 6-10 9-10 17a10 10 0 0 0 20 0c0-8-8-11-10-17Z" />
          <path d="m31 39-6 10 6 8 6-8-6-10Z" />
          <path d="m25 49 6 2 6-2M31 39v18" className="text-[#a51f27]" />
        </>
      )}
      {name === "pendant-set" && (
        <>
          <path d="M28 7v11" />
          <path d="m25 18 3-4 3 4" />
          <path d="M28 20c-2 6-10 9-10 17a10 10 0 0 0 20 0c0-8-8-11-10-17Z" />
          <path d="m28 25-6 12 6 10 6-10-6-12Z" />
          <path d="m22 37 6 3 6-3M28 25v22" className="text-[#a51f27]" />
          <path d="M47 22c0 3-4 4-4 7s4 4 4 7 4 4 4 7" />
          <path d="m47 27-4 4 4 4 4-4-4-4ZM47 39l-4 4 4 7 4-7-4-4Z" className="text-[#a51f27]" />
        </>
      )}
    </svg>
  );
}

function matchesQuery(product: JewelryProduct, query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = [
    product.name,
    product.sku,
    product.description,
    product.attributes.product_story,
    product.attributes.metal_type,
    product.attributes.metal_color,
    product.attributes.gemstone_type,
    product.attributes.diamond_clarity,
    product.attributes.diamond_carat,
    product.attributes.stone_shape,
    product.attributes.diamond_cut,
    ...(product.stone_details ?? []).flatMap((detail) =>
      Object.values(detail),
    ),
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

function SearchInput({
  products,
  popularProducts,
}: {
  products: JewelryProduct[];
  popularProducts: JewelryProduct[];
}) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const trimmed = query.trim();
  const results = trimmed
    ? products.filter((product) => matchesQuery(product, trimmed))
    : [];

  useEffect(() => {
    if (
      query ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setPlaceholderIndex((index) => (index + 1) % PLACEHOLDER_TERMS.length);
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [query]);

  return (
    <>
      <form
        role="search"
        onSubmit={(event) => event.preventDefault()}
        className="mt-8"
      >
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search the catalogue"
            placeholder={`Search ${PLACEHOLDER_TERMS[placeholderIndex]}`}
            className={inputClasses}
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>
      </form>

      {trimmed ? (
        results.length > 0 ? (
          <section className={SECTION_SPACING}>
            <p className="mb-6 text-xs uppercase tracking-[0.2em] text-neutral-500">
              Showing {results.length} {results.length === 1 ? "piece" : "pieces"}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </section>
        ) : (
          <div
            className={`${SECTION_SPACING} flex flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center`}
          >
            <p className="font-display text-xl text-neutral-700">
              No pieces match &ldquo;{trimmed}&rdquo;
            </p>
            <p className="max-w-sm text-sm leading-6 text-neutral-500">
              Try a different metal or stone — or browse the full collection.
            </p>
            <Link
              href="/products"
              className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
            >
              View the full collection
            </Link>
          </div>
        )
      ) : (
        <section
          className={SECTION_SPACING}
          aria-labelledby="search-category-heading"
        >
          <h2
            id="search-category-heading"
            className={SECTION_HEADING_CLASS}
          >
            Shop by Category
          </h2>
          <div
            className={`-mx-4 ${SECTION_CONTENT_SPACING} flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-6 sm:gap-x-5 sm:overflow-visible sm:px-0 sm:pb-0`}
          >
            {SEARCH_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                aria-label={`Shop ${category.name}`}
                className="group flex w-[88px] shrink-0 snap-start flex-col items-center rounded-lg text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 sm:w-auto"
              >
                <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border border-neutral-200 bg-white transition-colors group-hover:border-gold sm:h-[88px] sm:w-[88px]">
                  <CategoryIllustration name={category.illustration} />
                </span>
                <span className="mt-3 max-w-full text-[10px] uppercase leading-4 tracking-[0.07em] text-neutral-700 group-hover:text-gold-link sm:whitespace-nowrap sm:text-xs sm:tracking-wide">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {!trimmed && popularProducts.length > 0 && (
        <section
          className={SECTION_SPACING}
          aria-labelledby="trending-products-heading"
        >
          <h2
            id="trending-products-heading"
            className={SECTION_HEADING_CLASS}
          >
            Trending Products
          </h2>
          <div
            className={`-mx-4 ${SECTION_CONTENT_SPACING} flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:mx-0 sm:gap-6 sm:px-0`}
          >
            {popularProducts.map((product) => (
              <div
                key={product.slug}
                className="w-[31%] min-w-[31%] shrink-0 snap-start text-center sm:w-[22%] sm:min-w-[22%]"
              >
                <Link
                  href={`/products/${product.slug}`}
                  aria-label={product.name}
                  className="group relative block aspect-[1.23] overflow-hidden rounded-lg bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                >
                  {product.images[0] ? (
                    <Image
                      src={normalizeImageSource(product.images[0])}
                      loader={imageKitLoader}
                      alt=""
                      fill
                      quality={70}
                      sizes="(min-width: 640px) 30vw, 32vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-neutral-500">
                      Image unavailable
                    </span>
                  )}
                </Link>
                <Link
                  href={`/products/${product.slug}`}
                  className="mt-2 line-clamp-2 block font-display text-xs leading-tight text-neutral-900 focus-visible:outline-none focus-visible:underline sm:text-sm"
                >
                  {product.name}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export function SearchExperience({
  products,
  popularProducts,
}: {
  products: JewelryProduct[];
  popularProducts: JewelryProduct[];
}) {
  return (
    <Suspense
      fallback={
        <div className="mt-8 h-[52px] rounded-full border border-neutral-300 bg-white" />
      }
    >
      <SearchInput products={products} popularProducts={popularProducts} />
    </Suspense>
  );
}
