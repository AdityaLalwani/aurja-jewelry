"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { JewelryProduct } from "@/lib/swell";

type FacetKey =
  | "jewelleryType"
  | "productCategory"
  | "diamondCarat"
  | "shopFor"
  | "karatage"
  | "diamondClarity"
  | "metalColor"
  | "size";

type SortOrder = "featured" | "price-low" | "price-high" | "name";

const FACETS: { key: FacetKey; label: string }[] = [
  { key: "jewelleryType", label: "Jewellery Type" },
  { key: "productCategory", label: "Product Category" },
  { key: "diamondCarat", label: "Diamond Carat" },
  { key: "shopFor", label: "Shop For" },
  { key: "karatage", label: "Karatage Metal" },
  { key: "diamondClarity", label: "Diamond Clarity" },
  { key: "metalColor", label: "Metal Color" },
  { key: "size", label: "Size" },
];

function getFacetValue(product: JewelryProduct, key: FacetKey): string | null {
  const { attributes } = product;
  switch (key) {
    case "jewelleryType":
      return attributes.jewellery_type ?? null;
    case "productCategory":
      return attributes.product_category ?? null;
    case "diamondCarat":
      return attributes.diamond_carat > 0
        ? String(attributes.diamond_carat)
        : null;
    case "shopFor":
      return attributes.shop_for ?? null;
    case "karatage":
      return attributes.karatage ?? attributes.gold_purity ?? attributes.metal_type;
    case "diamondClarity":
      return attributes.diamond_clarity === "N/A"
        ? null
        : attributes.diamond_clarity;
    case "metalColor":
      return attributes.metal_color || null;
    case "size":
      return attributes.size ?? attributes.ring_size ?? null;
  }
}

