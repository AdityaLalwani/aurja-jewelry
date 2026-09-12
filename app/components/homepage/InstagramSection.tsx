import { site, home, type TileVariant } from "@/lib/site";
import { MediaTile } from "./MediaTile";
import { SectionHeading } from "./SectionHeading";
import { InstagramIcon } from "../icons";

/** Variants rotate across the six tiles until real feed imagery arrives. */
const tileVariants: readonly TileVariant[] = [
  "champagne",
  "honey",
  "blush",
  "pearl",
  "sand",
  "dusk",
] as const;

/**
 * Instagram section — a six-tile feed grid (MediaTile placeholders until
 * photography lands) with every tile and the follow CTA linking to the feed.
 */
export function InstagramSection() {
  const { instagram } = home;
  const profileUrl = `https://instagram.com/${site.instagram}`;

  return (
    <section className="hidden mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading
        eyebrow="Instagram"
        title={instagram.heading}
        description="Behind the scenes at the atelier — new pieces, works in progress and the hands that make them."
      />

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {Array.from({ length: instagram.tileCount }, (_, index) => (
          <a
            key={index}
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${site.name} on Instagram`}
            className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
          >
            <MediaTile
              alt=""
              variant={tileVariants[index % tileVariants.length]}
              className="aspect-square rounded-2xl transition-shadow duration-300 group-hover:ring-amber-300"
            >
              <span className="absolute inset-0 flex items-center justify-center">
                <InstagramIcon className="h-6 w-6 text-stone-400 transition-colors duration-300 group-hover:text-amber-700" />
              </span>
            </MediaTile>
          </a>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-stone-900/15 bg-white/70 px-8 text-sm font-medium tracking-wide text-stone-900 backdrop-blur transition-colors hover:border-amber-600 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
        >
          <InstagramIcon className="h-4 w-4 text-amber-700" />
          {instagram.followLabel}
        </a>
      </div>
    </section>
  );
}
