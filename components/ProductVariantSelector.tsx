"use client";

import { useMemo, useState } from "react";
import { ProductActions } from "@/components/ProductActions";
import { formatPrice, useStore } from "@/components/StoreProvider";
import {
  getDefaultVariantSelections,
  getSelectedVariantPrice,
  isNaturalGemstoneSelection,
  type JewelryProduct,
} from "@/lib/swell";

export function ProductVariantSelector({
  product,
}: {
  product: JewelryProduct;
}) {
  const { currency } = useStore();
  const defaultSelections = useMemo(
    () => getDefaultVariantSelections(product.variant_options ?? []),
    [product.variant_options],
  );
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    defaultSelections,
  );

  const isNaturalGemstone = useMemo(
    () => isNaturalGemstoneSelection(product.variant_options ?? [], selectedValues),
    [product.variant_options, selectedValues],
  );

  const variantPriceUsd = useMemo(() => {
    if (isNaturalGemstone) {
      return 0;
    }

    const selectedTotal = getSelectedVariantPrice(
      product.variant_options ?? [],
      selectedValues,
    );
    return selectedTotal > 0 ? selectedTotal : product.attributes.price_usd;
  }, [isNaturalGemstone, product.attributes.price_usd, product.variant_options, selectedValues]);

  const displayProduct = useMemo(
    () => ({
      ...product,
      price_inr: Math.round(variantPriceUsd * 83),
      attributes: {
        ...product.attributes,
        price_usd: variantPriceUsd,
      },
    }),
    [product, variantPriceUsd],
  );

  function selectOption(optionName: string, valueName: string) {
    setSelectedValues((current) => ({
      ...current,
      [optionName]: valueName,
    }));
  }

  return (
    <>
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">
          {product.attributes.metal_type === "Gold" ? "18K Gold" : product.attributes.metal_type}
        </p>
        <h1 className="mt-3 font-display text-4xl uppercase leading-[1.05] tracking-[0.04em] text-neutral-900 sm:text-[2.8rem]">
          {product.name}
        </h1>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-[2.75rem] leading-none tracking-[-0.04em] text-neutral-900">
            {isNaturalGemstone ? "Price on request" : formatPrice(displayProduct, currency)}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            {isNaturalGemstone ? "Custom quote required for this selection." : "Inclusive of all taxes*"}
          </p>
        </div>
      </div>

      {product.variant_options && product.variant_options.length > 0 ? (
        <div className="space-y-5">
          {product.variant_options.map((option) => {
            const optionName = option.name ?? "Option";
            return (
              <div key={optionName} className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-600">
                    {optionName}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {option.values
                    .filter((value) => value.active !== false)
                    .map((value) => {
                      const valueName = value.name ?? "Value";
                      const isSelected = selectedValues[optionName] === valueName;
                      return (
                        <button
                          key={`${optionName}-${valueName}`}
                          type="button"
                          onClick={() => selectOption(optionName, valueName)}
                          className={[
                            "rounded-full border px-3 py-2 text-sm transition-colors",
                            isSelected
                              ? "border-neutral-900 bg-neutral-900 text-white"
                              : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 hover:text-neutral-900",
                          ].join(" ")}
                        >
                          <span>{valueName}</span>
                          {value.price && value.price > 0 ? (
                            <span className="ml-2 text-xs opacity-80">
                              {currency === "INR"
                                ? `₹${new Intl.NumberFormat("en-IN").format(Math.round(value.price * 83))}`
                                : `$${new Intl.NumberFormat("en-US").format(value.price)}`}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <ProductActions
        product={product}
        variantPrice={variantPriceUsd}
        showPriceOnRequest={isNaturalGemstone}
        selectedOptions={selectedValues}
      />
    </>
  );
}
