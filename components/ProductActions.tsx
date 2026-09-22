"use client";

import { useActionState } from "react";
import Link from "next/link";
import { formatPrice, useStore } from "@/components/StoreProvider";
import { addToCartAction } from "@/lib/cart-actions";
import { WishlistButton } from "@/components/WishlistButton";
import {
  submitCustomQuoteRequest,
  type JewelryProduct,
} from "@/lib/swell";

export function ProductActions({ product }: { product: JewelryProduct }) {
  const { currency, enquiredSlugs, isInCart, markEnquired } = useStore();
  const enquired = enquiredSlugs.includes(product.slug);
  const inCart = isInCart(product.slug);
  const [state, formAction, pending] = useActionState(
    addToCartAction,
    undefined,
  );

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
    <div className="space-y-6">
      <WishlistButton slug={product.slug} />
      <p className="font-display text-3xl tracking-wide text-neutral-900">
        {formatPrice(product, currency)}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleGetInTouch}
          disabled={enquired}
          className={`flex-1 rounded-full px-6 py-3 text-sm font-medium transition-colors ${
            enquired
              ? "cursor-default bg-neutral-100 text-neutral-500"
              : "bg-gold text-white hover:bg-gold-dark"
          }`}
        >
          {enquired ? "Enquiry Sent ✓" : "Get in Touch"}
        </button>
        {/* redirect=cart sends the detail-page add straight to the cart page */}
        {inCart ? (
          <Link
            href="/cart"
            className="flex-1 rounded-full border border-gold bg-gold/10 px-6 py-3 text-center text-sm font-medium text-gold-link transition-colors hover:bg-gold/20"
          >
            Go to Cart
          </Link>
        ) : (
          <form action={formAction} className="flex-1">
            <input type="hidden" name="slug" value={product.slug} />
            <input type="hidden" name="quantity" value="1" />
            <input type="hidden" name="redirect" value="cart" />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-60"
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

      <p className="text-xs leading-5 text-neutral-500">
        Each piece is made to order in the Aurja atelier. Have something
        bespoke in mind? Send an enquiry and we will craft it with you.
      </p>
    </div>
  );
}
