"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export function SearchDialog({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [topOffset, setTopOffset] = useState(0);

  useLayoutEffect(() => {
    const header = document.querySelector("header");
    const updateTopOffset = () => {
      setTopOffset(header?.getBoundingClientRect().bottom ?? 0);
    };

    updateTopOffset();
    window.addEventListener("resize", updateTopOffset);
    window.addEventListener("scroll", updateTopOffset, { passive: true });
    const resizeObserver = header ? new ResizeObserver(updateTopOffset) : null;
    if (header && resizeObserver) resizeObserver.observe(header);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        router.back();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("resize", updateTopOffset);
      window.removeEventListener("scroll", updateTopOffset);
      resizeObserver?.disconnect();
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [router]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-dialog-title"
      style={{ top: topOffset }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) router.back();
      }}
      className="fixed inset-x-0 bottom-0 z-[60] bg-neutral-950/55"
    >
      <section className="h-full overflow-y-auto bg-cream px-4 pb-8 pt-6 sm:px-8 sm:pt-8">
        <div className="mx-auto max-w-5xl">
          <div className="relative text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
              Search
            </p>
            <h1
              id="search-dialog-title"
              className="mt-2 font-display text-2xl leading-tight text-neutral-900 sm:text-3xl"
            >
              Find your piece
            </h1>
            <button
              type="button"
              aria-label="Close search"
              onClick={() => router.back()}
              className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
