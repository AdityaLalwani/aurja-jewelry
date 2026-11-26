import { headers } from "next/headers";

const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
] as const;

const CRAWLER_USER_AGENTS = [
  "OAI-SearchBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Googlebot",
  "bingbot",
  "ChatGPT-User",
  "Claude-User",
  "Perplexity-User",
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "CCBot",
] as const;

function getCountryFromLocale(acceptLanguage: string | null) {
  for (const language of acceptLanguage?.split(",") ?? []) {
    const locale = language.split(";")[0]?.trim();
    const region = locale?.match(/[-_]([a-z]{2})$/i)?.[1];
    if (region) return region.toUpperCase();
  }

  return null;
}

export function isIndiaStorefront(requestHeaders: Pick<Headers, "get">) {
  const country = COUNTRY_HEADERS.map((name) => requestHeaders.get(name)).find(
    (value) => value?.trim(),
  );

  if (country) return country.trim().toUpperCase() === "IN";

  const localeCountry = getCountryFromLocale(
    requestHeaders.get("accept-language"),
  );
  return localeCountry === "IN";
}

export function isRecognizedCrawler(requestHeaders: Pick<Headers, "get">) {
  const userAgent = requestHeaders.get("user-agent")?.toLowerCase() ?? "";
  return CRAWLER_USER_AGENTS.some((crawler) =>
    userAgent.includes(crawler.toLowerCase()),
  );
}

export async function getIsIndiaStorefront() {
  return isIndiaStorefront(await headers());
}

export async function canViewProductCatalog() {
  const requestHeaders = await headers();
  return (
    isIndiaStorefront(requestHeaders) || isRecognizedCrawler(requestHeaders)
  );
}
