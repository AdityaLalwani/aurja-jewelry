"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useHydrationSafeWishlistSlugs } from "@/components/StoreProvider";
import type { JewelryProduct } from "@/lib/swell";
import { loadJewelryProductsBySlugs } from "@/lib/product-actions";

export function WishlistContent() {
  const wishlistSlugs = useHydrationSafeWishlistSlugs();
  const [retryCount, setRetryCount] = useState(0);
  const [loadResult, setLoadResult] = useState<{
    key: string;
    products: JewelryProduct[];
    error?: string;
  }>({ key: "", products: [] });
  const requestKey = `${retryCount}:${JSON.stringify(wishlistSlugs)}`;

  useEffect(() => {
    if (wishlistSlugs.length === 0) return;

    let active = true;
    void loadJewelryProductsBySlugs(wishlistSlugs)
      .then((loadedProducts) => {
        if (active) {
          setLoadResult({ key: requestKey, products: loadedProducts });
        }
      })
      .catch((error: unknown) => {
        console.error("Could not load wishlist products", error);
        if (active) {
          setLoadResult({
            key: requestKey,
            products: [],
            error: "We could not load your saved pieces. Please try again.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [requestKey, wishlistSlugs]);

  const requestComplete = loadResult.key === requestKey;
  const products = requestComplete ? loadResult.products : [];
  const loading = wishlistSlugs.length > 0 && !requestComplete;
  const loadError = requestComplete ? loadResult.error : "";

  const savedProducts = wishlistSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is JewelryProduct => Boolean(product));

  if (wishlistSlugs.length > 0 && loading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-16 text-sm text-neutral-500 sm:px-6">
        Loading your saved pieces…
      </div>
    );
  }

  if (wishlistSlugs.length > 0 && loadError) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <p role="alert" className="text-sm text-red-600">
          {loadError}
        </p>
        <button
          type="button"
          onClick={() => setRetryCount((count) => count + 1)}
          className="mt-6 rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
        >
          Try again
        </button>
      </div>
    );
  }

  if (savedProducts.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gold/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-9 w-9 text-gold"
            aria-hidden="true"
          >
            <path d="M12 20.5c-5.5-4-8.5-7-8.5-10.5a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2c0 3.5-3 6.5-8.5 10.5z" />
          </svg>
        </div>
        <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-gold">
          Wishlist
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          Nothing saved yet
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Pieces you fall in love with will wait for you here. Until then, the
          atelier is yours to explore.
        </p>
        <Link
          href="/products"
          className="mt-8 rounded-full bg-gold px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
        >
          Explore the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-10 sm:px-6">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          Wishlist
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          Pieces worth keeping close
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {savedProducts.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}
