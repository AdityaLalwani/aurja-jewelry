import type { MetadataRoute } from "next";
import { allProfileSlugs, site } from "@/lib/site";
import { getJewelryProductSlugs, getStoreCategories } from "@/lib/storefront-data";
import { tradeContentLastModified } from "@/lib/trade-content";

const TRADE_ROUTES = new Set([
  "",
  "/faq",
  "/wholesale",
  "/manufacturing",
  "/private-label",
  "/custom-jewellery-manufacturing",
  "/manufacturing-process",
  "/export",
  "/trade-catalogue",
  "/quality-certifications",
  "/request-quote",
  "/become-a-partner",
  "/case-studies",
  "/about",
  "/akshat-modi",
]);

const staticRoutes = [
  "",
  "/products",
  "/story",
  "/blogs",
  "/custom-design",
  "/care-guide",
  "/faq",
  "/privacy-policy",
  "/refund-policy",
  "/size-guide",
  "/terms-and-conditions",
  "/warranty-registration",
  "/visit-us",
  "/wholesale",
  "/manufacturing",
  "/private-label",
  "/custom-jewellery-manufacturing",
  "/manufacturing-process",
  "/export",
  "/trade-catalogue",
  "/quality-certifications",
  "/request-quote",
  "/become-a-partner",
  "/case-studies",
  "/about",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, categories] = await Promise.all([
    getJewelryProductSlugs(),
    getStoreCategories(),
  ]);
  const routes = [
    ...staticRoutes,
    ...allProfileSlugs().map((slug) => `/${slug}`),
    ...categories.map((category) => `/${encodeURIComponent(category.slug)}`),
    ...productSlugs.map((slug) => `/products/${encodeURIComponent(slug)}`),
  ];

  return routes.map((route) => ({
    url: new URL(route, site.url).toString(),
    ...(TRADE_ROUTES.has(route)
      ? { lastModified: tradeContentLastModified }
      : {}),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.7,
  }));
}
