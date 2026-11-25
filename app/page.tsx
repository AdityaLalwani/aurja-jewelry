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
import { JsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "AURJA | Diamond & Gold Jewellery in Surat, India",
  description:
    "Shop certified diamond and hallmarked gold jewellery handcrafted in Surat. Rings, earrings, pendants, bracelets and custom designs. Visit our atelier at Surat Diamond Bourse.",
  alternates: {
    canonical: "/",
  },
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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "JewelryStore"],
    "@id": `${site.url}/#organization`,
    name: "AURJA",
    url: site.url,
    logo: `${site.url}${site.logo}`,
    image: `${site.url}/intro.webp`,
    telephone: `+${site.contact.whatsapp}`,
    email: site.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Surat Diamond Bourse",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      description: "Private viewings by appointment",
    },
    sameAs: [`https://instagram.com/${site.instagram}`],
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: "AURJA",
    url: site.url,
  };

  return (
    <>
      <JsonLd data={[organizationSchema, websiteSchema]} />
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
