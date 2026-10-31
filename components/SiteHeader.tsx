"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/components/StoreProvider";
import type { JewelryProduct, StoreCategory } from "@/lib/swell";
import { imageKitLoader, normalizeImageSource } from "@/lib/imagekit";

const ICON_LINK_CLASS =
  "relative rounded-full border border-neutral-300 p-1.5 text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900 sm:p-2";

export function SiteHeader({
  categories,
  bestSellers,
  isAuthenticated,
}: {
  categories: StoreCategory[];
  bestSellers: JewelryProduct[];
  isAuthenticated: boolean;
}) {
  const { wishlistSlugs, cartCount } = useStore();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const overVideo = isHomePage && !isScrolled;
  const iconLinkClass = overVideo
    ? "relative rounded-full border border-white/35 p-1.5 text-white transition-colors hover:border-white hover:bg-white/10 sm:p-2"
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
          Fine jewelry, shaped for stories
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
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="site-navigation-menu"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:h-10 sm:w-10 ${
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
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 leading-tight sm:gap-2"
          >
            <Image
              src="/11.png"
              alt=""
              width={40}
              height={40}
              priority
              className={`h-8 w-8 object-contain transition-[filter] duration-300 sm:h-11 sm:w-11 ${
                overVideo ? "[filter:brightness(0)_invert(1)]" : ""
              }`}
            />
            <span>
              <span
                className={`block font-logo text-sm tracking-[0.2em] sm:text-xl sm:tracking-[0.25em] ${
                  overVideo ? "text-white" : "text-kajal"
                }`}
              >
                AURJA
              </span>
              <span
                className={`block text-[7px] uppercase tracking-[0.15em] sm:text-[10px] sm:tracking-[0.2em] ${
                  overVideo ? "text-white/75" : "text-neutral-500"
                }`}
              >
                Fine Jewelry
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            <Link href="/search" aria-label="Search" className={iconLinkClass}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 sm:h-5 sm:w-5"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </Link>

            <Link
              href="/profile"
              aria-label="Profile"
              className={`${iconLinkClass} hidden sm:inline-flex`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-4 w-4 sm:h-5 sm:w-5"
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
                className="h-4 w-4 sm:h-5 sm:w-5"
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
                className="h-4 w-4 sm:h-5 sm:w-5"
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
        id="site-navigation-menu"
        aria-hidden={!mobileMenuOpen}
        inert={!mobileMenuOpen}
        className={`fixed inset-0 z-[60] transition-[visibility] duration-300 ${
          mobileMenuOpen
            ? "visible pointer-events-auto"
            : "invisible pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Shop Aurja"
          className={`absolute inset-y-0 left-0 flex w-full max-w-5xl flex-col overflow-y-auto bg-cream px-5 pb-8 pt-3 shadow-2xl transition-transform duration-300 ease-out sm:px-8 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-14 items-center justify-between gap-2 border-b border-neutral-200">
            <span className="font-display text-sm font-medium uppercase tracking-[0.25em] text-neutral-900">
              Shop Aurja
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 sm:hidden">
                <Link
                  href={isAuthenticated ? "/profile" : "/signup"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="whitespace-nowrap rounded-full border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                  {isAuthenticated ? "Profile" : "Sign up"}
                </Link>
                <Link
                  href="/wishlist"
                  aria-label={`Wishlist, ${wishlistSlugs.length} item${wishlistSlugs.length === 1 ? "" : "s"}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-4 w-4"
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
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
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
          </div>

          <div className="grid gap-6 py-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
            <div>
              <nav aria-label="Shop categories">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                  Explore
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
                          className="block py-1 font-display text-xl uppercase tracking-[0.04em] text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
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
                      className="block py-1 font-display text-xl uppercase tracking-[0.04em] text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      Aurja Story
                    </Link>
                  </li>
                </ul>
              </nav>

              <Link
                href="/custom-design"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-6 hidden min-h-14 items-center justify-between rounded-full bg-stone-950 px-6 text-sm font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:flex"
              >
                custom design
                <span aria-hidden="true" className="text-lg">
                  ↗
                </span>
              </Link>
            </div>

            <section aria-labelledby="menu-best-sellers">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                    Loved by you
                  </p>
                  <h2
                    id="menu-best-sellers"
                    className="mt-1 font-display text-2xl text-neutral-900"
                  >
                    BESTSELLERS
                  </h2>
                </div>
              </div>
              <ul className="grid grid-cols-2 gap-1 sm:gap-4">
                {bestSellers.map((product) => (
                  <li key={product.slug}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
                        {product.images[0] ? (
                          <Image
                            src={normalizeImageSource(product.images[0])}
                            loader={imageKitLoader}
                            alt=""
                            fill
                            sizes="(min-width: 1024px) 25vw, 45vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-xs text-neutral-400">
                            Image unavailable
                          </span>
                        )}
                        <span className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-black/80 via-black/45 to-transparent px-3 pb-3 pt-8 text-sm font-medium leading-snug text-white sm:block">
                          {product.name}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <Link
              href="/custom-design"
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-14 items-center justify-between rounded-full bg-stone-950 px-6 text-sm font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:hidden"
            >
              custom design
              <span aria-hidden="true" className="text-lg">
                ↗
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
