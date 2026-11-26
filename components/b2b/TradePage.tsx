import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { normalizeImageSource } from "@/lib/imagekit";
import { site } from "@/lib/site";
import {
  tradePages,
  type TradePageSlug,
} from "@/lib/trade-content";
import { SiteFooter } from "@/app/components/homepage/SiteFooter";

export function TradePageShell({
  slug,
  children,
}: {
  slug: TradePageSlug;
  children?: ReactNode;
}) {
  const page = tradePages[slug];
  const pageUrl = new URL(`/${slug}`, site.url).toString();
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "For Jewellers",
        item: `${site.url}/wholesale`,
      },
      { "@type": "ListItem", position: 3, name: page.heading, item: pageUrl },
    ],
  };
  const whatsappHref = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(
    "Hello AURJA, I am enquiring about B2B jewellery manufacturing.",
  )}`;

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <main className="flex-1">
        <header className="border-b border-stone-200 bg-chandan">
          <div className="mx-auto max-w-7xl px-5 pb-12 pt-8 sm:px-8 sm:pb-16 sm:pt-10">
            <nav
              aria-label="Breadcrumb"
              className="mb-9 flex flex-wrap items-center gap-2 text-xs text-stone-500"
            >
              <Link href="/" className="hover:text-amber-800">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/wholesale" className="hover:text-amber-800">
                For Jewellers
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-stone-700">
                {page.heading}
              </span>
            </nav>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-800">
              {page.eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-medium leading-tight text-stone-900 sm:text-6xl">
              {page.heading}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
              {page.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/request-quote"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-900 px-6 text-xs font-medium uppercase tracking-[0.16em] text-amber-50 transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
              >
                Request a quote
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-stone-400 px-6 text-xs font-medium uppercase tracking-[0.16em] text-stone-800 transition-colors hover:border-amber-700 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
              >
                WhatsApp AURJA
              </a>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-2xl font-medium text-stone-900 sm:text-3xl">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 text-sm leading-7 text-stone-600 sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-4 space-y-3 pl-5 text-sm leading-7 text-stone-600 marker:text-amber-700 sm:text-base">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="list-disc">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          {children}

          <nav
            aria-label="Related trade pages"
            className="mt-14 border-t border-stone-200 pt-8"
          >
            <h2 className="font-display text-xl font-medium text-stone-900">
              Explore trade services
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
              {page.related.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-amber-900 underline decoration-amber-700/40 underline-offset-4 hover:decoration-amber-800"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export function TradeProductGrid({
  products,
}: {
  products: Array<{
    sku: string;
    name: string;
    slug: string;
    images: string[];
    category: string;
  }>;
}) {
  if (products.length === 0) {
    return (
      <p className="mt-8 rounded-2xl border border-dashed border-stone-300 px-6 py-10 text-center text-sm leading-6 text-stone-600">
        No published designs are currently listed in the trade catalogue. Ask
        AURJA about a specific requirement or request a custom quote.
      </p>
    );
  }

  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li
          key={product.sku}
          className="overflow-hidden rounded-2xl border border-stone-200 bg-white"
        >
          <div className="relative aspect-[4/3] bg-stone-100">
            {product.images[0] ? (
              <Image
                src={normalizeImageSource(product.images[0])}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-stone-500">
                Image unavailable
              </div>
            )}
          </div>
          <div className="p-5">
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-amber-800">
              {product.category} · SKU {product.sku}
            </p>
            <h3 className="mt-2 font-display text-lg text-stone-900">
              {product.name}
            </h3>
            <p className="mt-3 text-xs leading-5 text-stone-500">
              Specifications, options and trade pricing available on request.
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
