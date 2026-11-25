import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/app/components/homepage/SiteFooter";

export const metadata: Metadata = {
  title: "Visit Our Surat Jewellery Atelier",
  description:
    "Visit AURJA at Surat Diamond Bourse for private jewellery viewings, bespoke design consultations and personal guidance.",
  alternates: { canonical: "/visit-us" },
};

export default function VisitUsPage() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "JewelryStore"],
    name: "AURJA",
    url: `${site.url}/visit-us`,
    telephone: `+${site.contact.whatsapp}`,
    email: site.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Surat Diamond Bourse",
      addressLocality: "Surat",
      addressRegion: "Gujarat",
      addressCountry: "IN",
    },
  };

  return (
    <>
      <JsonLd data={localBusinessSchema} />
      <main className="mx-auto max-w-5xl flex-1 px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-amber-700">Visit Us</p>
        <h1 className="mt-5 font-display text-4xl text-stone-900 sm:text-6xl">
          Experience AURJA in Surat
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-stone-600">
          Discover our diamond and gold jewellery in person at the Surat Diamond Bourse.
          Private viewings and custom-design consultations are available by appointment.
        </p>
        <div className="mt-10 grid gap-6 rounded-3xl border border-stone-200 bg-white p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <h2 className="font-display text-2xl text-stone-900">Atelier</h2>
            <address className="mt-3 not-italic text-sm leading-7 text-stone-600">
              Surat Diamond Bourse (SDB)<br />
              Surat, Gujarat, India
            </address>
            <p className="mt-4 text-sm text-stone-600">By appointment</p>
          </div>
          <div>
            <h2 className="font-display text-2xl text-stone-900">Contact</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm text-stone-700">
              <a className="hover:text-amber-800" href={`tel:+${site.contact.whatsapp}`}>{site.contact.phoneDisplay}</a>
              <a className="hover:text-amber-800" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
              <a className="hover:text-amber-800" href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
            </div>
            <Link
              href={site.contact.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-full bg-stone-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-amber-50"
            >
              Get directions
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
