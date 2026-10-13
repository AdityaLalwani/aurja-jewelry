"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const galleryImages = images.slice(0, 6);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isExpanded]);

  if (galleryImages.length === 0) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden bg-[#efefeb]">
        <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-neutral-400">
          Image coming soon
        </div>
      </div>
    );
  }

  const featureImage = galleryImages[activeIndex] ?? galleryImages[0];

  return (
    <>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {galleryImages.slice(0, 2).map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setIsExpanded(true);
              }}
              className={`relative aspect-[5/6] overflow-hidden bg-[#efefeb] ${
                index === 0 ? "col-span-1" : "col-span-1"
              }`}
              aria-label={`Open image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${name} — view ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 26vw, 50vw"
                className="object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
            </button>
          ))}
        </div>

        {galleryImages.length > 2 && (
          <div className="grid grid-cols-4 gap-3">
            {galleryImages.slice(2).map((image, index) => {
              const actualIndex = index + 2;
              return (
                <button
                  key={`${image}-${actualIndex}`}
                  type="button"
                  onClick={() => {
                    setActiveIndex(actualIndex);
                    setIsExpanded(true);
                  }}
                  className="relative aspect-square overflow-hidden bg-[#efefeb]"
                  aria-label={`Open image ${actualIndex + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${name} — view ${actualIndex + 1}`}
                    fill
                    sizes="(min-width: 1024px) 12vw, 25vw"
                    className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isExpanded && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-label="Close expanded view"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-2xl leading-none text-neutral-700 shadow-sm"
            >
              ×
            </button>

            <div className="relative aspect-[4/5] w-full bg-[#f7f3ee]">
              <Image
                src={featureImage}
                alt={`${name} — expanded view`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <div className="grid grid-cols-5 gap-2 border-t border-neutral-200 bg-white p-3">
              {galleryImages.map((image, index) => (
                <button
                  key={`preview-${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative aspect-square overflow-hidden border ${
                    index === activeIndex
                      ? "border-neutral-900"
                      : "border-neutral-200"
                  }`}
                  aria-label={`Preview image ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt={`${name} — thumbnail ${index + 1}`}
                    fill
                    sizes="10vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
