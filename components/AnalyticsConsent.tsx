"use client";

import { useEffect, useState, type ReactNode } from "react";
import { parsePreferences, readPreferenceCookie } from "@/lib/cookie-preferences";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function AnalyticsConsent({ children }: { children: ReactNode }) {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      const allowed = parsePreferences(readPreferenceCookie())?.analytics === true;
      setAnalyticsAllowed(allowed);
      window.gtag?.("consent", "update", {
        analytics_storage: allowed ? "granted" : "denied",
      });
    };

    window.addEventListener("aurja:cookie-preferences-changed", syncConsent);
    syncConsent();
    return () =>
      window.removeEventListener("aurja:cookie-preferences-changed", syncConsent);
  }, []);

  return analyticsAllowed ? children : null;
}
