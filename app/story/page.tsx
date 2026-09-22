import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { profiles, storyPage } from "@/lib/site";
import { ArrowRightIcon } from "../components/icons";
import { ValuesSection } from "../components/homepage/ValuesSection";
import { LaunchSection } from "../components/homepage/LaunchSection";
import { SiteFooter } from "../components/homepage/SiteFooter";

export const metadata: Metadata = {
  title: "Our Story — AURJA",
  description:
    "Why AURJA exists, what we believe, and how every piece will be made — Certified gold and diamonds, small-batch crafted in Surat. First collection launching soon.",
};

const founder = profiles["akshat-modi"];

/**
 * The /story page — a static route, so it wins over the dynamic profile route
 * at app/[slug]/page.tsx (no "story" profile exists). All copy lives in
 * `storyPage` in lib/site.ts; values and launch sections are the shared ones.
 */
export default function StoryPage() {
  return (
    <>
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-stone-200 bg-[#f6f0e8]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_0%,rgba(217,164,65,0.2),transparent_34%),linear-gradient(135deg,#faf7f2,#f1e8dc)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full border border-amber-700/15 motion-safe:animate-halo-pulse [box-shadow:0_0_0_22px_rgba(217,164,65,0.035),0_0_0_44px_rgba(217,164,65,0.025)]"
          />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:grid-cols-[0.28fr_1fr] lg:gap-16">
            <div className="motion-safe:animate-fade-up">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.32em] text-amber-700">
                {storyPage.eyebrow}
              </p>
              <div aria-hidden className="mt-6 hidden h-40 w-px bg-amber-700/35 lg:block" />
            </div>
            <div className="motion-safe:animate-fade-up [animation-delay:160ms]">
              <p className="max-w-xl text-sm uppercase tracking-[0.18em] text-stone-500 sm:text-base">
                The beginning of something considered
              </p>
              <h1 className="mt-5 max-w-5xl font-display text-[2.75rem] font-medium leading-[0.9] tracking-[-0.04em] text-stone-900 sm:text-[4.5rem] lg:text-[6.5rem]">
                {storyPage.title}
              </h1>
              <div aria-hidden className="mt-8 flex w-36 items-center gap-3">
                <span className="h-px flex-1 bg-amber-700/50" />
                <span className="h-1.5 w-1.5 rotate-45 bg-amber-700" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="mb-10 flex items-end justify-between gap-6 sm:mb-14">
            <p className="max-w-sm text-sm leading-relaxed text-stone-500 sm:text-base">
              A quiet beginning, shaped by intention, craft and the belief that
              beauty can be responsible too.
            </p>
            <span className="hidden text-[0.62rem] font-medium uppercase tracking-[0.28em] text-amber-700 sm:block">
              The AURJA perspective
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {storyPage.paragraphs.map((paragraph, index) => (
              <article
                key={index}
                className={`group rounded-[1.5rem] border border-stone-200 bg-white/75 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-amber-300 hover:bg-white hover:shadow-[0_18px_45px_rgba(120,78,24,0.08)] motion-safe:animate-fade-up sm:p-8 ${
                  index === 0 ? "md:col-span-2" : ""
                } ${index === 1 ? "[animation-delay:100ms]" : ""} ${
                  index === 2 ? "[animation-delay:180ms]" : ""
                } ${index === 3 ? "[animation-delay:260ms]" : ""} ${
                  index === 4 ? "[animation-delay:340ms]" : ""
                } ${index === 5 ? "[animation-delay:420ms]" : ""} ${
                  index === 6 ? "[animation-delay:500ms]" : ""
                } ${index === 7 ? "[animation-delay:580ms]" : ""}`}
              >
                <div className="flex items-start justify-between gap-6">
                  <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-amber-700">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </p>
                  <span
                    aria-hidden
                    className="mt-1 h-px w-8 bg-amber-700/40 transition-all duration-500 group-hover:w-14"
                  />
                </div>
                <p
                  className={`mt-10 leading-relaxed text-stone-600 ${
                    index === 0
                      ? "max-w-3xl font-display text-2xl leading-tight text-stone-800 sm:text-3xl"
                      : "text-base sm:text-lg"
                  }`}
                >
                  {paragraph}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* What makes us different — the shared values grid */}
        <ValuesSection />

        <section className="mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
          <div className="mx-auto grid max-w-5xl items-center gap-10 border-y border-stone-200 py-10 motion-safe:animate-fade-up sm:py-14 lg:grid-cols-[0.65fr_1fr] lg:gap-20">
            <div className="text-center lg:text-left">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-700">
                {storyPage.founderHeading}
              </p>
              <div className="relative mx-auto mt-8 h-32 w-32 lg:mx-0">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(217,164,65,0.35),transparent_70%)]"
              />
              {founder.photo ? (
                <Image
                  src={founder.photo}
                  alt={founder.name}
                  width={160}
                  height={160}
                  className="relative h-32 w-32 rounded-full object-cover ring-4 ring-amber-200/20"
                />
              ) : (
                <span className="relative flex h-32 w-32 items-center justify-center rounded-full bg-stone-100 font-display text-3xl text-stone-500 ring-4 ring-amber-200/20">
                  {founder.initials}
                </span>
              )}
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h2 className="font-display text-3xl font-medium text-stone-900 sm:text-4xl">
                {founder.name}
              </h2>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-500">
                {founder.designation}
              </p>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-stone-500 sm:text-base">
                {founder.bio}
              </p>
              <Link
                href={`/${founder.slug}`}
                className="group mt-7 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-amber-700 transition-colors hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
              >
                {storyPage.founderCtaLabel}
                <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* Launch signup — the shared section, anchored at #launch */}
        <LaunchSection />
      </main>
      <SiteFooter />
    </>
  );
}
