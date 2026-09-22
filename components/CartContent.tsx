"use client";

import Image from "next/image";
import Link from "next/link";
import { CartItemControls } from "@/components/CartItemControls";
import { useStore } from "@/components/StoreProvider";
import { WishlistButton } from "@/components/WishlistButton";
import type { CartView } from "@/lib/cart-view";

function formatDisplayAmount(amount: number, currency: "INR" | "USD") {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CartContent({ view }: { view: CartView }) {
  const { currency } = useStore();

  if (view.items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-6 px-4 py-32 text-center sm:px-6">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          Your Cart
        </p>
        <h1 className="font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          Your cart is empty
        </h1>
        <p className="max-w-md text-sm leading-6 text-neutral-500">
          Beautiful things take a little longer. Browse the collection and find
          the piece that was made for you.
        </p>
        <Link
          href="/products"
          className="rounded-full bg-gold px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const amountForCurrency = (item: CartView["items"][number]) =>
    currency === "INR" ? item.priceInr ?? item.price * 83 : item.priceUsd ?? item.price;
  const total = view.items.reduce(
    (sum, item) => sum + amountForCurrency(item) * item.quantity,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-10 sm:px-6">
      <div className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          Your Cart
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          {view.itemQuantity === 1
            ? "One piece, waiting for you"
            : `${view.itemQuantity} pieces, waiting for you`}
        </h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <section>
          <ul className="divide-y divide-neutral-200/80 border-y border-neutral-200/80">
            {view.items.map((item) => {
              const productHref = item.slug ? `/products/${item.slug}` : null;
              const itemAmount = amountForCurrency(item);

              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center"
                >
                  {productHref ? (
                    <Link
                      href={productHref}
                      className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>
                  ) : (
                    <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100" />
                  )}

                  <div className="flex-1">
                    {productHref ? (
                      <Link
                        href={productHref}
                        className="font-display text-lg leading-snug text-neutral-900 transition-colors hover:text-gold-link"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <p className="font-display text-lg leading-snug text-neutral-900">
                        {item.name}
                      </p>
                    )}
                    {item.attributes ? (
                      <p className="mt-1 text-xs leading-5 text-neutral-500">
                        {item.attributes.metal_color} {item.attributes.metal_type} ·{" "}
                        {item.attributes.metal_weight_gms} g
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatDisplayAmount(itemAmount, currency)} each
                    </p>
                    {item.slug ? (
                      <WishlistButton
                        slug={item.slug}
                        className="mt-3 h-8 w-8 shadow-none"
                      />
                    ) : null}
                  </div>

                  <CartItemControls
                    itemId={item.id}
                    name={item.name}
                    quantity={item.quantity}
                    lineTotal={formatDisplayAmount(
                      itemAmount * item.quantity,
                      currency,
                    )}
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="h-fit rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900">
            Order Summary
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-neutral-500">Subtotal</dt>
              <dd className="font-medium text-neutral-900">
                {formatDisplayAmount(total, currency)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-neutral-500">Shipping &amp; insurance</dt>
              <dd className="font-medium text-neutral-900">Complimentary</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-neutral-500">Taxes</dt>
              <dd className="font-medium text-neutral-900">
                Calculated at checkout
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-neutral-200/80 pt-4">
            <p className="font-display text-lg text-neutral-900">Total</p>
            <p className="font-display text-2xl text-neutral-900">
              {formatDisplayAmount(total, currency)}
            </p>
          </div>
          <button
            type="button"
            className="mt-6 w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
          >
            Proceed to Checkout
          </button>
          <p className="mt-4 text-center text-xs leading-5 text-neutral-500">
            Prices shown in {currency === "INR" ? "₹ (INR)" : "$ (USD)"}. Each
            piece is made to order in the Aurja atelier.
          </p>
          <Link
            href="/products"
            className="mt-4 block text-center text-xs font-medium tracking-wide text-gold-link underline underline-offset-4 hover:text-gold"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
