"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { home } from "@/lib/site";
import { ChevronDownIcon } from "../icons";

export function Hero() {
  const { hero } = home;
  const [frameIndex, setFrameIndex] = useState(0);
  const phrase = hero.phrases[frameIndex];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFrameIndex((current) => (current + 1) % hero.phrases.length);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [frameIndex, hero.phrases.length]);

  useEffect(() => {
    const section = document.querySelector<HTMLElement>("[data-hero]");
    if (!section || !window.matchMedia("(pointer: fine)").matches) return;

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      section.style.setProperty("--pointer-x", x.toFixed(3));
      section.style.setProperty("--pointer-y", y.toFixed(3));
    };

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  return (
    <section
      data-hero
      className="relative flex min-h-[calc(100dvh-6rem)] items-center justify-center overflow-hidden bg-[#f9f5f0]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(227,194,129,0.28),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(245,232,202,0.7),transparent_40%),linear-gradient(180deg,#faf7f2_0%,#f2ece4_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_center,rgba(98,79,54,0.08)_0,transparent_1.35px)] [background-size:22px_22px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/60 bg-amber-50/30 blur-3xl motion-safe:animate-halo-pulse"
        style={{
          transform:
            "translate(calc(-50% + var(--pointer-x, 0) * 18px), calc(-50% + var(--pointer-y, 0) * 18px))",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-24 pt-16 text-center sm:px-8 sm:py-24">
        <div className="mx-auto flex w-full max-w-fit flex-col items-center justify-center text-center motion-safe:animate-fade-up">
          <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
            <span aria-hidden className="absolute inset-3 rounded-full bg-amber-100/80 blur-lg" />
            <Image
              src="/logo.jpeg"
              alt="AURJA logo"
              width={96}
              height={96}
              priority
              className="relative z-10 h-full w-full rounded-full border border-white/90 bg-[#f8f3ec] object-cover shadow-[0_12px_40px_rgba(120,78,24,0.12)]"
            />
          </div>

          <div className="mt-6 flex w-full flex-col items-center justify-center text-center">
            <h1 className="w-full text-center font-display text-5xl font-medium leading-none tracking-[0.12em] text-stone-900 sm:text-6xl sm:tracking-[0.18em] lg:text-7xl">
              AURJA
            </h1>
            <p className="mt-3 w-full text-center text-[0.58rem] font-medium uppercase tracking-[0.22em] text-amber-700 sm:text-[0.7rem] sm:tracking-[0.34em]">
              {hero.tagline}
            </p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-2xl motion-safe:animate-fade-up [animation-delay:320ms]">
          <p className="sr-only">{hero.srText}</p>
          <p
            aria-hidden
            className="flex flex-col items-center justify-center gap-1 text-center font-display text-3xl font-medium leading-[1.12] text-stone-900 sm:flex-row sm:gap-2 sm:text-5xl lg:text-6xl"
          >
            <span>{hero.constantWord}</span>
            <span
              key={frameIndex}
              className="block whitespace-nowrap px-2 text-2xl italic text-amber-700 motion-safe:animate-flip-in sm:px-0 sm:text-5xl lg:text-6xl"
              style={{
                transformStyle: "preserve-3d",
                WebkitTransformStyle: "preserve-3d",
                perspective: 700,
                WebkitPerspective: 700,
              }}
            >
              {phrase}
            </span>
          </p>
        </div>
        <p className="mt-5 font-display text-lg italic text-amber-700 sm:text-2xl">
          {hero.finale}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 motion-safe:animate-fade-up [animation-delay:600ms] sm:flex-row sm:gap-4">
          <Link
            href={hero.primaryCta.href}
            className="flex h-12 w-full items-center justify-center rounded-full bg-stone-900 px-8 text-sm font-medium tracking-wide text-amber-50 transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 sm:w-auto"
          >
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className="flex h-12 w-full items-center justify-center rounded-full border border-stone-900/20 px-8 text-sm font-medium tracking-wide text-stone-900 transition-colors hover:border-amber-600 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 sm:w-auto"
          >
            {hero.secondaryCta.label}
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <ChevronDownIcon aria-hidden className="absolute bottom-8 left-1/2 h-6 w-6 -translate-x-1/2 text-stone-400 motion-safe:animate-bounce" />
    </section>
  );
}
