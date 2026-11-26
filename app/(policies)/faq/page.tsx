import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { InfoPage } from "../InfoPage";
import { frequentlyAskedQuestions } from "../content";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Jewellery and Trade FAQs | AURJA" },
  description:
    "Answers for jewellery customers and trade buyers about AURJA's products, manufacturing, MOQ, materials, exports and custom work.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
      { "@type": "ListItem", position: 2, name: "FAQs", item: `${site.url}/faq` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <div className="mx-auto w-full max-w-7xl px-5 pt-6 sm:px-8">
        <nav aria-label="Breadcrumb" className="text-xs text-stone-500">
          <Link href="/" className="hover:text-amber-800">Home</Link>
          <span aria-hidden="true" className="mx-2">/</span>
          <span aria-current="page">FAQs</span>
        </nav>
      </div>
      <InfoPage document={frequentlyAskedQuestions} />
      <section className="mx-auto w-full max-w-4xl border-t border-stone-200 px-5 py-10 sm:px-8">
        <h2 className="font-display text-2xl font-medium text-stone-900">
          Have a trade requirement?
        </h2>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          Explore manufacturing services or share your specifications for a
          quotation.
        </p>
        <div className="mt-5 flex flex-wrap gap-5 text-sm">
          <Link href="/wholesale" className="text-amber-900 underline underline-offset-4">
            Wholesale for jewellers
          </Link>
          <Link href="/request-quote" className="text-amber-900 underline underline-offset-4">
            Request a quote
          </Link>
          <a
            href={`https://wa.me/${site.contact.whatsapp}`}
            className="text-amber-900 underline underline-offset-4"
          >
            WhatsApp AURJA
          </a>
        </div>
      </section>
    </>
  );
}
