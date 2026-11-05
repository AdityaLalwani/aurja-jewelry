"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export function LoginDialog({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
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
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [router]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-neutral-950/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) router.back();
      }}
    >
      <section className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-cream shadow-2xl">
        <button
          type="button"
          aria-label="Close sign in"
          onClick={() => router.back()}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-cream text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
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
        {children}
      </section>
    </div>
  );
}
