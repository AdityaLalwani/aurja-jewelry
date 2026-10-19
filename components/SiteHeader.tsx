"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useStore, type Currency } from "@/components/StoreProvider";
import type { StoreCategory } from "@/lib/swell";

const ICON_LINK_CLASS =
  "relative rounded-full border border-neutral-300 p-2 text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900";

function CategoryNav({
  categories,
  activeSlug,
}: {
  categories: StoreCategory[];
  activeSlug: string | null;
}) {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
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
                    ? "text-gold-link"
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
                    ? "text-gold-link"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {category.name}
              </Link>
            )}

            {hasSubcategories && isOpen && (
              <div className="absolute left-1/2 top-full z-30 mt-4 min-w-48 -translate-x-1/2 border border-neutral-200 bg-white p-2 shadow-lg">
                <Link
                  href={`/products?category=${category.slug}`}
                  onClick={() => setOpenCategoryId(null)}
                  className="block px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 hover:bg-cream"
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
                        ? "text-gold-link"
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
    </nav>
  );
}

/**
 * Highlights the category currently browsed on /products. useSearchParams
 * opts this subtree into client rendering, so it stays wrapped in Suspense
 * and prerendered pages fall back to the plain nav above.
 */
function ActiveCategoryNav({ categories }: { categories: StoreCategory[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeSlug =
    pathname === "/products" ? searchParams.get("category") : null;

  return <CategoryNav categories={categories} activeSlug={activeSlug} />;
}

export function SiteHeader({
  categories,
}: {
  categories: StoreCategory[];
}) {
  const { currency, setCurrency, wishlistSlugs, cartCount } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const topLevelCategories = categories.filter(
    (category) => !category.parentId,
  );

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
      <header className="sticky top-0 z-20 border-b border-neutral-200/80 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <button
            type="button"
            aria-label="Open categories menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-category-menu"
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:hidden"
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

        {/* Logo */}
        <Link href="/" className="shrink-0 leading-tight">
          <p className="font-display text-2xl tracking-[0.35em] text-neutral-900">
            AURJA
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
            Fine Jewelry
          </p>
        </Link>

          {/* Categories — fetched from the Swell API on the server */}
          <div className="hidden min-w-0 flex-1 lg:flex">
            <Suspense fallback={<CategoryNav categories={categories} activeSlug={null} />}>
              <ActiveCategoryNav categories={categories} />
            </Suspense>
          </div>

        {/* Icon menu: search, profile, wishlist, cart + currency */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href="/search" aria-label="Search" className={ICON_LINK_CLASS}>
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

          <Link href="/profile" aria-label="Profile" className={`${ICON_LINK_CLASS} hidden sm:inline-flex`}>
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
            className={`${ICON_LINK_CLASS} hidden sm:inline-flex`}
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
            className={ICON_LINK_CLASS}
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

          <div className="ml-1 hidden items-center gap-1 rounded-full border border-neutral-300 bg-white p-1 sm:flex">
            {(["INR", "USD"] as Currency[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors sm:px-4 ${
                  currency === code
                    ? "bg-gold text-white"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <span className="hidden sm:inline">
                  {code} {code === "INR" ? "(₹)" : "($)"}
                </span>
                <span className="sm:hidden">{code === "INR" ? "₹" : "$"}</span>
              </button>
            ))}
          </div>
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
            <div className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white p-1">
              {(["INR", "USD"] as Currency[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  aria-pressed={currency === code}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                    currency === code
                      ? "bg-gold text-white"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
