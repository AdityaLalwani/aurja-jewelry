"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import type { JewelryProduct } from "@/lib/swell";

export function WishlistContent({ products }: { products: JewelryProduct[] }) {
  const { wishlistSlugs } = useStore();
  const savedProducts = wishlistSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is JewelryProduct => Boolean(product));

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
