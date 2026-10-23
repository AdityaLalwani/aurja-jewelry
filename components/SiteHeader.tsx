"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useStore } from "@/components/StoreProvider";
import type { StoreCategory } from "@/lib/swell";

const ICON_LINK_CLASS =
  "relative rounded-full border border-neutral-300 p-2 text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900";

function CategoryNav({
  categories,
  activeSlug,
  light = false,
}: {
  categories: StoreCategory[];
  activeSlug: string | null;
  light?: boolean;
}) {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const isStoryActive = usePathname() === "/story";
  const topLevelCategories = categories.filter(
    (category) => !category.parentId,
  );

  return (
    <nav
      aria-label="Categories"
      className="flex flex-1 items-center justify-center gap-4 sm:gap-6"
    >
      {topLevelCategories.map((category) => {
        const subcategories = categories.filter(
          (subcategory) => subcategory.parentId === category.id,
        );
        const hasSubcategories = subcategories.length > 0;
        const isOpen = openCategoryId === category.id;
        const isActive =
          activeSlug === category.slug ||
          subcategories.some((subcategory) => activeSlug === subcategory.slug);

        return (
          <div key={category.id} className="relative">
            {hasSubcategories ? (
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenCategoryId(isOpen ? null : category.id)
                }
                className={`text-xs font-medium uppercase tracking-[0.2em] transition-colors ${
                  isActive || isOpen
                    ? light
                      ? "text-amber-200"
                      : "text-gold-link"
                    : light
                      ? "text-white/90 hover:text-white"
                      : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {category.name}
              </button>
            ) : (
              <Link
                href={`/products?category=${category.slug}`}
                className={`text-xs font-medium uppercase tracking-[0.2em] transition-colors ${
                  isActive
                    ? light
                      ? "text-amber-200"
                      : "text-gold-link"
                    : light
                      ? "text-white/90 hover:text-white"
                      : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {category.name}
              </Link>
            )}

            {hasSubcategories && isOpen && (
              <div
                className={`absolute left-1/2 top-full z-30 mt-4 min-w-48 -translate-x-1/2 border p-2 shadow-lg ${
                  light
                    ? "border-white/15 bg-stone-950/95"
                    : "border-neutral-200 bg-white"
                }`}
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  onClick={() => setOpenCategoryId(null)}
                  className={`block px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] hover:bg-cream ${
                    light ? "text-white" : "text-neutral-900"
                  }`}
                >
                  View all {category.name}
                </Link>
                {subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={`/products?category=${subcategory.slug}`}
                    onClick={() => setOpenCategoryId(null)}
                    className={`block px-3 py-2 text-sm transition-colors hover:bg-cream ${
                      activeSlug === subcategory.slug
                        ? light
                          ? "text-amber-700"
                          : "text-gold-link"
                        : light
                          ? "text-white/80"
                          : "text-neutral-600"
                    }`}
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <Link
        href="/story"
        className={`text-xs font-medium uppercase tracking-[0.2em] transition-colors ${
          isStoryActive
            ? light
              ? "text-amber-200"
              : "text-gold-link"
            : light
              ? "text-white/90 hover:text-white"
              : "text-neutral-600 hover:text-neutral-900"
        }`}
      >
        Aurja Story
      </Link>
    </nav>
  );
}

/**
 * Highlights the category currently browsed on /products. useSearchParams
 * opts this subtree into client rendering, so it stays wrapped in Suspense
 * and prerendered pages fall back to the plain nav above.
 */
function ActiveCategoryNav({
  categories,
  light,
}: {
  categories: StoreCategory[];
  light: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug =
    pathname === "/products" ? searchParams.get("category") : null;

  return (
    <CategoryNav categories={categories} activeSlug={activeSlug} light={light} />
  );
}

export function SiteHeader({
  categories,
}: {
  categories: StoreCategory[];
}) {
  const { wishlistSlugs, cartCount } = useStore();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const overVideo = isHomePage && !isScrolled;
  const iconLinkClass = overVideo
    ? "relative rounded-full border border-white/35 p-2 text-white transition-colors hover:border-white hover:bg-white/10"
    : ICON_LINK_CLASS;
  const topLevelCategories = categories.filter(
    (category) => !category.parentId,
  );

  useEffect(() => {
    const updateScrolledState = () => setIsScrolled(window.scrollY > 40);
    updateScrolledState();
    window.addEventListener("scroll", updateScrolledState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolledState);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {!isHomePage && (
        <div className="bg-stone-950 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-amber-100 sm:text-xs">
          Fine jewellery, shaped for stories
        </div>
      )}
      <header
        className={
          isHomePage
            ? `fixed inset-x-0 top-0 z-40 border-b backdrop-blur-md transition-[background-color,border-color,color,box-shadow] duration-300 ${
                overVideo
                  ? "border-white/20 bg-stone-950/15 text-white"
                  : "border-neutral-200/80 bg-white/95 text-neutral-900 shadow-sm"
              }`
            : "sticky top-0 z-20 border-b border-neutral-200/80 bg-cream/90 backdrop-blur"
        }
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <button
            type="button"
            aria-label="Open categories menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-category-menu"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:hidden ${
              overVideo
                ? "border-white/40 text-white hover:border-white hover:bg-white/10"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

        <Link
          href="/"
          aria-label="AURJA — home"
          className="flex shrink-0 items-center gap-2 leading-tight"
        >
          <Image
            src="/11.png"
            alt=""
            width={44}
            height={44}
            priority
            className={`h-11 w-11 object-contain transition-[filter] duration-300 ${
              overVideo ? "[filter:brightness(0)_invert(1)]" : ""
            }`}
          />
          <span>
            <span
              className={`block font-logo text-xl tracking-[0.25em] ${
                overVideo ? "text-white" : "text-kajal"
              }`}
            >
              AURJA
            </span>
            <span
              className={`block text-[10px] uppercase tracking-[0.2em] ${
                overVideo ? "text-white/75" : "text-neutral-500"
              }`}
            >
              Fine Jewelry
            </span>
          </span>
        </Link>

          {/* Categories — fetched from the Swell API on the server */}
          <div className="hidden min-w-0 flex-1 lg:flex">
            <Suspense
              fallback={
                <CategoryNav
                  categories={categories}
                  activeSlug={null}
                  light={overVideo}
                />
              }
            >
              <ActiveCategoryNav
                categories={categories}
                light={overVideo}
              />
            </Suspense>
          </div>

        {/* Icon menu: search, profile, wishlist, cart */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href="/search" aria-label="Search" className={iconLinkClass}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </Link>

          <Link href="/profile" aria-label="Profile" className={`${iconLinkClass} hidden sm:inline-flex`}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
            </svg>
          </Link>

          <Link
            href="/wishlist"
            aria-label={`Wishlist, ${wishlistSlugs.length} item${wishlistSlugs.length === 1 ? "" : "s"}`}
            className={`${iconLinkClass} hidden sm:inline-flex`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M12 20.5c-5.5-4-8.5-7-8.5-10.5a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2c0 3.5-3 6.5-8.5 10.5z" />
            </svg>
            {wishlistSlugs.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
                {wishlistSlugs.length}
              </span>
            )}
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className={iconLinkClass}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M3 4h2l2.2 10.8a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
              <path d="M8 11h11.7" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

        </div>
        </div>
      </header>

      <div
        id="mobile-category-menu"
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
        className={`fixed inset-0 z-50 overflow-y-auto bg-cream transition-[transform,visibility] duration-300 ease-out lg:hidden ${
          mobileMenuOpen
            ? "visible pointer-events-auto translate-x-0"
            : "invisible pointer-events-none -translate-x-full"
        }`}
      >
        <div className="mx-auto flex min-h-full max-w-xl flex-col px-5 pb-8 pt-3 sm:px-8">
          <div className="flex h-14 items-center justify-between border-b border-neutral-200">
            <span className="font-display text-sm font-medium uppercase tracking-[0.25em] text-neutral-900">
              Shop Aurja
            </span>
            <button
              type="button"
              aria-label="Close categories menu"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>

          <nav aria-label="Mobile categories" className="flex-1 py-5">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              Categories
            </p>
            <ul className="divide-y divide-neutral-200">
              {topLevelCategories.map((category) => {
                const subcategories = categories.filter(
                  (subcategory) => subcategory.parentId === category.id,
                );

                return (
                  <li key={category.id} className="py-3">
                    <Link
                      href={`/products?category=${category.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 font-display text-xl text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      {category.name}
                    </Link>
                    {subcategories.length > 0 && (
                      <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-2 pl-3">
                        {subcategories.map((subcategory) => (
                          <li key={subcategory.id}>
                            <Link
                              href={`/products?category=${subcategory.slug}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="text-sm text-neutral-600 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                            >
                              {subcategory.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
              <li className="py-3">
                <Link
                  href="/story"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1 font-display text-xl text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  Aurja Story
                </Link>
              </li>
            </ul>
          </nav>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-5">
            <div className="flex gap-5 text-sm text-neutral-600">
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                Profile
              </Link>
              <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)}>
                Wishlist ({wishlistSlugs.length})
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
