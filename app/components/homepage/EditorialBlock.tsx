import Link from "next/link";
import { home } from "@/lib/site";
import { MediaTile } from "./MediaTile";
import { SectionHeading } from "./SectionHeading";
import { ArrowRightIcon } from "../icons";

/**
 * "Our Story" — a split editorial section: media on the left, heading +
 * atelier copy + gold text-CTA on the right. Stacks on small screens.
 */
export function EditorialBlock() {
  const { story } = home;

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <MediaTile
          src={story.image}
          alt="Inside the AURJA atelier"
          variant={story.variant}
          className="aspect-[4/5] rounded-3xl"
        />

        <div className="motion-safe:animate-fade-up [animation-delay:180ms]">
          <SectionHeading align="left" eyebrow={story.eyebrow} title={story.title} />
          <div className="mt-6 space-y-5 text-sm leading-relaxed text-stone-600 sm:text-base">
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
          <Link
            href={story.ctaHref}
            className="group mt-8 inline-flex items-center gap-2 rounded-full text-sm font-medium uppercase tracking-[0.2em] text-amber-700 transition-colors hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
          >
            {story.ctaLabel}
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
