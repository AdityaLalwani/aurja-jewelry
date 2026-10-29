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
  isVariantInCart: (slug: string, variantKey: string) => boolean;
  cartCount: number;
  setCartSnapshot: (slugs: string[], count: number, variantKeys?: string[]) => void;
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
  initialCurrency = "USD",
  detectCurrencyFromBrowser = false,
}: {
  children: ReactNode;
  initialCartSlugs?: string[];
  initialCurrency?: Currency;
  detectCurrencyFromBrowser?: boolean;
}) {
  const [currency, setCurrency] = useState<Currency>(initialCurrency);

  useEffect(() => {
    if (!detectCurrencyFromBrowser || typeof window === "undefined") {
      return;
    }

    const { language } = window.navigator;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const detectedCurrency =
      language.toUpperCase().endsWith("-IN") ||
      timeZone === "Asia/Kolkata" ||
      timeZone === "Asia/Calcutta"
        ? "INR"
        : "USD";

    setCurrency((current) => (current === detectedCurrency ? current : detectedCurrency));
  }, [detectCurrencyFromBrowser]);
  const [enquiredSlugs, setEnquiredSlugs] = useState<string[]>([]);
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [wishlistHydrated, setWishlistHydrated] = useState(false);
  const [cartSlugs, setCartSlugs] = useState(initialCartSlugs);
  const [cartVariantKeys, setCartVariantKeys] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);

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

  const isInCart = useCallback(
    (slug: string) => cartSlugs.includes(slug),
    [cartSlugs],
  );
  const isVariantInCart = useCallback(
    (slug: string, variantKey: string) => {
      if (!slug) {
        return false;
      }
      const normalizedVariantKey = variantKey || "default";
      return (
        cartSlugs.includes(slug) &&
        cartVariantKeys.includes(`${slug}::${normalizedVariantKey}`)
      );
    },
    [cartSlugs, cartVariantKeys],
  );
  const setCartSnapshot = useCallback(
    (slugs: string[], count: number, variantKeys: string[] = []) => {
      const nextSlugs = [...slugs];
      const nextVariantKeys = [...variantKeys];

      setCartSlugs((currentSlugs) => {
        const sameSlugs =
          currentSlugs.length === nextSlugs.length &&
          currentSlugs.every((slug, index) => slug === nextSlugs[index]);
        return sameSlugs ? currentSlugs : nextSlugs;
      });

      setCartVariantKeys((currentVariantKeys) => {
        const sameVariantKeys =
          currentVariantKeys.length === nextVariantKeys.length &&
          currentVariantKeys.every(
            (variantKey, index) => variantKey === nextVariantKeys[index],
          );
        return sameVariantKeys ? currentVariantKeys : nextVariantKeys;
      });

      setCartCount((currentCount) => (currentCount === count ? currentCount : count));
    },
    [],
  );

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
      isVariantInCart,
      cartCount,
      setCartSnapshot,
    }),
    [
      currency,
      enquiredSlugs,
      isInCart,
      isVariantInCart,
      isWishlisted,
      markEnquired,
      toggleWishlist,
      wishlistSlugs,
      cartCount,
      setCartSnapshot,
    ],
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
