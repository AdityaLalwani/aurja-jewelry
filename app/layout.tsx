import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/site";
import { StoreProvider } from "@/components/StoreProvider";
import { SiteHeader } from "@/components/SiteHeader";
import type { StoreCategory } from "@/lib/catalog";
import { headers } from "next/headers";
import { CookiePreferences } from "@/components/CookiePreferences";
import { getSessionAccountId } from "@/lib/session";
import { LoginPrompt } from "@/components/LoginPrompt";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { isIndiaStorefront } from "@/lib/storefront-region";

const FALLBACK_NAVIGATION_CATEGORIES: StoreCategory[] = [
  { id: "rings", name: "Rings", slug: "rings", parentId: null },
  { id: "earrings", name: "Earrings", slug: "earrings", parentId: null },
  { id: "pendants", name: "Pendants", slug: "pendants", parentId: null },
  { id: "bracelets", name: "Bracelets", slug: "bracelets", parentId: null },
  { id: "necklaces", name: "Necklaces", slug: "necklaces", parentId: null },
  { id: "men", name: "Men", slug: "men", parentId: null },
];

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
  description:
    "Shop certified diamond and hallmarked gold jewellery handcrafted in Surat. Rings, earrings, pendants, bracelets and custom designs.",
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
  const [requestHeaders, accountId] = await Promise.all([
    headers(),
    getSessionAccountId(),
  ]);
  const country =
    requestHeaders.get("x-vercel-ip-country") ??
    requestHeaders.get("cf-ipcountry") ??
    requestHeaders.get("cloudfront-viewer-country");
  const showRetailStorefront = isIndiaStorefront(requestHeaders);
  const initialCurrency = country?.toUpperCase() === "IN" ? "INR" : "USD";
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

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
          accountId={accountId}
        >
          <SiteHeader
            categories={FALLBACK_NAVIGATION_CATEGORIES}
            isAuthenticated={accountId !== null}
            isIndiaStorefront={showRetailStorefront}
          />
          <LoginPrompt isAuthenticated={accountId !== null} />
          {modal}
          {children}
          <CookiePreferences />
        </StoreProvider>
        <AnalyticsConsent>
          <Analytics />
          <SpeedInsights />
          {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        </AnalyticsConsent>
      </body>
    </html>
  );
}
