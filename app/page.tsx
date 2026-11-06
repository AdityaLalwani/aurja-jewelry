import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Hero } from "./components/homepage/Hero";
import { CategoryGrid } from "./components/homepage/CategoryGrid";
import { ShopTheLook } from "./components/homepage/ShopTheLook";
import { InstagramSection } from "./components/homepage/InstagramSection";
import { ValuesSection } from "./components/homepage/ValuesSection";
import { VisitTeaser } from "./components/homepage/VisitTeaser";
import { SiteFooter } from "./components/homepage/SiteFooter";

export const metadata: Metadata = {
  description: `${site.name} — ${site.tagline}. Discover fine jewelry thoughtfully crafted in Surat, India.`,
};

export default function HomePage() {
  return (
    <>
      <main className="home-page">
        <Hero />
        <CategoryGrid />
        <ValuesSection />
        <ShopTheLook />
        <InstagramSection />
        <VisitTeaser />
      </main>
      <SiteFooter />
    </>
  );
}
