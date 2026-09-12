import type { Metadata } from "next";
import { blogs } from "@/lib/blogs";
import { SiteHeader } from "../components/homepage/SiteHeader";
import { SiteFooter } from "../components/homepage/SiteFooter";
import { BlogGrid } from "./BlogGrid";

export const metadata: Metadata = {
  title: "Blogs — AURJA",
  description:
    "The Aurja Journal: stories about jewellery, personal style, conscious craft and the details that make every piece meaningful.",
};

export default function BlogsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-stone-200 bg-[#f6f0e8]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_0%,rgba(217,164,65,0.2),transparent_35%),linear-gradient(135deg,#faf7f2,#f1e8dc)]"
          />
          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
            <p className="motion-safe:animate-fade-up text-xs font-medium uppercase tracking-[0.32em] text-amber-700">
              The Aurja Journal
            </p>
            <h1 className="mt-5 max-w-4xl motion-safe:animate-fade-up [animation-delay:120ms] font-display text-5xl font-medium leading-[0.92] tracking-[-0.04em] text-stone-900 sm:text-7xl lg:text-8xl">
              Stories worth wearing.
            </h1>
            <div aria-hidden className="mt-8 flex w-36 items-center gap-3 motion-safe:animate-fade-up [animation-delay:220ms]">
              <span className="h-px flex-1 bg-amber-700/50" />
              <span className="h-1.5 w-1.5 rotate-45 bg-amber-700" />
            </div>
            <p className="mt-8 max-w-xl motion-safe:animate-fade-up [animation-delay:300ms] text-base leading-relaxed text-stone-600 sm:text-lg">
              Reflections on jewellery, expression, care and the small details
              that give a piece its meaning.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="mb-10 flex items-end justify-between gap-6 sm:mb-14">
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
              Read the journal
            </p>
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-amber-700">
              {blogs.length} stories
            </span>
          </div>
          <BlogGrid posts={blogs} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
