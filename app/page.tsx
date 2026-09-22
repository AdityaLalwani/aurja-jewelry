import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Hero } from "./components/homepage/Hero";
import { CategoryGrid } from "./components/homepage/CategoryGrid";
import { EditorialBlock } from "./components/homepage/EditorialBlock";
import { ValuesSection } from "./components/homepage/ValuesSection";
import { LaunchSection } from "./components/homepage/LaunchSection";
import { InstagramSection } from "./components/homepage/InstagramSection";
import { VisitTeaser } from "./components/homepage/VisitTeaser";
import { SiteFooter } from "./components/homepage/SiteFooter";

export const metadata: Metadata = {
  description: `${site.name} — ${site.tagline}. Certified gold and diamonds, Crafted in small batches at our Surat Diamond Bourse atelier. Our first collection is in the making — launching soon.`,
};

export default function HomePage() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <CategoryGrid />
        <EditorialBlock />
        <ValuesSection />
        <LaunchSection />
        <InstagramSection />
        <VisitTeaser />
      </main>
      <SiteFooter />
    </>
  );
}
