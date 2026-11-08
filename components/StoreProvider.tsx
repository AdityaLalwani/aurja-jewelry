"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { JewelryProduct } from "@/lib/swell";
import type { LocalCartItem } from "@/lib/cart-view";

export type Currency = "INR" | "USD";

const ENQUIRED_COOKIE_NAME = "aurja_enquired_products";
const ENQUIRED_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const EMPTY_WISHLIST: string[] = [];
const LOCAL_CART_STORAGE_PREFIX = "aurja_cart_";

function subscribeToWishlistChanges() {
  return () => {};
}

function readEnquiredCookie(): string[] {
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${ENQUIRED_COOKIE_NAME}=`));
  if (!entry) return [];

  try {
    const parsed: unknown = JSON.parse(
      decodeURIComponent(entry.slice(ENQUIRED_COOKIE_NAME.length + 1)),
    );
    return Array.isArray(parsed)
      ? parsed.filter((slug): slug is string => typeof slug === "string")
      : [];
  } catch {
    return [];
  }
}

function saveEnquiredCookie(slugs: string[]) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ENQUIRED_COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(slugs),
  )}; Path=/; Max-Age=${ENQUIRED_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

function localCartStorageKey(accountId: string): string {
  return `${LOCAL_CART_STORAGE_PREFIX}${accountId}`;
}

function isLocalCartItem(value: unknown): value is LocalCartItem {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as Partial<LocalCartItem>;
  return (
    typeof item.id === "string" &&
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.quantity === "number" &&
    typeof item.variantKey === "string" &&
    Array.isArray(item.variantSummary) &&
    Array.isArray(item.selectedOptions)
  );
}

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
  localCartReady: boolean;
  localCartItems: LocalCartItem[];
  addLocalCartItem: (item: LocalCartItem) => void;
  updateLocalCartItem: (id: string, quantity: number) => void;
  removeLocalCartItem: (id: string) => void;
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
  initialCurrency = "USD",
  detectCurrencyFromBrowser = false,
  accountId = null,
}: {
  children: ReactNode;
  initialCurrency?: Currency;
  detectCurrencyFromBrowser?: boolean;
  accountId?: string | null;
}) {
  const [currency, setCurrency] = useState<Currency>(initialCurrency);

  useEffect(() => {
    if (!detectCurrencyFromBrowser || typeof window === "undefined") {
      return;
    }

    const detection = window.setTimeout(() => {
      const { language } = window.navigator;
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const detectedCurrency =
        language.toUpperCase().endsWith("-IN") ||
        timeZone === "Asia/Kolkata" ||
        timeZone === "Asia/Calcutta"
          ? "INR"
          : "USD";

      setCurrency((current) =>
        current === detectedCurrency ? current : detectedCurrency,
      );
    }, 0);

    return () => window.clearTimeout(detection);
  }, [detectCurrencyFromBrowser]);
  const [enquiredSlugs, setEnquiredSlugs] = useState<string[]>([]);
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [wishlistHydrated, setWishlistHydrated] = useState(false);
  const [localCartItems, setLocalCartItems] = useState<LocalCartItem[]>([]);
  const [localCartOwner, setLocalCartOwner] = useState<string | null>(null);
  const cartOwner = accountId ?? "guest";
  const localCartReady = localCartOwner === cartOwner;
  const activeLocalCartItems = useMemo(
    () => (localCartReady ? localCartItems : []),
    [localCartItems, localCartReady],
  );

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(
          localCartStorageKey(cartOwner),
        );
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        setLocalCartItems(
          Array.isArray(parsed) ? parsed.filter(isLocalCartItem) : [],
        );
      } catch (error) {
        console.error("Could not load the local cart", error);
        setLocalCartItems([]);
      }
      setLocalCartOwner(cartOwner);
    }, 0);

    return () => window.clearTimeout(hydration);
  }, [cartOwner]);

  useEffect(() => {
    if (!localCartReady) {
      return;
    }

    try {
      window.localStorage.setItem(
        localCartStorageKey(cartOwner),
        JSON.stringify(localCartItems),
      );
    } catch (error) {
      console.error("Could not save the local cart", error);
    }
  }, [cartOwner, localCartItems, localCartReady]);

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      const savedSlugs = readEnquiredCookie();
      if (savedSlugs.length === 0) return;
      setEnquiredSlugs((slugs) =>
        [...new Set([...slugs, ...savedSlugs])],
      );
    }, 0);

    return () => window.clearTimeout(hydration);
  }, []);

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

  const markEnquired = useCallback(
    (slug: string) => {
      if (enquiredSlugs.includes(slug)) return;
      const nextSlugs = [
        ...new Set([...enquiredSlugs, ...readEnquiredCookie(), slug]),
      ];
      saveEnquiredCookie(nextSlugs);
      setEnquiredSlugs(nextSlugs);
    },
    [enquiredSlugs],
  );

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
    (slug: string) => activeLocalCartItems.some((item) => item.slug === slug),
    [activeLocalCartItems],
  );
  const isVariantInCart = useCallback(
    (slug: string, variantKey: string) => {
      if (!slug) {
        return false;
      }
      const normalizedVariantKey = variantKey || "default";
      return activeLocalCartItems.some(
        (item) =>
          item.slug === slug && item.variantKey === normalizedVariantKey,
      );
    },
    [activeLocalCartItems],
  );
  const addLocalCartItem = useCallback(
    (item: LocalCartItem) => {
      setLocalCartItems((items) => {
        const existing = items.find(
          (entry) =>
            entry.slug === item.slug && entry.variantKey === item.variantKey,
        );
        if (!existing) {
          return [...items, item];
        }
        return items.map((entry) =>
          entry.id === existing.id
            ? {
                ...entry,
                quantity: Math.min(99, entry.quantity + item.quantity),
              }
            : entry,
        );
      });
    },
    [],
  );
  const updateLocalCartItem = useCallback((id: string, quantity: number) => {
    const clampedQuantity = Math.min(99, Math.max(1, Math.round(quantity)));
    setLocalCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: clampedQuantity } : item,
      ),
    );
  }, []);
  const removeLocalCartItem = useCallback((id: string) => {
    setLocalCartItems((items) => items.filter((item) => item.id !== id));
  }, []);
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
      localCartReady,
      localCartItems: activeLocalCartItems,
      cartCount: activeLocalCartItems.reduce(
        (total, item) => total + item.quantity,
        0,
      ),
      addLocalCartItem,
      updateLocalCartItem,
      removeLocalCartItem,
    }),
    [
      currency,
      enquiredSlugs,
      isInCart,
      isVariantInCart,
      localCartReady,
      activeLocalCartItems,
      addLocalCartItem,
      updateLocalCartItem,
      removeLocalCartItem,
      isWishlisted,
      markEnquired,
      toggleWishlist,
      wishlistSlugs,
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

export function useHydrationSafeWishlistSlugs(): string[] {
  const { wishlistSlugs } = useStore();

  // Context updates trigger rerenders; the server snapshot keeps stored data out of hydration.
  return useSyncExternalStore(
    subscribeToWishlistChanges,
    () => wishlistSlugs,
    () => EMPTY_WISHLIST,
  );
}
