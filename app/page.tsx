import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { Hero } from "./components/homepage/Hero";
import { CategoryGrid } from "./components/homepage/CategoryGrid";
import { ValuesSection } from "./components/homepage/ValuesSection";
import { ShopTheLook } from "./components/homepage/ShopTheLook";
import { SectionHeading } from "./components/homepage/SectionHeading";
import { InstagramSection } from "./components/homepage/InstagramSection";
import { VisitTeaser } from "./components/homepage/VisitTeaser";
import { SiteFooter } from "./components/homepage/SiteFooter";

export const metadata: Metadata = {
  description: `${site.name} — ${site.tagline}. Discover fine jewelry thoughtfully crafted in Surat, India.`,
};

function ShopTheLookFallback() {
  return (
    <section
      aria-label="Shop by Look"
      className="bg-chandan py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Curated for you"
          title="Shop by Look"
          description="Explore the pieces in each look and find the details that make it yours."
        />
      </div>
      <div className="mt-8 sm:mt-10">
        <div
          aria-hidden="true"
          className="h-[min(41vw,730px)] min-h-[440px] w-full animate-pulse bg-stone-200/50 max-md:h-[560px] max-sm:h-[480px]"
        />
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <main className="home-page">
        <Hero />
        <CategoryGrid />
        <ValuesSection />
        <Suspense fallback={<ShopTheLookFallback />}>
          <ShopTheLook />
        </Suspense>
        <InstagramSection />
        <VisitTeaser />
      </main>
      <SiteFooter />
    </>
  );
}
