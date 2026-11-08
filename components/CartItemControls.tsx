"use client";

import { useStore } from "@/components/StoreProvider";

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
  const { updateLocalCartItem, removeLocalCartItem } = useStore();

  return (
    <>
      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
        <div className="flex items-center rounded-full border border-neutral-300">
          <button
            type="button"
            onClick={() => updateLocalCartItem(itemId, quantity - 1)}
            aria-label={`Decrease quantity of ${name}`}
            className="px-3.5 py-1.5 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            −
          </button>
          <span className="min-w-8 text-center text-sm font-medium text-neutral-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => updateLocalCartItem(itemId, quantity + 1)}
            aria-label={`Increase quantity of ${name}`}
            className="px-3.5 py-1.5 text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            +
          </button>
        </div>
        <p className="text-lg font-medium tracking-wide text-neutral-900">
          {lineTotal}
        </p>
      </div>

      <button
        type="button"
        onClick={() => removeLocalCartItem(itemId)}
        aria-label={`Remove ${name} from cart`}
        className="self-start text-xs font-medium tracking-wide text-neutral-400 underline underline-offset-4 transition-colors hover:text-neutral-900 sm:self-center"
      >
        Remove
      </button>
    </>
  );
}
