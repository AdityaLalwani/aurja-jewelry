"use client";

import { useActionState } from "react";
import {
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "@/lib/cart-actions";

/**
 * Client island for one cart row's mutations — the qty stepper and the Remove
 * control. Both post hidden fields; which cart the actions touch comes from
 * the signed cart cookie, never from the form data. The island renders the
 * row's quantity controls, its line total, and its remove control, so the
 * surrounding <li> keeps its flex children exactly as before.
 */
export function CartItemControls({
  itemId,
  name,
  quantity,
  lineTotal,
}: {
  itemId: string;
  name: string;
  quantity: number;
  lineTotal: string;
}) {
  const [qtyState, setQuantity, qtyPending] = useActionState(
    updateCartItemQuantityAction,
    undefined,
  );
  const [removeState, removeItem, removePending] = useActionState(
    removeCartItemAction,
    undefined,
  );

  return (
    <>
      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
        <div className="flex items-center rounded-full border border-neutral-300">
          {/* Minus at the minimum clamps server-side to a no-op; Remove is the
              separate affordance for dropping the line. */}
          <form action={setQuantity}>
            <input type="hidden" name="itemId" value={itemId} />
            <input type="hidden" name="quantity" value={quantity - 1} />
            <button
              type="submit"
              disabled={qtyPending}
              aria-label={`Decrease quantity of ${name}`}
              className="px-3.5 py-1.5 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
            >
              −
            </button>
          </form>
          <span className="min-w-8 text-center text-sm font-medium text-neutral-900">
            {quantity}
          </span>
          <form action={setQuantity}>
            <input type="hidden" name="itemId" value={itemId} />
            <input type="hidden" name="quantity" value={quantity + 1} />
            <button
              type="submit"
              disabled={qtyPending}
              aria-label={`Increase quantity of ${name}`}
              className="px-3.5 py-1.5 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
            >
              +
            </button>
          </form>
        </div>
        <p className="text-lg font-medium tracking-wide text-neutral-900">
          {lineTotal}
        </p>
      </div>

      <form action={removeItem} className="self-start sm:self-center">
        <input type="hidden" name="itemId" value={itemId} />
        <button
          type="submit"
          disabled={removePending}
          aria-label={`Remove ${name} from cart`}
          className="text-xs font-medium tracking-wide text-neutral-400 underline underline-offset-4 transition-colors hover:text-neutral-900"
        >
          Remove
        </button>
      </form>

      {qtyState?.error || removeState?.error ? (
        <p role="alert" className="text-sm text-red-600">
          {qtyState?.error ?? removeState?.error}
        </p>
      ) : null}
    </>
  );
}
