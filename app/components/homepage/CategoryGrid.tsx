import { home } from "@/lib/site";
import { MediaTile } from "./MediaTile";
import { SectionHeading } from "./SectionHeading";

/**
 * "What's Coming" — six category tiles in a 2/3-column grid. Until the shop
 * launches these are previews, not links: each tile pairs the shared MediaTile
 * (blurred photo when configured, warm gradient until then) with a prominent
 * centered "Coming Soon" badge over a soft veil, plus a gold glow on hover.
 */
export function CategoryGrid() {
  const { categories } = home;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <SectionHeading
        eyebrow={categories.eyebrow}
        title={categories.title}
        description={categories.description}
      />

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3">
        {categories.items.map((category) => (
          <div key={category.slug} className="group rounded-2xl">
            <MediaTile
              src={category.image}
              alt={category.name}
              variant={category.variant}
              blur
              className="aspect-[4/5] rounded-2xl transition-shadow duration-300 group-hover:ring-amber-300"
            >
              {/* Gold glow that intensifies on hover */}
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_100%,rgba(217,164,65,0.28),transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              {/* Soft veil so overlay copy stays readable over the blurred photo */}
              <div
                aria-hidden
                className="absolute inset-0 bg-stone-900/10"
              />
              {/* Prominent coming-soon badge, centered over the blurred photo */}
              <div className="absolute inset-0 flex items-center justify-center px-3">
                <span className="rounded-full border border-stone-900/10 bg-white/80 px-5 py-2 font-display text-xs font-medium uppercase tracking-[0.2em] text-stone-900 shadow-[0_2px_12px_rgba(41,37,36,0.08)] backdrop-blur-sm sm:px-6 sm:py-2.5 sm:tracking-[0.25em] sm:text-sm">
                  {categories.comingSoonLabel}
                </span>
              </div>
              {/* Bottom copy */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent p-4 sm:p-5">
                <h3 className="font-display text-base text-stone-900 sm:text-lg">
                  {category.name}
                </h3>
                <p className="mt-0.5 text-[0.7rem] text-stone-500 sm:text-xs">
                  {category.description}
                </p>
              </div>
            </MediaTile>
          </div>
        ))}
      </div>
    </section>
  );
}
