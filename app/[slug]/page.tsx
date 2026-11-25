import type { Metadata } from "next";
import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site, getProfile, allProfileSlugs } from "@/lib/site";
import {
  DownloadIcon,
  GlobeIcon,
  WhatsAppIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
} from "../components/icons";
import { ProductGrid } from "@/components/ProductGrid";
import { getJewelryProductPage, getStoreCategories } from "@/lib/storefront-data";
import { SiteFooter } from "@/app/components/homepage/SiteFooter";

const CATEGORY_SEO: Record<
  string,
  { title: string; description: string; h1: string; intro: string; faqs: Array<{ question: string; answer: string }> }
> = {
  rings: {
    title: "Diamond Rings Online India",
    description: "Shop diamond rings online in India: solitaire rings, gold bands and elegant designs, handcrafted and certified in Surat.",
    h1: "Diamond Rings Online India",
    intro: "Discover AURJA diamond and gold rings handcrafted in Surat for proposals, weddings and everyday milestones. Explore solitaire rings, refined bands and contemporary stackable designs in hallmark-quality gold. Every piece is selected for balance, comfort and lasting beauty, with detailed specifications and secure delivery across India.",
    faqs: [
      { question: "Do AURJA rings come with certification?", answer: "Applicable diamonds and metals are supplied with relevant quality documentation and specifications. Please review the individual product details for exact certification." },
      { question: "Can I find ring sizes in India?", answer: "Available ring sizes vary by design and are shown on each product page. Use our size guide or contact the atelier for help." },
      { question: "Do you offer custom ring designs?", answer: "Yes. AURJA can discuss bespoke diamond and gold ring designs through our custom-design consultation." },
    ],
  },
  earrings: {
    title: "Diamond Earrings Online India",
    description: "Shop diamond earrings online in India, including certified studs, drops and hoops handcrafted in Surat.",
    h1: "Diamond Earrings Online India",
    intro: "Explore diamond and gold earrings designed for effortless everyday wear and memorable occasions. The collection includes diamond studs, graceful drops and modern hoops crafted in Surat. Detailed metal, stone and size information helps you compare each pair, while hallmarking and diamond certification provide added confidence.",
    faqs: [
      { question: "Are the earrings suitable for daily wear?", answer: "Many lightweight designs suit regular wear. Check the specifications and follow the care instructions for the chosen pair." },
      { question: "Do you sell certified diamond studs?", answer: "Applicable diamond earrings include certification details on their product pages." },
      { question: "Can you help choose earrings for a gift?", answer: "Our team can help compare styles, metals and budgets. Contact us by WhatsApp for a personal recommendation." },
    ],
  },
  pendants: {
    title: "Diamond Pendants Online India",
    description: "Discover diamond pendants and gold pendants online in India, thoughtfully handcrafted in Surat.",
    h1: "Diamond Pendants Online India",
    intro: "Find delicate diamond and gold pendants made to bring meaning to everyday jewellery. This collection includes modern charms, solitaire designs and keepsake pendants crafted with attention to proportion and finish. Browse metal purity, stone details and chain compatibility before choosing a piece for yourself or gifting it to someone special.",
    faqs: [
      { question: "Are chains included with pendants?", answer: "Chain inclusion varies by product. The product page specifies whether a chain is included." },
      { question: "Can pendants be customised?", answer: "Selected designs may be adapted through a bespoke consultation with the Surat atelier." },
      { question: "How should I care for a diamond pendant?", answer: "Store it separately, avoid harsh chemicals and clean gently with a soft cloth and mild soap solution." },
    ],
  },
  bracelets: {
    title: "Gold Bracelets Online India",
    description: "Shop gold bracelets online in India, including kadas, diamond bracelets and contemporary chains.",
    h1: "Gold Bracelets Online India",
    intro: "Browse hallmarked gold bracelets and diamond bracelets for refined everyday styling or celebrations. Discover slim chains, elegant kadas and statement cuffs crafted in Surat. Compare weight, metal purity, closure type and size details on each product page to find a comfortable, lasting addition to your jewellery wardrobe.",
    faqs: [
      { question: "How do I choose the right bracelet size?", answer: "Measure around the wrist and allow comfortable movement. Product size details and our size guide provide further guidance." },
      { question: "Do you offer gold kadas?", answer: "Available gold kadas are listed in this category. Sign in or contact the atelier if you need help locating a specific style." },
      { question: "Are gold bracelets hallmarked?", answer: "Applicable pieces use hallmarked gold and product specifications are shown on the individual listing." },
    ],
  },
  necklaces: {
    title: "Diamond Necklaces Online India",
    description: "Shop diamond necklaces online in India, with chokers, gold chains and statement designs.",
    h1: "Diamond Necklaces Online India",
    intro: "Explore diamond and gold necklaces created to elevate weddings, celebrations and everyday wardrobes. From delicate chains and chokers to standout gemstone pieces, each design reflects careful proportion and craftsmanship in Surat. Review length, weight, metal and stone details to choose a necklace that suits your neckline and occasion.",
    faqs: [
      { question: "Can I choose a necklace length?", answer: "Available lengths are listed on each product. If a size is not shown, contact the atelier for made-to-order options." },
      { question: "Do you offer diamond chokers?", answer: "Diamond chokers may be available according to current stock. Use this category to browse the latest collection." },
      { question: "How are necklaces delivered?", answer: "Orders are packed securely and shipped with available delivery and tracking information provided during purchase." },
    ],
  },
  men: {
    title: "Men's Gold Jewellery India",
    description: "Discover men's gold jewellery in India, including kadas, chains and contemporary diamond pieces.",
    h1: "Men's Gold Jewellery India",
    intro: "Discover men's gold jewellery with a confident, understated character. AURJA offers kadas, chains and considered diamond designs created for daily wear and milestone gifting. Each piece is presented with metal, weight and size specifications where available, helping you select jewellery that balances durability, comfort and personal style.",
    faqs: [
      { question: "What men's jewellery is available?", answer: "The collection includes kadas, chains and selected diamond or gemstone pieces. Availability changes with the current range." },
      { question: "Can men's jewellery be customised?", answer: "Custom size, finish and design options may be discussed with the Surat atelier." },
      { question: "Do you ship men's jewellery across India?", answer: "Delivery availability and timelines are confirmed during checkout or enquiry." },
    ],
  },
  silver: {
    title: "Sterling Silver Jewellery India",
    description: "Shop sterling silver jewellery in India, including silver rings and pendants with modern finishes.",
    h1: "Sterling Silver Jewellery India",
    intro: "Shop versatile sterling silver jewellery for considered everyday styling. The AURJA silver collection includes rings, pendants and other modern pieces selected for finish and comfort. Check the product specifications for silver purity, stone details and dimensions, and follow the care guide to preserve shine and prevent tarnish.",
    faqs: [
      { question: "Is the jewellery made from sterling silver?", answer: "Applicable products are identified as sterling silver in their specifications." },
      { question: "How do I prevent silver tarnish?", answer: "Keep silver dry, store it in a soft pouch and avoid perfumes, chlorine and harsh cleaning chemicals." },
      { question: "Can silver jewellery be returned?", answer: "Returns follow the published refund policy and must meet the stated eligibility conditions." },
    ],
  },
};

