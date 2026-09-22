"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { formatPrice, useStore } from "@/components/StoreProvider";
import { addToCartAction } from "@/lib/cart-actions";
import { WishlistButton } from "@/components/WishlistButton";
import {
  submitCustomQuoteRequest,
  type JewelryProduct,
} from "@/lib/swell";

export function ProductCard({ product }: { product: JewelryProduct }) {
  const { currency, enquiredSlugs, isInCart, markEnquired } = useStore();
  const enquired = enquiredSlugs.includes(product.slug);
  const [state, formAction, pending] = useActionState(
    addToCartAction,
    undefined,
  );
  const inCart = isInCart(product.slug) || Boolean(state?.success);
  const { attributes } = product;

  async function handleGetInTouch() {
    await submitCustomQuoteRequest({
      productSlug: product.slug,
      name: "Guest",
      email: "guest@aurja.example",
      message: `I would like to know more about the ${product.name}.`,
    });
    markEnquired(product.slug);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <Link
        href={`/products/${product.slug}`}
        className="block focus:outline-none"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          <WishlistButton slug={product.slug} className="absolute right-3 top-3 z-10" />
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-neutral-400">
              Image coming soon
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link
          href={`/products/${product.slug}`}
          className="font-display text-lg leading-snug text-neutral-900 transition-colors hover:text-gold-link"
        >
          {product.name}
        </Link>
        <ul className="space-y-1 text-xs leading-5 text-neutral-500">
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
        </ul>
        <p className="mt-auto pt-2 text-xl font-medium tracking-wide text-neutral-900">
          {formatPrice(product, currency)}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGetInTouch}
            disabled={enquired}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
              enquired
                ? "cursor-default bg-neutral-100 text-neutral-500"
                : "bg-gold text-white hover:bg-gold-dark"
            }`}
          >
            {enquired ? "Enquiry Sent ✓" : "Get in Touch"}
          </button>
          {/* Stays on the grid — only the detail page redirects to the cart. */}
          {inCart ? (
            <Link
              href="/cart"
              className="rounded-full border border-gold bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold-link transition-colors hover:bg-gold/20"
            >
              Go to Cart
            </Link>
          ) : (
            <form action={formAction}>
              <input type="hidden" name="slug" value={product.slug} />
              <input type="hidden" name="quantity" value="1" />
              <button
                type="submit"
                disabled={pending}
                className="rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-60"
              >
                {pending ? "Adding…" : "Add to Cart"}
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
  );
}
