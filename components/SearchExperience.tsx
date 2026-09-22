"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import type { JewelryProduct } from "@/lib/swell";

const inputClasses =
  "w-full rounded-full border border-neutral-300 bg-white py-3.5 pl-5 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold focus:outline-none";
const SUGGESTIONS = ["Diamond", "Emerald", "Gold", "Platinum", "Ruby"];

function matchesQuery(product: JewelryProduct, query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = [
    product.name,
    product.attributes.metal_type,
    product.attributes.metal_color,
    product.attributes.gemstone_type,
  ]
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

function SearchInput({ products }: { products: JewelryProduct[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const trimmed = query.trim();
  const results = trimmed
    ? products.filter((product) => matchesQuery(product, trimmed))
    : [];

  return (
    <>
      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search the catalogue"
            placeholder="Search by piece, metal, or stone…"
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

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setQuery(suggestion)}
            className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-xs font-medium tracking-wide text-neutral-600 transition-colors hover:border-gold hover:text-gold-link"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {trimmed ? (
        results.length > 0 ? (
          <section className="mt-12">
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
          <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center">
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
        <p className="mt-12 text-sm leading-6 text-neutral-500">
          Start typing above, or pick a suggestion to begin.
        </p>
      )}
    </>
  );
}

export function SearchExperience({ products }: { products: JewelryProduct[] }) {
  return (
    <Suspense
      fallback={
        <div className="mt-10 h-[52px] rounded-full border border-neutral-300 bg-white" />
      }
    >
      <SearchInput products={products} />
    </Suspense>
  );
}
