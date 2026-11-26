import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/app/components/homepage/SiteFooter";
import { site } from "@/lib/site";
import { founderBio, gjepcRegistration } from "@/lib/trade-content";

export const metadata: Metadata = {
  title: {
    absolute: "About AURJA | Diamond Jewellery Manufacturer in Surat",
  },
  description:
    "Learn about AURJA, a diamond jewellery manufacturer based at Surat Diamond Bourse, and its founder, trade services and registrations.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
      { "@type": "ListItem", position: 2, name: "About AURJA", item: `${site.url}/about` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <main className="flex-1">
        <header className="border-b border-stone-200 bg-chandan">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
            <nav aria-label="Breadcrumb" className="mb-9 text-xs text-stone-500">
              <Link href="/" className="hover:text-amber-800">Home</Link>
              <span aria-hidden="true" className="mx-2">/</span>
              <span aria-current="page">About AURJA</span>
            </nav>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-800">
              About AURJA
            </p>
            <h1 className="mt-4 font-display text-4xl font-medium text-stone-900 sm:text-6xl">
              A diamond jewellery manufacturer in Surat
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-stone-600">
              {founderBio}
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="font-display text-2xl font-medium text-stone-900 sm:text-3xl">
            Business registrations
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-stone-600 sm:text-base">
            <li>AURJA is a GST-registered and Udyam/MSME-registered business based in Surat, India.</li>
            <li>
              AURJA is registered with GJEPC (Registration No. {gjepcRegistration}).
            </li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-5">
            <Link href="/akshat-modi" className="text-sm text-amber-900 underline underline-offset-4">
              Meet founder Akshat Modi
            </Link>
            <Link href="/wholesale" className="text-sm text-amber-900 underline underline-offset-4">
              B2B services for jewellers and brands
            </Link>
            <Link href="/request-quote" className="text-sm text-amber-900 underline underline-offset-4">
              Request a trade quote
            </Link>
            <a href={`https://wa.me/${site.contact.whatsapp}`} className="text-sm text-amber-900 underline underline-offset-4">
              Contact AURJA on WhatsApp
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
