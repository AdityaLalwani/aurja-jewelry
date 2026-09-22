import type { Metadata } from "next";
import { Jost, Playfair_Display } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { StoreProvider } from "@/components/StoreProvider";
import { SiteHeader } from "@/components/SiteHeader";
import { getCartIdFromCookie } from "@/lib/cart-session";
import { getSwellCart, getStoreCategories, type StoreCategory } from "@/lib/swell";

async function getCartSnapshot() {
  const cartId = await getCartIdFromCookie();
  if (!cartId) return null;

  try {
    return await getSwellCart(cartId);
  } catch {
    return null;
  }
}

async function getNavigationCategories(): Promise<StoreCategory[]> {
  const categories = await getStoreCategories();
  if (categories.length > 0) return categories;

  return [
    { id: "rings", name: "Rings", slug: "rings", parentId: null },
    { id: "earrings", name: "Earrings", slug: "earrings", parentId: null },
    { id: "pendants", name: "Pendants", slug: "pendants", parentId: null },
    { id: "bracelets-bangles", name: "Bracelets & Bangles", slug: "bracelets-bangles", parentId: null },
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

export const metadata: Metadata = {
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s`,
  },
  description: `${site.name} — ${site.tagline}. Crafted jewellery, made to be treasured.`,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [categories, cart] = await Promise.all([
    getNavigationCategories(),
    getCartSnapshot(),
  ]);
  const cartSlugs = (cart?.items ?? [])
    .map((item) => item.metadata?.slug)
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
  const cartCount =
    cart?.item_quantity ??
    (cart?.items ?? []).reduce((total, item) => total + item.quantity, 0);

  return (
    <html
      lang="en"
      translate="no"
      className={`${playfair.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider initialCartSlugs={cartSlugs}>
          <SiteHeader categories={categories} cartCount={cartCount} />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
