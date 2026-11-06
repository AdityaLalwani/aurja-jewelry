import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { BEST_SELLER_SKUS, site } from "@/lib/site";
import { StoreProvider } from "@/components/StoreProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { CartSnapshot } from "./CartSnapshot";
import { Suspense } from "react";
import {
  getJewelryProductsBySkus,
  getStoreCategories,
  type StoreCategory,
} from "@/lib/swell";
import { headers } from "next/headers";
import { CookiePreferences } from "@/components/CookiePreferences";
import { getSessionAccountId } from "@/lib/session";
import { LoginPrompt } from "@/components/LoginPrompt";

async function getNavigationCategories(): Promise<StoreCategory[]> {
  const categories = await getStoreCategories();
  if (categories.length > 0) return categories;

  return [
    { id: "rings", name: "Rings", slug: "rings", parentId: null },
    { id: "earrings", name: "Earrings", slug: "earrings", parentId: null },
    { id: "pendants", name: "Pendants", slug: "pendants", parentId: null },
    { id: "bracelets", name: "Bracelets", slug: "bracelets", parentId: null },
    { id: "necklaces", name: "Necklaces", slug: "necklaces", parentId: null },
    { id: "men", name: "Men", slug: "men", parentId: null },
  ];
}

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
});

const cinzel = localFont({
  src: "../public/fonts/cinzel-latin-variable.woff2",
  variable: "--font-cinzel",
  weight: "400 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: `${site.name} — ${site.tagline}. Crafted jewelry, made to be treasured.`,
  applicationName: site.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: "Fine jewelry designed for meaningful rituals, milestones, and everyday stories.",
    siteName: site.name,
    url: site.url,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/intro.webp",
        width: 1200,
        height: 800,
        alt: `${site.name} fine jewelry`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: "Fine jewelry designed for meaningful rituals, milestones, and everyday stories.",
    images: ["/intro.webp"],
  },
  other: {
    "theme-color": "#f6f4f0",
  },
};

export default async function RootLayout({
  children,
  modal,
}: LayoutProps<"/">) {
  const [categories, bestSellerProducts, requestHeaders, accountId] =
    await Promise.all([
      getNavigationCategories(),
      getJewelryProductsBySkus(BEST_SELLER_SKUS),
      headers(),
      getSessionAccountId(),
    ]);
  const country =
    requestHeaders.get("x-vercel-ip-country") ??
    requestHeaders.get("cf-ipcountry") ??
    requestHeaders.get("cloudfront-viewer-country");
  const initialCurrency = country?.toUpperCase() === "IN" ? "INR" : "USD";

  return (
    <html
      lang="en"
      translate="no"
      className={`${playfair.variable} ${jost.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider
          initialCurrency={initialCurrency}
          detectCurrencyFromBrowser={!country}
        >
          <SiteHeader
            categories={categories}
            bestSellers={bestSellerProducts.map(({ product }) => product)}
            isAuthenticated={accountId !== null}
          />
          <LoginPrompt isAuthenticated={accountId !== null} />
          <Suspense fallback={null}>
            <CartSnapshot />
          </Suspense>
          {modal}
          {children}
          <CookiePreferences />
        </StoreProvider>
      </body>
    </html>
  );
}