function getFacetOptions(products: JewelryProduct[], key: FacetKey) {
  return Array.from(
    new Set(
      products
        .map((product) => getFacetValue(product, key))
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((first, second) =>
    key === "diamondCarat"
      ? Number(first) - Number(second)
      : first.localeCompare(second),
  );
}

export function ProductGrid({ products }: { products: JewelryProduct[] }) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFacets, setSelectedFacets] = useState<
    Record<FacetKey, string[]>
  >({
    jewelleryType: [],
    productCategory: [],
    diamondCarat: [],
    shopFor: [],
    karatage: [],
    diamondClarity: [],
    metalColor: [],
    size: [],
  });
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("featured");

  useEffect(() => {
    if (!filterOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setFilterOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [filterOpen]);

  const activeFilterCount =
    Object.values(selectedFacets).reduce(
      (count, values) => count + values.length,
      0,
    ) + (minimumPrice || maximumPrice ? 1 : 0);

  const filteredProducts = products
    .filter((product) => {
      const matchesFacets = FACETS.every(({ key }) => {
        const selected = selectedFacets[key];
        return (
          selected.length === 0 ||
          selected.includes(getFacetValue(product, key) ?? "")
        );
      });
      const price = product.price_inr;
      const matchesMinimum =
        minimumPrice === "" || price >= Number(minimumPrice);
      const matchesMaximum =
        maximumPrice === "" || price <= Number(maximumPrice);
      return matchesFacets && matchesMinimum && matchesMaximum;
    })
    .sort((first, second) => {
      if (sortOrder === "price-low") return first.price_inr - second.price_inr;
      if (sortOrder === "price-high") return second.price_inr - first.price_inr;
      if (sortOrder === "name") return first.name.localeCompare(second.name);
      return 0;
    });

  function toggleFacet(key: FacetKey, value: string) {
    setSelectedFacets((current) => {
      const selected = current[key];
      return {
        ...current,
        [key]: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      };
    });
  }

  function clearFilters() {
    setSelectedFacets({
      jewelleryType: [],
      productCategory: [],
      diamondCarat: [],
      shopFor: [],
      karatage: [],
      diamondClarity: [],
      metalColor: [],
      size: [],
    });
    setMinimumPrice("");
    setMaximumPrice("");
    setSortOrder("featured");
  }

  const priceRange =
    products.length > 0
      ? {
          minimum: Math.min(...products.map((product) => product.price_inr)),
          maximum: Math.max(...products.map((product) => product.price_inr)),
        }
      : { minimum: 0, maximum: 0 };

  return (
    <>
      <div className="mb-5 flex items-center justify-between border-y border-neutral-200 py-4">
        <p className="text-xs uppercase tracking-[0.16em] text-neutral-600">
          {filteredProducts.length} {filteredProducts.length === 1 ? "piece" : "pieces"}
        </p>
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          aria-haspopup="dialog"
          className="flex items-center gap-3 border border-neutral-900 px-5 py-3 text-xs font-medium uppercase tracking-[0.14em] text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="size-4"
          >
            <path
              d="M3 5h14M3 10h14M3 15h14M7 3v4m6 1v4m-4 1v4"
              stroke="currentColor"
              strokeWidth="1.4"
            />
          </svg>
          Sort &amp; Filter
          {activeFilterCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-gold text-[10px] text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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
            Clear filters
          </button>
        </div>
      )}

      {filterOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-neutral-950/50"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setFilterOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-filter-title"
            className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 sm:px-8">
              <div>
                <h2
                  id="catalog-filter-title"
                  className="font-display text-2xl text-neutral-900"
                >
                  Sort &amp; Filter
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "piece" : "pieces"} available
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                aria-label="Close sort and filter"
                className="flex size-10 items-center justify-center rounded-full border border-neutral-200 text-xl text-neutral-700 hover:bg-neutral-100"
              >
                ×
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 sm:px-8">
              <div className="border-b border-neutral-200 py-5">
                <label
                  htmlFor="product-sort"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-800"
                >
                  Sort
                </label>
                <select
                  id="product-sort"
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value as SortOrder)
                  }
                  className="mt-3 w-full rounded-none border border-neutral-300 bg-white px-3 py-3 text-sm text-neutral-800 outline-none focus:border-gold"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              <fieldset className="border-b border-neutral-200 py-5">
                <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-800">
                  Price
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="text-xs text-neutral-500">
                    Minimum (₹)
                    <input
                      type="number"
                      min={priceRange.minimum}
                      max={priceRange.maximum}
                      value={minimumPrice}
                      placeholder={String(priceRange.minimum)}
                      onChange={(event) => setMinimumPrice(event.target.value)}
                      className="mt-1 w-full border border-neutral-300 px-3 py-3 text-sm text-neutral-900 outline-none focus:border-gold"
                    />
                  </label>
                  <label className="text-xs text-neutral-500">
                    Maximum (₹)
                    <input
                      type="number"
                      min={priceRange.minimum}
                      max={priceRange.maximum}
                      value={maximumPrice}
                      placeholder={String(priceRange.maximum)}
                      onChange={(event) => setMaximumPrice(event.target.value)}
                      className="mt-1 w-full border border-neutral-300 px-3 py-3 text-sm text-neutral-900 outline-none focus:border-gold"
                    />
                  </label>
                </div>
              </fieldset>

              {FACETS.map(({ key, label }) => {
                const options = getFacetOptions(products, key);
                return (
                  <fieldset
                    key={key}
                    className="border-b border-neutral-200 py-5"
                  >
                    <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-800">
                      {label}
                    </legend>
                    {options.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                        {options.map((option) => (
                          <label
                            key={option}
                            className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFacets[key].includes(option)}
                              onChange={() => toggleFacet(key, option)}
                              className="size-4 accent-[#b88a44]"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-neutral-400">
                        No options available
                      </p>
                    )}
                  </fieldset>
                );
              })}
            </div>

            <footer className="flex items-center gap-3 border-t border-neutral-200 bg-white px-6 py-4 sm:px-8">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 border border-neutral-300 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-neutral-700 transition-colors hover:border-neutral-900"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex-1 bg-neutral-900 px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-white transition-colors hover:bg-neutral-700"
              >
                Show {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "piece" : "pieces"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
