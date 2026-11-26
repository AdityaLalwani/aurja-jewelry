import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { Hero } from "./components/homepage/Hero";
import { CategoryGrid } from "./components/homepage/CategoryGrid";
import { ValuesSection } from "./components/homepage/ValuesSection";
import { ShopTheLook } from "./components/homepage/ShopTheLook";
import { SectionHeading } from "./components/homepage/SectionHeading";
import { InstagramSection } from "./components/homepage/InstagramSection";
import { TradeServicesSection } from "./components/homepage/TradeServicesSection";
import { TradeProcessSection } from "./components/homepage/TradeProcessSection";
import { VisitTeaser } from "./components/homepage/VisitTeaser";
import { SiteFooter } from "./components/homepage/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { getIsIndiaStorefront } from "@/lib/storefront-region";

export const metadata: Metadata = {
  title: {
    absolute:
      "AURJA | Diamond Jewellery Manufacturer & Wholesale Supplier in Surat, India",
  },
  description:
    "AURJA is a diamond jewellery manufacturer and wholesale supplier in Surat, India, offering private label and OEM manufacturing for jewellers and brands.",
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

export default async function HomePage() {
  const isIndiaStorefront = await getIsIndiaStorefront();
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
        <Hero isIndiaStorefront={isIndiaStorefront} />
        {isIndiaStorefront ? <CategoryGrid /> : <TradeServicesSection />}
        <ValuesSection />
        <section className="border-y border-stone-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-18 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-700">
                For jewellers and brands
              </p>
              <h2 className="mt-3 font-display text-3xl font-medium text-stone-900 sm:text-4xl">
                A flexible private-label and OEM jewellery partner
              </h2>
              <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base">
                Based in Surat, AURJA works with trade buyers on natural and
                lab-grown diamond jewellery. There is no fixed minimum order
                quantity; order size, samples and timelines are agreed for each
                requirement.
              </p>
            </div>
            <Link
              href="/wholesale"
              className="inline-flex h-12 items-center justify-center rounded-full bg-stone-900 px-7 text-xs font-medium uppercase tracking-[0.18em] text-amber-50 transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
            >
              Explore trade services
            </Link>
          </div>
        </section>
        {isIndiaStorefront ? (
          <Suspense fallback={<ShopTheLookFallback />}>
            <ShopTheLook />
          </Suspense>
        ) : null}
        {isIndiaStorefront ? <InstagramSection /> : <TradeProcessSection />}
        <VisitTeaser />
      </main>
      <SiteFooter />
    </>
  );
}
