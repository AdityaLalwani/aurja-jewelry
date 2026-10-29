"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice, useStore } from "@/components/StoreProvider";
import { addToCartAction } from "@/lib/cart-actions";
import { WishlistButton } from "@/components/WishlistButton";
import type { JewelryProduct } from "@/lib/swell";

type DetailRow = {
  label: string;
  value: string | undefined;
};

function visibleRows(rows: DetailRow[]) {
  return rows.filter(
    (row): row is { label: string; value: string } =>
      Boolean(row.value?.trim()) && row.value?.trim().toLowerCase() !== "n/a",
  );
}

function ProductInformation({
  product,
  onClose,
}: {
  product: JewelryProduct;
  onClose: () => void;
}) {
  const { attributes } = product;
  const generalRows = visibleRows([
    { label: "Design Code", value: attributes.design_code },
    {
      label: "Gross Weight",
      value: attributes.gross_weight_gms
        ? `${attributes.gross_weight_gms}g`
        : undefined,
    },
    { label: "Occasion", value: attributes.occasion },
    { label: "Size", value: attributes.size },
  ]);
  const goldRows = visibleRows([
    { label: "Purity", value: attributes.gold_purity ?? attributes.metal_type },
    {
      label: "Weight",
      value: attributes.gold_weight_gms
        ? `${attributes.gold_weight_gms}g`
        : attributes.metal_weight_gms > 0
          ? `${attributes.metal_weight_gms}g`
          : undefined,
    },
    { label: "Colour", value: attributes.gold_color ?? attributes.metal_color },
  ]);
  const diamondRows = visibleRows([
    { label: "Clarity", value: attributes.diamond_clarity },
    {
      label: "Weight",
      value:
        attributes.diamond_carat > 0
          ? `${attributes.diamond_carat} Ct`
          : undefined,
    },
    { label: "Count", value: attributes.diamond_count },
    {
      label: "Cut",
      value: attributes.diamond_cut ?? attributes.stone_shape,
    },
    { label: "Colour", value: attributes.diamond_color },
  ]);
  const priceBreakupLines = attributes.price_breakup
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-information-title"
        className="max-h-[88dvh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500">
              Product information
            </p>
            <h2
              id="product-information-title"
              className="mt-1 font-display text-lg uppercase tracking-[0.04em] text-neutral-900"
            >
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product information"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-2xl leading-none text-neutral-600 hover:bg-neutral-100"
          >
            ×
          </button>
        </div>

        <div className="space-y-7 px-5 py-6 sm:px-7">
          {priceBreakupLines && priceBreakupLines.length > 0 ? (
            <section>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-900">
                Price Breakup
              </h3>
              <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                {priceBreakupLines.map((line, index) => {
                  const parts = line.match(/^(.+?)\s*:\s*(.+)$/);
                  return parts ? (
                    <div
                      key={`${parts[1]}-${index}`}
                      className="flex justify-between gap-4 py-3 text-sm"
                    >
                      <span className="text-neutral-500">{parts[1]}</span>
                      <span className="text-right text-neutral-900">
                        {parts[2]}
                      </span>
                    </div>
                  ) : (
                    <p
                      key={`${line}-${index}`}
                      className="whitespace-pre-wrap py-3 text-sm text-neutral-700"
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            </section>
          ) : null}

          {[
            { title: "General", rows: generalRows },
            { title: "Gold Details", rows: goldRows },
            { title: "Diamond Details", rows: diamondRows },
          ].map(
            (group) =>
              group.rows.length > 0 && (
                <section key={group.title}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-900">
                    {group.title}
                  </h3>
                  <dl className="divide-y divide-neutral-200 border-y border-neutral-200">
                    {group.rows.map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between gap-4 py-3 text-sm"
                      >
                        <dt className="text-neutral-500">{row.label}</dt>
                        <dd className="text-right text-neutral-900">
                          {row.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ),
          )}

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-900">
              Shipping, Exchanges &amp; Returns
            </h3>
            <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6">
              <div>
                <h4 className="font-medium text-neutral-900">Shipping</h4>
                <p className="mt-1 whitespace-pre-wrap text-neutral-600">
                  {attributes.shipping_text ??
                    attributes.delivery_text ??
                    "Contact us for shipping details."}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900">
                  Exchanges &amp; Returns
                </h4>
                <p className="mt-1 whitespace-pre-wrap text-neutral-600">
                  {[
                    attributes.exchange_policy
                      ? `Exchanges: ${attributes.exchange_policy}`
                      : undefined,
                    attributes.return_policy
                      ? `Returns: ${attributes.return_policy}`
                      : undefined,
                  ]
                    .filter(Boolean)
                    .join("\n") ||
                    "Contact us for exchange and return details."}
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export function ProductActions({
  product,
  variantPrice,
  showPriceOnRequest = false,
  selectedOptions = {},
}: {
  product: JewelryProduct;
  variantPrice?: number;
  showPriceOnRequest?: boolean;
  selectedOptions?: Record<string, string>;
}) {
  const { currency, isInCart, isVariantInCart } = useStore();
  const variantKey = Object.entries(selectedOptions)
    .filter(([, value]) => value && value.trim())
    .map(([name, value]) => `${name.trim()}:${value.trim()}`)
    .sort()
    .join("|") || "default";
  const inCart =
    Object.keys(selectedOptions).length > 0
      ? isVariantInCart(product.slug, variantKey)
      : isVariantInCart(product.slug, "default") || isInCart(product.slug);
  const displayProduct =
    variantPrice === undefined
      ? product
      : {
          ...product,
          price_inr: Math.round(variantPrice * 83),
          attributes: {
            ...product.attributes,
            price_usd: variantPrice,
          },
        };
  const [state, formAction, pending] = useActionState(
    addToCartAction,
    undefined,
  );
  const [informationOpen, setInformationOpen] = useState(false);

  useEffect(() => {
    if (!informationOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setInformationOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [informationOpen]);

  return (
    <>
      <aside
        aria-label={`${product.name} purchase options`}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-300/40 bg-transparent shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm"
      >
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm uppercase tracking-[0.08em] text-neutral-800 sm:text-base">
              {product.name}
            </p>
            <p className="mt-0.5 text-xs text-neutral-500 sm:text-sm">
              M.R.P. {showPriceOnRequest ? "Price on request" : formatPrice(displayProduct, currency)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setInformationOpen(true)}
              aria-label="View product information"
              title="Product information"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 sm:h-12 sm:w-12"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 11v5m0-8h.01"
                />
              </svg>
            </button>

            <WishlistButton
              slug={product.slug}
              className="h-10 w-10 rounded-full border-neutral-300 bg-neutral-100 shadow-none sm:h-12 sm:w-12"
            />

            {inCart ? (
              <Link
                href="/cart"
                className="flex h-11 min-w-32 items-center justify-center rounded-full bg-[#b32b2b] px-5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#8d1d1d] sm:h-14 sm:min-w-52 sm:px-8 sm:text-sm"
              >
                Go to cart
              </Link>
            ) : (
              <form action={formAction} className="min-w-32 sm:min-w-52">
                <input type="hidden" name="slug" value={product.slug} />
                <input type="hidden" name="quantity" value="1" />
                <input type="hidden" name="redirect" value="cart" />
                <input
                  type="hidden"
                  name="selectedOptions"
                  value={JSON.stringify(selectedOptions)}
                />
                <button
                  type="submit"
                  disabled={pending}
                  className="flex h-11 w-full items-center justify-center rounded-full bg-[#b32b2b] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#8d1d1d] disabled:opacity-70 sm:h-14 sm:px-8 sm:text-sm"
                >
                  {pending ? "Adding…" : "Add to bag"}
                </button>
              </form>
            )}
          </div>
        </div>

        {state?.error ? (
          <p
            role="alert"
            className="mx-auto max-w-[1500px] px-4 pb-2 text-right text-sm text-red-600 sm:px-6 lg:px-10"
          >
            {state.error}
          </p>
        ) : null}
      </aside>
      {informationOpen ? (
        <ProductInformation
          product={product}
          onClose={() => setInformationOpen(false)}
        />
      ) : null}
    </>
  );
}
