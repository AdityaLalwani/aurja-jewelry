import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/app/components/homepage/SiteFooter";
import { site } from "@/lib/site";
import { founderBio } from "@/lib/trade-content";

export const metadata: Metadata = {
  title: { absolute: "Akshat Modi | Founder and Director of AURJA" },
  description:
    "Meet Akshat Modi, Founder and Director of AURJA, a diamond jewellery manufacturer based at Surat Diamond Bourse in India.",
  alternates: { canonical: "/akshat-modi" },
};

export default function AkshatModiPage() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Akshat Modi",
    jobTitle: "Founder and Director",
    worksFor: { "@type": "Organization", name: site.name, url: site.url },
    url: `${site.url}/akshat-modi`,
    sameAs: [`https://instagram.com/${site.instagram}`],
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
      { "@type": "ListItem", position: 2, name: "About AURJA", item: `${site.url}/about` },
      { "@type": "ListItem", position: 3, name: "Akshat Modi", item: `${site.url}/akshat-modi` },
    ],
  };

  return (
    <>
      <JsonLd data={[personSchema, breadcrumbSchema]} />
      <main className="flex-1">
        <header className="border-b border-stone-200 bg-chandan">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
            <nav aria-label="Breadcrumb" className="mb-9 text-xs text-stone-500">
              <Link href="/" className="hover:text-amber-800">Home</Link>
              <span aria-hidden="true" className="mx-2">/</span>
              <Link href="/about" className="hover:text-amber-800">About AURJA</Link>
              <span aria-hidden="true" className="mx-2">/</span>
              <span aria-current="page">Akshat Modi</span>
            </nav>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-800">
              Founder and Director
            </p>
            <h1 className="mt-4 font-display text-4xl font-medium text-stone-900 sm:text-6xl">
              Akshat Modi
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-stone-600">
              {founderBio}
            </p>
          </div>
        </header>
        <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="font-display text-2xl font-medium text-stone-900">
            Connect with AURJA
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone-600">
            Surat Diamond Bourse, Surat, Gujarat, India
          </p>
          <div className="mt-6 flex flex-wrap gap-5 text-sm">
            <a href={`https://wa.me/${site.contact.whatsapp}`} className="text-amber-900 underline underline-offset-4">
              WhatsApp
            </a>
            <a href={`mailto:${site.contact.email}`} className="text-amber-900 underline underline-offset-4">
              Email
            </a>
            <a href={`https://instagram.com/${site.instagram}`} className="text-amber-900 underline underline-offset-4">
              Instagram
            </a>
            <Link href="/request-quote" className="text-amber-900 underline underline-offset-4">
              Request a trade quote
            </Link>
            <a href={site.contact.mapsUrl} className="text-amber-900 underline underline-offset-4">
              Surat Diamond Bourse location
            </a>
          </div>
          <Link href="/about" className="mt-8 inline-block text-sm text-amber-900 underline underline-offset-4">
            About AURJA
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
