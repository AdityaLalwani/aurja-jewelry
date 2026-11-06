"use client";

import { useStore, type Currency } from "@/components/StoreProvider";

export function CurrencySelector() {
  const { currency, setCurrency } = useStore();

  return (
    <div
      aria-label="Currency"
      className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white p-1"
      role="group"
    >
      {(["INR", "USD"] as Currency[]).map((code) => (
        <button
          key={code}
          type="button"
          aria-pressed={currency === code}
          onClick={() => setCurrency(code)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors sm:px-4 ${
            currency === code
              ? "bg-gold text-white"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          {code} {code === "INR" ? "(₹)" : "($)"}
        </button>
      ))}
    </div>
  );
}
