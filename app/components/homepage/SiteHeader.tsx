"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { site, home } from "@/lib/site";
import {
  InstagramIcon,
  MailIcon,
  MenuIcon,
  WhatsAppIcon,
  XIcon,
} from "../icons";

/**
 * Announcement bar + sticky header with desktop nav, a launch-notify pill and a
 * full-screen mobile menu. The only state is `menuOpen` — it initializes to
 * `false` on both server and client so hydration stays stable.
 */
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  // While the menu is open: lock page scroll and close on Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      {/* Announcement bar — sits above the sticky header */}
      <div className="bg-stone-950 px-5 py-2 text-center">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-amber-100/80">
          {site.announcement}
        </p>
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label="Open menu"
            className="relative z-10 flex h-12 w-12 shrink-0 touch-manipulation items-center justify-center rounded-full text-stone-500 transition-colors hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          {/* Logo + wordmark */}
          <Link
            href="/"
            aria-label={`${site.name} — home`}
            className="flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
          >
            <Image
              src={site.logo}
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-stone-200"
            />
            <span className="font-display text-sm font-medium tracking-[0.35em] text-stone-900">
              {site.name}
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex lg:gap-8">
            {home.nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full text-xs font-medium uppercase tracking-[0.2em] text-stone-500 transition-colors hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Launch shortcut — scrolls to the signup section */}
          <Link
            href="#launch"
            className="inline-flex h-10 shrink-0 items-center rounded-full bg-stone-900 px-5 text-xs font-medium uppercase tracking-[0.2em] text-amber-50 transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
          >
            {home.launchSignup.buttonLabel}
          </Link>
        </div>
      </header>

      {/* Mobile menu overlay — slides in from the left */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={`fixed inset-0 z-[60] bg-background transition-[transform,visibility] duration-300 ease-out ${
          menuOpen
            ? "visible pointer-events-auto translate-x-0"
            : "invisible pointer-events-none -translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col px-5 pb-10 pt-2 sm:px-8">
          {/* Overlay header */}
          <div className="flex h-16 items-center justify-between">
            <span className="font-display text-sm font-medium tracking-[0.35em] text-stone-900">
              {site.name}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-stone-500 transition-colors hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav aria-label="Mobile" className="mt-6 flex flex-col gap-6">
            {home.nav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="w-fit rounded-full font-display text-2xl font-medium text-stone-900 transition-colors hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Ornament divider */}
          <div aria-hidden className="mt-10 flex w-full items-center gap-3">
            <span className="h-px flex-1 bg-stone-300" />
            <span className="h-1.5 w-1.5 rotate-45 bg-amber-600" />
            <span className="h-px flex-1 bg-stone-300" />
          </div>

          {/* Social + contact icons */}
          <div className="mt-10 flex items-center gap-4">
            <a
              href={`https://wa.me/${site.contact.whatsapp}`}
              aria-label="WhatsApp us"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-stone-500 ring-1 ring-stone-200 backdrop-blur transition-all hover:text-amber-700 hover:ring-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <a
              href={`https://instagram.com/${site.instagram}`}
              aria-label={`${site.name} on Instagram`}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-stone-500 ring-1 ring-stone-200 backdrop-blur transition-all hover:text-amber-700 hover:ring-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
            >
              <InstagramIcon className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${site.contact.email}`}
              aria-label="Email us"
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-stone-500 ring-1 ring-stone-200 backdrop-blur transition-all hover:text-amber-700 hover:ring-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
            >
              <MailIcon className="h-5 w-5" />
            </a>
          </div>

          {/* Location, pinned to the bottom */}
          <p className="mt-auto text-xs uppercase tracking-[0.2em] text-stone-500">
            {site.contact.location}
          </p>
        </div>
      </div>
    </>
  );
}
