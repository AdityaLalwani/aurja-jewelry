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
      } else if (event.key === "ArrowLeft") {
        setActiveIndex((index) => Math.max(0, index - 1));
      } else if (event.key === "ArrowRight") {
        setActiveIndex((index) => Math.min(galleryImages.length - 1, index + 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [galleryImages.length, isExpanded]);

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
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${name} image gallery`}
            className="relative flex h-[min(90dvh,900px)] max-h-[calc(100dvh-2rem)] w-full max-w-5xl items-stretch"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              aria-label="Close expanded view"
              className="absolute right-0 top-0 z-10 flex h-12 w-12 items-center justify-center bg-white/90 text-2xl leading-none text-neutral-700 shadow-sm transition-colors hover:bg-white"
            >
              ×
            </button>

            <div className="flex w-16 shrink-0 flex-col items-center gap-2 overflow-y-auto py-2">
              {galleryImages.map((image, index) => (
                <button
                  key={`preview-${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative aspect-[4/5] w-12 shrink-0 overflow-hidden border-2 bg-white ${
                    index === activeIndex
                      ? "border-white"
                      : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`Preview image ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="relative min-h-0 min-w-0 flex-1">
              <Image
                src={featureImage}
                alt={`${name} — expanded view`}
                fill
                sizes="(min-width: 1024px) 80vw, 75vw"
                className="object-contain"
              />

              <button
                type="button"
                onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                disabled={activeIndex === 0}
                aria-label="Previous image"
                className="absolute left-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/90 text-2xl leading-none text-neutral-600 shadow-sm transition-colors hover:bg-white disabled:cursor-default disabled:text-neutral-300"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((index) =>
                    Math.min(galleryImages.length - 1, index + 1),
                  )
                }
                disabled={activeIndex === galleryImages.length - 1}
                aria-label="Next image"
                className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-white/90 text-2xl leading-none text-neutral-600 shadow-sm transition-colors hover:bg-white disabled:cursor-default disabled:text-neutral-300"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
