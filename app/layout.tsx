import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/site";
import { StoreProvider } from "@/components/StoreProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { CartSnapshot } from "./CartSnapshot";
import { Suspense } from "react";
import { getStoreCategories, type StoreCategory } from "@/lib/swell";
import { headers } from "next/headers";
import { CookiePreferences } from "@/components/CookiePreferences";

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
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s`,
  },
  description: `${site.name} — ${site.tagline}. Crafted jewellery, made to be treasured.`,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [categories, requestHeaders] = await Promise.all([
    getNavigationCategories(),
    headers(),
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
          <SiteHeader categories={categories} />
          <Suspense fallback={null}>
            <CartSnapshot />
          </Suspense>
          {children}
          <CookiePreferences />
        </StoreProvider>
      </body>
    </html>
  );
}
