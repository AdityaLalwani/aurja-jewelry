import type { MetadataRoute } from "next";
import { allProfileSlugs, site } from "@/lib/site";
import { getJewelryProductSlugs, getStoreCategories } from "@/lib/swell";

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
  "/quotation",
  "/vmof",
  "/warranty-registration",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productSlugs, categories] = await Promise.all([
    getJewelryProductSlugs(),
    getStoreCategories(),
  ]);
  const routes = [
    ...staticRoutes,
    ...allProfileSlugs().map((slug) => `/${slug}`),
    ...categories.map(
      (category) => `/products?category=${encodeURIComponent(category.slug)}`,
    ),
    ...productSlugs.map((slug) => `/products/${encodeURIComponent(slug)}`),
  ];

  return routes.map((route) => ({
    url: new URL(route, site.url).toString(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/products" ? 0.9 : 0.7,
  }));
}
