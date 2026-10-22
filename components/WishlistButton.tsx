"use client";

import { useStore } from "@/components/StoreProvider";

export function WishlistButton({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const { isWishlisted, toggleWishlist } = useStore();
  const saved = isWishlisted(slug);

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={saved}
      title={saved ? "Remove from wishlist" : "Add to wishlist"}
      onClick={() => toggleWishlist(slug)}
      className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white/90 shadow-sm backdrop-blur transition-colors hover:border-gold hover:text-gold ${
        saved ? "border-gold text-gold" : "border-neutral-200 text-neutral-600"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M12 20.5c-5.5-4-8.5-7-8.5-10.5a4.5 4.5 0 0 1 8.5-2 4.5 4.5 0 0 1 8.5 2c0 3.5-3 6.5-8.5 10.5z" />
      </svg>
    </button>
  );
}
