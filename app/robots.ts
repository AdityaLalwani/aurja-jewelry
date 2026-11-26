import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const PRIVATE_PATHS = [
  "/admin",
  "/api/",
  "/cart",
  "/checkout",
  "/login",
  "/signup",
  "/profile",
  "/search",
  "/wishlist",
];

const SEARCH_BOTS = [
  "OAI-SearchBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Googlebot",
  "bingbot",
];
const USER_FETCHERS = ["ChatGPT-User", "Claude-User", "Perplexity-User"];
const TRAINING_BOTS = ["GPTBot", "ClaudeBot", "Google-Extended", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      ...[SEARCH_BOTS, USER_FETCHERS, TRAINING_BOTS].map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
