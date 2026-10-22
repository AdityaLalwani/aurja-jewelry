"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatPrice, useStore } from "@/components/StoreProvider";
import type { JewelryProduct } from "@/lib/swell";

type ShopTheLookProduct = {
  sku: string;
  product: Pick<JewelryProduct, "name" | "slug" | "price_inr" | "images" | "attributes">;
};

type ShopTheLookScene = {
  background: string;
  products: ShopTheLookProduct[];
};

function PreviousIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-4"
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="size-4"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function MobileProductButton({
  direction,
  sku,
  onClick,
}: {
  direction: "previous" | "next";
  sku: string;
  onClick: () => void;
}) {
  const isPrevious = direction === "previous";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${isPrevious ? "Previous" : "Next"} product, SKU ${sku}`}
      className="hidden size-9 shrink-0 place-items-center rounded-full border border-aurja-gold/35 bg-background text-kajal shadow-sm transition-colors hover:bg-sindoori hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurja-gold max-sm:grid"
    >
      {isPrevious ? <PreviousIcon /> : <NextIcon />}
    </button>
  );
}

export function ShopTheLookCarousel({
  scenes,
}: {
  scenes: ShopTheLookScene[];
}) {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const { currency } = useStore();
  const activeScene = scenes[activeSceneIndex];
  const activeProduct = activeScene.products[activeProductIndex];

  function showPrevious() {
    setActiveSceneIndex((index) => (index - 1 + scenes.length) % scenes.length);
    setActiveProductIndex(0);
  }

  function showNext() {
    setActiveSceneIndex((index) => (index + 1) % scenes.length);
    setActiveProductIndex(0);
  }

  function showPreviousProduct() {
    setActiveProductIndex(
      (index) =>
        (index - 1 + activeScene.products.length) %
        activeScene.products.length,
    );
  }

  function showNextProduct() {
    setActiveProductIndex(
      (index) => (index + 1) % activeScene.products.length,
    );
  }

  return (
    <div className="relative left-1/2 isolate h-[min(41vw,730px)] min-h-[440px] w-screen -translate-x-1/2 overflow-hidden bg-background max-md:h-[560px] max-sm:h-[430px]">
      <div className="absolute inset-x-0 inset-y-0 max-sm:bottom-auto max-sm:h-[270px]">
        <Image
          key={activeScene.background}
          src={activeScene.background}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          aria-hidden
          className="pointer-events-none object-cover object-center max-md:object-[58%_center]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-kajal/10 via-transparent to-kajal/15"
        />

        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-between px-[2.7%]">
        <button
          type="button"
          onClick={showPrevious}
          aria-label="Previous background image"
          className="pointer-events-auto grid size-9 place-items-center rounded-sm border border-aurja-gold/40 bg-chandan/95 text-kajal shadow-sm transition-colors hover:bg-sindoori hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurja-gold"
        >
          <PreviousIcon />
        </button>
        <button
          type="button"
          onClick={showNext}
          aria-label="Next background image"
          className="pointer-events-auto grid size-9 place-items-center rounded-sm border border-aurja-gold/40 bg-chandan/95 text-kajal shadow-sm transition-colors hover:bg-sindoori hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurja-gold"
        >
          <NextIcon />
        </button>
      </div>
      </div>

      <div
        aria-live="polite"
        className="absolute right-[8%] top-[41%] z-10 w-[clamp(190px,12vw,225px)] max-sm:left-1/2 max-sm:right-auto max-sm:top-[280px] max-sm:flex max-sm:w-[min(92vw,360px)] max-sm:-translate-x-1/2 max-sm:items-center max-sm:gap-2"
      >
        <div
          aria-hidden
          className="absolute inset-0 translate-x-2 translate-y-3 rotate-[2deg] bg-chandan/85 shadow-[0_4px_12px_rgba(40,40,38,0.16)] max-sm:hidden"
        />
        <div
          aria-hidden
          className="absolute inset-0 -translate-x-2 translate-y-1 -rotate-[2deg] bg-[#fffdf8]/95 shadow-[0_4px_12px_rgba(40,40,38,0.16)] max-sm:hidden"
        />
        <MobileProductButton
          direction="previous"
          sku={activeScene.products[(activeProductIndex - 1 + activeScene.products.length) % activeScene.products.length].sku}
          onClick={showPreviousProduct}
        />
        <div className="relative min-w-0 flex-1">
          <Link
            key={activeProduct.sku}
            href={`/products/${activeProduct.product.slug}`}
            aria-label={`Shop ${activeProduct.product.name}, SKU ${activeProduct.sku}`}
            className="group relative block border border-aurja-gold/25 bg-[#fffdf8] p-3 text-kajal shadow-[0_5px_18px_rgba(40,40,38,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurja-gold max-sm:p-2"
          >
            <div className="relative aspect-square overflow-hidden bg-[#fffdf8] max-sm:hidden">
              {activeProduct.product.images[0] ? (
                <Image
                  src={activeProduct.product.images[0]}
                  alt={activeProduct.product.name}
                  fill
                  sizes="225px"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-kajal/55">
                  Image unavailable
                </div>
              )}
            </div>
            <div className="px-1 pb-1 pt-2 font-sans text-xs leading-relaxed text-kajal max-sm:py-1">
              <p className="line-clamp-2 font-display text-sm leading-snug text-kajal max-sm:text-center max-sm:text-xs">
                {activeProduct.product.name}
              </p>
              <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sindoori max-sm:text-center max-sm:text-[9px]">
                SKU: {activeProduct.sku}
              </p>
              <p className="mt-1 font-medium text-aurja-gold max-sm:text-center">
                {formatPrice(activeProduct.product, currency)}
              </p>
            </div>
          </Link>
          <div className="pointer-events-none absolute inset-x-1 top-1/2 z-20 flex -translate-y-1/2 justify-between max-sm:hidden">
            <button
              type="button"
              onClick={showPreviousProduct}
              aria-label={`Previous product, SKU ${activeScene.products[(activeProductIndex - 1 + activeScene.products.length) % activeScene.products.length].sku}`}
              className="pointer-events-auto grid size-8 place-items-center rounded-full border border-aurja-gold/40 bg-chandan/95 text-kajal shadow-md transition-colors hover:bg-sindoori hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurja-gold"
            >
              <PreviousIcon />
            </button>
            <button
              type="button"
              onClick={showNextProduct}
              aria-label={`Next product, SKU ${activeScene.products[(activeProductIndex + 1) % activeScene.products.length].sku}`}
              className="pointer-events-auto grid size-8 place-items-center rounded-full border border-aurja-gold/40 bg-chandan/95 text-kajal shadow-md transition-colors hover:bg-sindoori hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurja-gold"
            >
              <NextIcon />
            </button>
          </div>
        </div>
        <MobileProductButton
          direction="next"
          sku={activeScene.products[(activeProductIndex + 1) % activeScene.products.length].sku}
          onClick={showNextProduct}
        />
        <div
          aria-label={`Look ${activeSceneIndex + 1} of ${scenes.length}`}
          className="relative mt-3 flex justify-center gap-2 max-sm:mt-1.5"
        >
          {activeScene.products.map(({ sku }, index) => (
            <button
              key={sku}
              type="button"
              onClick={() => setActiveProductIndex(index)}
              aria-label={`Show product ${index + 1}, SKU ${sku}`}
              aria-current={index === activeProductIndex ? "true" : undefined}
              className={`h-2 rounded-full border border-chandan transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurja-gold focus-visible:ring-offset-2 ${
                index === activeProductIndex
                  ? "w-6 bg-sindoori"
                  : "w-2 bg-chandan/80 hover:bg-aurja-gold"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 max-sm:bottom-3">
        {scenes.map((scene, index) => (
          <button
            key={scene.background}
            type="button"
            onClick={() => {
              setActiveSceneIndex(index);
              setActiveProductIndex(0);
            }}
            aria-label={`Show background image ${index + 1}`}
            aria-current={index === activeSceneIndex ? "true" : undefined}
            className={`h-2 rounded-full border border-chandan transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurja-gold focus-visible:ring-offset-2 ${
              index === activeSceneIndex
                ? "w-7 bg-sindoori"
                : "w-2 bg-chandan/80 hover:bg-aurja-gold"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
