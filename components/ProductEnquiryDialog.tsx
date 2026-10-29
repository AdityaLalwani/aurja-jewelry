"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice, useStore, type Currency } from "@/components/StoreProvider";
import { submitProductEnquiryAction } from "@/lib/cart-actions";
import type { JewelryProduct } from "@/lib/swell";
import { imageKitLoader, normalizeImageSource } from "@/lib/imagekit";

const enquiryInputClasses =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold focus:outline-none";

const enquiryLabelClasses =
  "mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-neutral-500";

export function ProductEnquiryDialog({
  product,
  currency,
  onClose,
}: {
  product: JewelryProduct;
  currency: Currency;
  onClose: () => void;
}) {
  const { markEnquired } = useStore();
  const [requestId] = useState(() => crypto.randomUUID());
  const [state, formAction, pending] = useActionState(
    submitProductEnquiryAction,
    undefined,
  );

  useEffect(() => {
    if (state?.success) {
      markEnquired(product.slug);
    }
  }, [markEnquired, product.slug, state?.success]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[130] grid place-items-center bg-neutral-950/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
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
            onClick={onClose}
            disabled={pending}
            aria-label="Close product enquiry form"
            className="rounded-full px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
          >
            Close
          </button>
        </div>

        <div className="mt-6 flex items-center gap-4 rounded-xl bg-neutral-50 p-4">
          {product.images[0] ? (
            <Image
              src={normalizeImageSource(product.images[0])}
              loader={imageKitLoader}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-center text-[9px] uppercase tracking-wide text-neutral-400">
              No image
            </div>
          )}
          <div>
            <p className="font-medium text-neutral-900">{product.name}</p>
            <p className="mt-1 text-sm text-neutral-500">
              {formatPrice(product, currency)}
            </p>
          </div>
        </div>

        {state?.success ? (
          <div className="mt-6 rounded-xl bg-neutral-50 p-5">
            <p role="status" className="text-sm leading-6 text-neutral-800">
              {state.success}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
            >
              Done
            </button>
          </div>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
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
            {state?.error ? (
              <p role="alert" className="text-sm leading-6 text-red-600">
                {state.error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Sending enquiry…" : "Send enquiry"}
            </button>
          </form>
        )}
      </section>
    </div>,
    document.body,
  );
}
