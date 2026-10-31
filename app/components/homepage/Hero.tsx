import Link from "next/link";
import { home } from "@/lib/site";
import { ChevronDownIcon } from "../icons";

export function Hero() {
  const { hero } = home;

  return (
    <section
      data-hero
      className="relative flex h-[100svh] min-h-[100svh] items-end overflow-hidden bg-stone-950 text-white"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full object-cover md:block"
      >
        <source src="/desktop.mp4" type="video/mp4" />
      </video>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover md:hidden"
      >
        <source src="/mobile.mp4" type="video/mp4" />
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-24 pt-36 sm:px-10 sm:pb-28 lg:px-12">
        <div className="max-w-2xl motion-safe:animate-fade-up">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-amber-100 sm:text-sm">
            {hero.tagline}
          </p>
          <h1 className="mt-5 font-display text-5xl font-medium leading-[0.98] tracking-[-0.035em] text-white sm:text-7xl lg:text-8xl">
            {hero.constantWord}
            <span className="hero-tagline-rotator mt-2 block font-display text-3xl font-normal italic tracking-normal text-amber-100 sm:text-5xl lg:text-6xl">
              <span aria-hidden="true" className="hero-tagline-rotator__phrase">
                For every moment,
              </span>
              <span
                aria-hidden="true"
                className="hero-tagline-rotator__phrase hero-tagline-rotator__phrase--second"
              >
                For every milestone,
              </span>
              <span
                aria-hidden="true"
                className="hero-tagline-rotator__phrase hero-tagline-rotator__phrase--third"
              >
                For everything in between.
              </span>
              <span className="sr-only">
                For every moment, for every milestone, for everything in between.
              </span>
            </span>
          </h1>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={hero.primaryCta.href}
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-medium tracking-wide text-stone-900 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-stone-900"
            >
              {hero.primaryCta.label}
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/60 px-8 text-sm font-medium tracking-wide text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </div>

      <a
        href="#collection"
        aria-label="Scroll to shop by category"
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <ChevronDownIcon aria-hidden className="h-6 w-6 motion-safe:animate-bounce" />
      </a>
    </section>
  );
}
