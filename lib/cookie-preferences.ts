export const COOKIE_NAME = "aurja_cookie_preferences";

export type CookiePreferences = {
  version: 1;
  analytics: boolean;
  marketing: boolean;
};

export function readPreferenceCookie() {
  if (typeof document === "undefined") return null;
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(COOKIE_NAME.length + 1));
  } catch {
    return null;
  }
}

export function parsePreferences(value: string | null): CookiePreferences | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<CookiePreferences>;
    if (
      parsed.version !== 1 ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.marketing !== "boolean"
    ) {
      return null;
    }
    return {
      version: 1,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
    };
  } catch {
    return null;
  }
}
