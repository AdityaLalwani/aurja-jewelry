"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { JewelryProduct } from "@/lib/swell";

export type Currency = "INR" | "USD";

type StoreContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  enquiredSlugs: string[];
  markEnquired: (slug: string) => void;
  wishlistSlugs: string[];
  isWishlisted: (slug: string) => boolean;
  toggleWishlist: (slug: string) => void;
  isInCart: (slug: string) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function formatPrice(
  product: JewelryProduct,
  currency: Currency,
): string {
  return currency === "INR"
    ? `₹${new Intl.NumberFormat("en-IN").format(product.price_inr)}`
    : `$${new Intl.NumberFormat("en-US").format(
        product.attributes.price_usd,
      )}`;
}

export function StoreProvider({
  children,
  initialCartSlugs = [],
}: {
  children: ReactNode;
  initialCartSlugs?: string[];
}) {
  const [currency, setCurrency] = useState<Currency>("INR");
  const [enquiredSlugs, setEnquiredSlugs] = useState<string[]>([]);
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [wishlistHydrated, setWishlistHydrated] = useState(false);
  const [cartSlugs] = useState(initialCartSlugs);

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("aurja_wishlist");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setWishlistSlugs(
              parsed.filter(
                (slug): slug is string => typeof slug === "string",
              ),
            );
          }
        }
      } catch {
        // Ignore unavailable or malformed local wishlist data.
      } finally {
        setWishlistHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(hydration);
  }, []);

  useEffect(() => {
    if (wishlistHydrated) {
      window.localStorage.setItem("aurja_wishlist", JSON.stringify(wishlistSlugs));
    }
  }, [wishlistHydrated, wishlistSlugs]);

  const markEnquired = useCallback((slug: string) => {
    setEnquiredSlugs((slugs) =>
      slugs.includes(slug) ? slugs : [...slugs, slug],
    );
  }, []);

  const toggleWishlist = useCallback((slug: string) => {
    setWishlistSlugs((slugs) =>
      slugs.includes(slug)
        ? slugs.filter((savedSlug) => savedSlug !== slug)
        : [...slugs, slug],
    );
  }, []);

  const isWishlisted = useCallback(
    (slug: string) => wishlistSlugs.includes(slug),
    [wishlistSlugs],
  );

  const isInCart = useCallback((slug: string) => cartSlugs.includes(slug), [cartSlugs]);

  const value = useMemo<StoreContextValue>(
    () => ({
      currency,
      setCurrency,
      enquiredSlugs,
      markEnquired,
      wishlistSlugs,
      isWishlisted,
      toggleWishlist,
      isInCart,
    }),
    [currency, enquiredSlugs, isInCart, isWishlisted, markEnquired, toggleWishlist, wishlistSlugs],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
