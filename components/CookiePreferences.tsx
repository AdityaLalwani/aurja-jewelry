"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";

const COOKIE_NAME = "aurja_cookie_preferences";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

type CookiePreferences = {
  version: 1;
  analytics: boolean;
  marketing: boolean;
};

function readPreferenceCookie() {
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

function subscribeToPreferences(onChange: () => void) {
  window.addEventListener("aurja:cookie-preferences-changed", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("aurja:cookie-preferences-changed", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function parsePreferences(value: string | null): CookiePreferences | null {
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

function savePreferences(preferences: CookiePreferences) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(preferences),
  )}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event("aurja:cookie-preferences-changed"));
}

export function CookiePreferences() {
  const rawPreferences = useSyncExternalStore(
    subscribeToPreferences,
    readPreferenceCookie,
    () => null,
  );
  const preferences = parsePreferences(rawPreferences);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const openSettings = () => {
      const current = parsePreferences(readPreferenceCookie());
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setSettingsOpen(true);
    };

    window.addEventListener("aurja:open-cookie-settings", openSettings);
    return () => window.removeEventListener("aurja:open-cookie-settings", openSettings);
  }, []);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen]);

  function acceptAll() {
    savePreferences({ version: 1, analytics: true, marketing: true });
    setSettingsOpen(false);
  }

  function rejectOptional() {
    savePreferences({ version: 1, analytics: false, marketing: false });
    setSettingsOpen(false);
  }

  function saveSelection() {
    savePreferences({ version: 1, analytics, marketing });
    setSettingsOpen(false);
  }

  return (
    <>
      {!preferences ? (
        <aside
          aria-label="Cookie preferences"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-[#faf7f2] px-5 py-5 shadow-[0_-12px_40px_rgba(41,37,36,0.12)] sm:px-8"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-xl font-medium text-stone-900">
                Your privacy matters
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                We use essential cookies to keep the store working. Optional
                analytics and marketing cookies are not currently enabled.
                Choose whether to allow them if introduced.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={rejectOptional}
                className="min-h-11 rounded-full border border-stone-300 px-4 text-xs font-medium uppercase tracking-[0.12em] text-stone-700 transition-colors hover:border-stone-500"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnalytics(false);
                  setMarketing(false);
                  setSettingsOpen(true);
                }}
                className="min-h-11 rounded-full border border-stone-300 px-4 text-xs font-medium uppercase tracking-[0.12em] text-stone-700 transition-colors hover:border-stone-500"
              >
                Choose options
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="min-h-11 rounded-full bg-stone-900 px-5 text-xs font-medium uppercase tracking-[0.12em] text-amber-50 transition-colors hover:bg-amber-800"
              >
                Accept all
              </button>
            </div>
          </div>
        </aside>
      ) : null}

      {settingsOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSettingsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-settings-title"
            className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-[1.5rem] bg-[#faf7f2] p-6 shadow-2xl sm:rounded-[1.5rem] sm:p-8"
          >
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-700">
              Privacy settings
            </p>
            <h2
              id="cookie-settings-title"
              className="mt-3 font-display text-3xl font-medium text-stone-900"
            >
              Choose your cookies
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              Essential cookies keep core store features working. Optional
              categories are not currently active; your choices will be
              respected if those services are added.
            </p>

            <div className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
              <div className="flex items-start justify-between gap-5 py-4">
                <div>
                  <h3 className="font-medium text-stone-900">Essential</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    Required for cart, sign-in and secure site operation.
                  </p>
                </div>
                <span className="shrink-0 pt-1 text-xs font-medium uppercase tracking-wide text-stone-500">
                  Always on
                </span>
              </div>
              <label className="flex cursor-pointer items-start justify-between gap-5 py-4">
                <span>
                  <span className="font-medium text-stone-900">Analytics</span>
                  <span className="mt-1 block text-sm leading-relaxed text-stone-600">
                    Helps us understand how visitors use the store.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.currentTarget.checked)}
                  className="mt-1 h-5 w-5 accent-amber-700"
                />
              </label>
              <label className="flex cursor-pointer items-start justify-between gap-5 py-4">
                <span>
                  <span className="font-medium text-stone-900">Marketing</span>
                  <span className="mt-1 block text-sm leading-relaxed text-stone-600">
                    Allows relevant advertising and campaign measurement.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(event) => setMarketing(event.currentTarget.checked)}
                  className="mt-1 h-5 w-5 accent-amber-700"
                />
              </label>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-stone-500">
              Change your choice anytime using Cookie Preferences in the footer.
              Read more in our{" "}
              <Link
                href="/privacy-policy"
                className="underline underline-offset-4 hover:text-amber-700"
              >
                Privacy Policy
              </Link>
              .
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={rejectOptional}
                className="min-h-11 rounded-full border border-stone-300 px-5 text-xs font-medium uppercase tracking-[0.12em] text-stone-700 transition-colors hover:border-stone-500"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={saveSelection}
                className="min-h-11 rounded-full bg-stone-900 px-5 text-xs font-medium uppercase tracking-[0.12em] text-amber-50 transition-colors hover:bg-amber-800"
              >
                Save my choices
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