export async function generateStaticParams() {
  const categories = await getStoreCategories();
  return [
    ...allProfileSlugs().map((slug) => ({ slug })),
    ...categories
      .filter((category) => CATEGORY_SEO[category.slug])
      .map((category) => ({ slug: category.slug })),
  ];
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const profile = getProfile(slug);
  const category = await getStoreCategories().then((items) =>
    items.find((item) => item.slug === slug),
  );
  const seo = CATEGORY_SEO[slug];
  if (!profile && seo) {
    return {
      title: seo.title,
      description: seo.description,
      alternates: { canonical: `/${slug}` },
      openGraph: {
        title: seo.title,
        description: seo.description,
        type: "website",
        url: `/${slug}`,
      },
    };
  }
  if (!profile) return {};

  return {
    title: `${profile.name} — ${profile.designation} | ${site.name}`,
    description: `Connect with ${profile.name}, ${profile.designation} at ${profile.company}. ${profile.bio}`,
  };
}

type Action = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  primary?: boolean;
  internal?: boolean;
  download?: boolean;
};

export default async function BioPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const profile = getProfile(slug);
  const seo = CATEGORY_SEO[slug];

  if (seo) {
    const category = (await getStoreCategories()).find(
      (item) => item.slug === slug,
    );
    const productPage = await getJewelryProductPage(category?.slug ?? slug, 1);
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
        { "@type": "ListItem", position: 2, name: seo.h1, item: `${site.url}/${slug}` },
      ],
    };

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-20 pt-8 sm:px-6 lg:px-10">
          <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-neutral-500">
            <Link href="/" className="transition-colors hover:text-gold-link">Home</Link>
            <span className="text-neutral-300">&gt;</span>
            <span className="text-neutral-700">{seo.h1}</span>
          </nav>
          <header className="mb-7 max-w-3xl">
            <h1 className="font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">{seo.h1}</h1>
            <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">{seo.intro}</p>
          </header>
          <ProductGrid
            key={slug}
            products={productPage.products}
            total={productPage.total}
            initialPage={1}
            hasMore={productPage.hasMore}
            categorySlug={slug}
          />
          <section className="mx-auto mt-16 max-w-3xl border-t border-neutral-200 pt-10">
            <h2 className="font-display text-2xl text-neutral-900">Frequently asked questions</h2>
            <div className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
              {seo.faqs.map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="cursor-pointer list-none font-medium text-neutral-800">
                    {faq.question}
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!profile) notFound();

  const vcardHref = `/api/vcard/${profile.slug}`;

  // Main call-to-action buttons, shown side by side at equal widths.
  const actions: Action[] = [
    {
      label: "Save Contact",
      href: vcardHref,
      icon: DownloadIcon,
      primary: true,
      download: true,
    },
    {
      label: "Visit Site",
      href: "/",
      icon: GlobeIcon,
      internal: true,
    },
  ];

  // Quick contact icons, shown in a single line under the bio.
  const contacts: Action[] = [
    {
      label: "WhatsApp",
      href: `https://wa.me/${profile.whatsapp}`,
      icon: WhatsAppIcon,
    },
    {
      label: "Instagram",
      href: `https://instagram.com/${profile.instagram}`,
      icon: InstagramIcon,
    },
    {
      label: "Email",
      href: `mailto:${profile.email}`,
      icon: MailIcon,
    },
    {
      label: "Location",
      href: profile.mapsUrl,
      icon: MapPinIcon,
    },
  ];

  // Internal links use <Link>; external ones open in a new tab.
  const renderAction = (action: Action, className: string, children: ReactNode) =>
    action.internal ? (
      <Link key={action.label} href={action.href} className={className}>
        {children}
      </Link>
    ) : (
      <a
        key={action.label}
        href={action.href}
        className={className}
        aria-label={action.label}
        target={action.download ? undefined : "_blank"}
        rel="noopener noreferrer"
        download={action.download ? `${profile.slug}.vcf` : undefined}
      >
        {children}
      </a>
    );

  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-chandan px-5 py-12 sm:py-16">
      {/* Ambient background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(180,120,40,0.22),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(120,80,180,0.10),transparent_55%)]"
      />

      <main className="flex w-full max-w-md flex-col items-center">
        {/* Brand link back to the main site */}
        <Link
          href="/"
          className="group mb-10 flex items-center gap-2.5 rounded-full border border-stone-300 bg-white/60 py-1.5 pl-2 pr-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-700 transition-colors hover:border-amber-700/30 hover:text-stone-900"
        >
          <Image
            src={site.logo}
            alt={`${site.name} logo`}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover ring-1 ring-stone-300"
          />
          {site.name}
        </Link>

        {/* Photo with a soft gold halo */}
        <div className="relative mb-7">
          <div
            aria-hidden
            className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(212,175,105,0.35),transparent_70%)] blur-md"
          />
          {profile.photo ? (
            <Image
              src={profile.photo}
              alt={profile.name}
              width={160}
              height={160}
              priority
              className="relative h-32 w-32 rounded-full object-cover ring-4 ring-amber-700/20"
            />
          ) : (
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-stone-800 to-stone-900 font-display text-4xl font-medium text-amber-100/90 ring-4 ring-amber-700/20">
              {profile.initials}
            </div>
          )}
        </div>

        {/* Name & designation */}
        <h1 className="font-display text-3xl font-semibold tracking-wide text-stone-900 sm:text-4xl">
          {profile.name}
        </h1>
        <p className="mt-2.5 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-800">
          {profile.designation} · {profile.company}
        </p>

        {/* Gold ornament divider */}
        <div aria-hidden className="mt-8 flex w-full items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-700/40" />
          <span className="h-1.5 w-1.5 rotate-45 bg-amber-700/60" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-700/40" />
        </div>

        <p className="mt-8 text-center text-sm leading-relaxed text-stone-600">
          {profile.bio}
        </p>

        {/* Contact icons — WhatsApp, Instagram, Email, Location in one line */}
        <div className="mt-9 flex w-full items-center justify-center gap-4">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return renderAction(
              contact,
              "flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-300 bg-white/55 text-amber-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-700/40 hover:bg-white/80 hover:text-amber-900",
              <Icon className="h-5 w-5" />
            );
          })}
        </div>

        {/* Main actions — frosted-glass buttons, equal width side by side */}
        <div className="mt-10 grid w-full grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return renderAction(
              action,
              action.primary
                ? "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-amber-700/30 bg-amber-100/80 text-sm font-semibold tracking-wide text-stone-900 backdrop-blur-xl shadow-sm transition-all duration-200 hover:border-amber-700/50 hover:bg-amber-100"
                : "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white/60 text-sm font-medium tracking-wide text-stone-800 backdrop-blur-xl shadow-sm transition-all duration-200 hover:border-stone-400 hover:bg-white/80",
              <>
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {action.label}
              </>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-14 flex flex-col items-center gap-1 text-center">
          <span className="text-[0.65rem] uppercase tracking-[0.25em] text-stone-600">
            © {new Date().getFullYear()} {site.name} · {site.tagline}
          </span>
        </footer>
      </main>
    </div>
  );
}
