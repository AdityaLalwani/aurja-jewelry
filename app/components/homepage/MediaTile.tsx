import type { ReactNode } from "react";
import Image from "next/image";
import type { TileVariant } from "@/lib/site";

/**
 * Warm light gradient placeholders, keyed by variant — used until real
 * photography lands in /public. Each pairs a base diagonal gradient with
 * one positioned radial glow so tiles read as softly lit surfaces.
 */
const placeholderGradients: Record<TileVariant, string> = {
  champagne:
    "bg-[radial-gradient(120%_100%_at_20%_0%,rgba(253,230,180,0.9),transparent_55%),linear-gradient(160deg,#fdf8ef,#f2e3cc)]",
  honey: "bg-[radial-gradient(110%_90%_at_80%_0%,rgba(254,215,170,0.85),transparent_55%),linear-gradient(160deg,#fff8eb,#f6e6c8)]",
  blush:
    "bg-[radial-gradient(120%_100%_at_30%_0%,rgba(254,205,211,0.8),transparent_55%),linear-gradient(160deg,#fff5f6,#f9e3e6)]",
  pearl: "bg-[radial-gradient(100%_90%_at_50%_10%,rgba(231,229,228,0.9),transparent_60%),linear-gradient(160deg,#fdfcfa,#efece7)]",
  sand: "bg-[radial-gradient(120%_100%_at_15%_100%,rgba(254,237,213,0.9),transparent_55%),linear-gradient(160deg,#fffaf0,#f0e2cc)]",
  dusk: "bg-[radial-gradient(110%_95%_at_70%_5%,rgba(221,214,254,0.7),transparent_55%),linear-gradient(160deg,#f8f6ff,#e8e3f3)]",
};

type MediaTileProps = {
  /** Optional: path to a photo in /public. Unset → gradient placeholder. */
  src?: string;
  alt: string;
  variant: TileVariant;
  className?: string;
  /** Render the photo blurred (e.g. pre-launch category previews). */
  blur?: boolean;
  /** Rendered above the media — e.g. captions or hover layers. */
  children?: ReactNode;
};

/**
 * Media slot for homepage sections — a sized, rounded surface (callers pass
 * aspect-ratio + radius via className) holding either a photo or a warm
 * gradient placeholder, with optional overlay content. `blur` softens the
 * photo; the scale-110 keeps the blur from exposing transparent edges.
 */
export function MediaTile({
  src,
  alt,
  variant,
  className = "",
  blur = false,
  children,
}: MediaTileProps) {
  const isAnimated = src ? /\.(gif|webp)$/i.test(src) : false;

  return (
    <div
      className={`group relative overflow-hidden ring-1 ring-inset ring-stone-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized={isAnimated}
          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${blur ? "scale-110 blur-md" : ""}`}
        />
      ) : (
        <div
          aria-hidden
          className={`absolute inset-0 ${placeholderGradients[variant]}`}
        />
      )}
      {children}
    </div>
  );
}
