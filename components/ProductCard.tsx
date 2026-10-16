"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice, useStore } from "@/components/StoreProvider";
import {
  addToCartAction,
  submitProductEnquiryAction,
} from "@/lib/cart-actions";
import { WishlistButton } from "@/components/WishlistButton";
import type { JewelryProduct } from "@/lib/swell";

const enquiryInputClasses =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold focus:outline-none";

const enquiryLabelClasses =
  "mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-neutral-500";

export function ProductCard({ product }: { product: JewelryProduct }) {
  const { currency, enquiredSlugs, isInCart, markEnquired } = useStore();
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [requestId, setRequestId] = useState("");
  const enquired = enquiredSlugs.includes(product.slug);
  const [state, formAction, pending] = useActionState(
    addToCartAction,
    undefined,
  );
  const [enquiryState, enquiryFormAction, enquiryPending] = useActionState(
    submitProductEnquiryAction,
    undefined,
  );
  const inCart = isInCart(product.slug) || Boolean(state?.success);

  useEffect(() => {
    if (enquiryState?.success) {
      markEnquired(product.slug);
    }
  }, [enquiryState?.success, markEnquired, product.slug]);

  function openEnquiry() {
    setRequestId(crypto.randomUUID());
    setEnquiryOpen(true);
  }

  function closeEnquiry() {
    if (enquiryPending) return;
    setEnquiryOpen(false);
    if (!enquiryState?.success) {
      setRequestId("");
    }
  }

  return (
    <>
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
        <p className="mt-auto pt-2 text-xl font-medium tracking-wide text-neutral-900">
          {formatPrice(product, currency)}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openEnquiry}
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

    {enquiryOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[130] grid place-items-center bg-neutral-950/55 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeEnquiry();
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby={`product-enquiry-title-${product.slug}`}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
                    Aurja Atelier
                  </p>
                  <h2
                    id={`product-enquiry-title-${product.slug}`}
                    className="mt-2 font-display text-2xl text-neutral-900"
                  >
                    Enquire about this piece
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Leave your details and our team will get in touch.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEnquiry}
                  disabled={enquiryPending}
                  aria-label="Close product enquiry form"
                  className="rounded-full px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 flex items-center gap-4 rounded-xl bg-neutral-50 p-4">
                {product.images[0] ? (
                  <Image
                    src={product.images[0]}
                    alt=""
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : null}
                <div>
                  <p className="font-medium text-neutral-900">{product.name}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {formatPrice(product, currency)}
                  </p>
                </div>
              </div>

              {enquiryState?.success ? (
                <div className="mt-6 rounded-xl bg-neutral-50 p-5">
                  <p role="status" className="text-sm leading-6 text-neutral-800">
                    {enquiryState.success}
                  </p>
                  <button
                    type="button"
                    onClick={() => setEnquiryOpen(false)}
                    className="mt-5 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form action={enquiryFormAction} className="mt-6 space-y-4">
                  <input type="hidden" name="requestId" value={requestId} />
                  <input type="hidden" name="slug" value={product.slug} />
                  <input type="hidden" name="currency" value={currency} />
                  <div>
                    <label
                      htmlFor={`product-enquiry-name-${product.slug}`}
                      className={enquiryLabelClasses}
                    >
                      Full name
                    </label>
                    <input
                      id={`product-enquiry-name-${product.slug}`}
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={120}
                      className={enquiryInputClasses}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`product-enquiry-phone-${product.slug}`}
                      className={enquiryLabelClasses}
                    >
                      Phone number
                    </label>
                    <input
                      id={`product-enquiry-phone-${product.slug}`}
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      required
                      maxLength={24}
                      className={enquiryInputClasses}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`product-enquiry-email-${product.slug}`}
                      className={enquiryLabelClasses}
                    >
                      Email address
                    </label>
                    <input
                      id={`product-enquiry-email-${product.slug}`}
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      className={enquiryInputClasses}
                    />
                  </div>
                  {enquiryState?.error ? (
                    <p role="alert" className="text-sm leading-6 text-red-600">
                      {enquiryState.error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={enquiryPending}
                    className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {enquiryPending ? "Sending enquiry…" : "Send enquiry"}
                  </button>
                </form>
              )}
            </section>
          </div>,
          document.body,
        )
      : null}
    </>
  );
}
