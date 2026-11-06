"use client";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("aurja:open-cookie-settings"))}
      className="text-xs text-stone-500 underline underline-offset-4 transition-colors hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
    >
      Cookie Preferences
    </button>
  );
}
