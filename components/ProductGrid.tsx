"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { JewelryProduct } from "@/lib/swell";

const METAL_FILTERS = ["Gold", "Platinum", "Silver"];
const GEMSTONE_FILTERS = ["Diamond", "Emerald", "Ruby", "None"];

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-colors ${
        active
          ? "border-gold bg-gold text-white"
          : "border-neutral-300 bg-white text-neutral-600 hover:border-gold hover:text-gold-link"
      }`}
    >
      {label}
    </button>
  );
}

export function ProductGrid({ products }: { products: JewelryProduct[] }) {
  const [selectedMetal, setSelectedMetal] = useState<string | null>(null);
  const [selectedGemstone, setSelectedGemstone] = useState<string | null>(null);

  const hasActiveFilters = selectedMetal !== null || selectedGemstone !== null;
  const filteredProducts = products.filter(
    (product) =>
      (!selectedMetal || product.attributes.metal_type === selectedMetal) &&
      (!selectedGemstone ||
        product.attributes.gemstone_type === selectedGemstone),
  );

  function clearFilters() {
    setSelectedMetal(null);
    setSelectedGemstone(null);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-8">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900">
            Metal Type
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {METAL_FILTERS.map((metal) => (
              <FilterChip
                key={metal}
                label={metal}
                active={selectedMetal === metal}
                onClick={() =>
                  setSelectedMetal(selectedMetal === metal ? null : metal)
                }
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900">
            Gemstone
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {GEMSTONE_FILTERS.map((gemstone) => (
              <FilterChip
                key={gemstone}
                label={gemstone}
                active={selectedGemstone === gemstone}
                onClick={() =>
                  setSelectedGemstone(
                    selectedGemstone === gemstone ? null : gemstone,
                  )
                }
              />
            ))}
          </div>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium tracking-wide text-gold-link underline underline-offset-4 hover:text-gold"
          >
            Clear all filters
          </button>
        )}
      </aside>

      <section>
        <p className="mb-6 text-xs uppercase tracking-[0.2em] text-neutral-500">
          Showing {filteredProducts.length} of {products.length} pieces
        </p>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-20 text-center">
            <p className="font-display text-xl text-neutral-700">
              No pieces match your selection
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
            >
              View the full collection
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
