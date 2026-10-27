"use client";

import Image from "next/image";
import Link from "next/link";
import { lazy, Suspense, useActionState, useState } from "react";
import { formatPrice, useStore } from "@/components/StoreProvider";
import { addToCartAction } from "@/lib/cart-actions";
import { WishlistButton } from "@/components/WishlistButton";
import type { JewelryProduct } from "@/lib/swell";

const ProductEnquiryDialog = lazy(() =>
  import("@/components/ProductEnquiryDialog").then((module) => ({
    default: module.ProductEnquiryDialog,
  })),
);

export function ProductCard({
  product,
  priority = false,
}: {
  product: JewelryProduct;
  priority?: boolean;
}) {
  const { currency, enquiredSlugs, isInCart } = useStore();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const enquired = enquiredSlugs.includes(product.slug);
  const [state, formAction, pending] = useActionState(
    addToCartAction,
    undefined,
  );
  const inCart = isInCart(product.slug) || Boolean(state?.success);

  function openEnquiry() {
    setEnquiryOpen(true);
  }

  return (
    <>
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-neutral-100 sm:aspect-[4/5]">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 block focus:outline-none"
        >
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              priority={priority}
              quality={70}
              sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 30vw, 50vw"
              className={`object-cover transition-transform duration-500 ease-in-out motion-reduce:transition-none ${
                product.images[1]
                  ? "group-hover:-translate-x-full"
                  : "group-hover:scale-105"
              }`}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-neutral-400">
              Image unavailable
            </div>
          )}
          {product.images[1] ? (
            <Image
              src={product.images[1]}
              alt=""
              aria-hidden="true"
              fill
              quality={70}
              sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 30vw, 50vw"
              className="translate-x-full object-cover transition-transform duration-500 ease-in-out group-hover:translate-x-0 motion-reduce:transition-none"
            />
          ) : null}
        </Link>
        <WishlistButton
          slug={product.slug}
          className="absolute right-3 top-3 z-10"
        />
        {product.stock_level === 1 ? (
          <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-800 shadow-sm">
            Only 1 left
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2 sm:gap-3 sm:p-5">
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-1 font-display text-xs leading-snug text-neutral-900 transition-colors hover:text-gold-link sm:line-clamp-2 sm:text-lg"
        >
          {product.name}
        </Link>
        {/* <ul className="space-y-1 text-xs leading-5 text-neutral-500">
          <li>
            {attributes.metal_color} {attributes.metal_type} ·{" "}
            {attributes.metal_weight_gms} g
          </li>
          {attributes.gemstone_type !== "None" && (
            <li>
              {attributes.gemstone_type}
              {attributes.gemstone_type === "Diamond" &&
                ` · ${attributes.diamond_carat} ct · ${attributes.diamond_clarity}`}
            </li>
          )}
          {attributes.gemstone_type !== "Diamond" &&
            attributes.diamond_carat > 0 && (
              <li>Accent diamonds · {attributes.diamond_carat} ct</li>
            )}
        </ul> */}
        <p className="mt-auto pt-0.5 text-sm font-medium tracking-wide text-neutral-900 sm:pt-2 sm:text-xl">
          {formatPrice(product, currency)}
        </p>
        <div className="flex gap-1 sm:gap-2">
          <button
            type="button"
            onClick={openEnquiry}
            disabled={enquired}
            className={`min-w-0 flex-1 whitespace-nowrap rounded-full px-1.5 py-1.5 text-[10px] font-medium transition-colors sm:px-4 sm:py-2.5 sm:text-sm ${
              enquired
                ? "cursor-default bg-neutral-100 text-neutral-500"
                : "bg-gold text-white hover:bg-gold-dark"
            }`}
          >
            <span className="sm:hidden">{enquired ? "Enquired ✓" : "Enquire"}</span>
            <span className="hidden sm:inline">
              {enquired ? "Enquiry Sent ✓" : "Get in Touch"}
            </span>
          </button>
          {/* Stays on the grid — only the detail page redirects to the cart. */}
          {inCart ? (
            <Link
              href="/cart"
              className="min-w-0 flex-1 whitespace-nowrap rounded-full border border-gold bg-gold/10 px-1.5 py-1.5 text-center text-[10px] font-medium text-gold-link transition-colors hover:bg-gold/20 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <span className="sm:hidden">In cart</span>
              <span className="hidden sm:inline">Go to Cart</span>
            </Link>
          ) : (
            <form action={formAction} className="min-w-0 flex-1">
              <input type="hidden" name="slug" value={product.slug} />
              <input type="hidden" name="quantity" value="1" />
              <button
                type="submit"
                disabled={pending}
                aria-label={pending ? "Adding to cart" : "Add to cart"}
                className="w-full whitespace-nowrap rounded-full border border-neutral-300 px-1.5 py-1.5 text-[10px] font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-60 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <span className="sm:hidden">{pending ? "Adding…" : "Add"}</span>
                <span className="hidden sm:inline">
                  {pending ? "Adding…" : "Add to Cart"}
                </span>
              </button>
              {state?.error ? (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {state.error}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </article>

    {enquiryOpen ? (
      <Suspense fallback={null}>
        <ProductEnquiryDialog
          product={product}
          currency={currency}
          onClose={() => setEnquiryOpen(false)}
        />
      </Suspense>
    ) : null}
    </>
  );
}
