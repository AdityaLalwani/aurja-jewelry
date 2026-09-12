import { site, home } from "@/lib/site";
import { InstagramIcon } from "../icons";
import { LaunchSignup } from "./LaunchSignup";

/**
 * Launch section — the `#launch` anchor every "Notify Me" CTA scrolls to.
 * A light editorial closing panel with the signup form and Instagram note.
 * Rendered near the bottom of the homepage and the story page so the header
 * pill works on both.
 */
export function LaunchSection() {
  const { launch } = home;

  return (
    <section
      id="launch"
      className="relative scroll-mt-24 overflow-hidden border-y border-stone-200 bg-[#f6f0e8] text-stone-900"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(217,164,65,0.26),transparent_58%),linear-gradient(135deg,#faf7f2,#f1e8dc)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-700/15 motion-safe:animate-halo-pulse [box-shadow:0_0_0_24px_rgba(217,164,65,0.04),0_0_0_48px_rgba(217,164,65,0.025)]"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-24">
          <div className="motion-safe:animate-fade-up">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-700">
              {launch.eyebrow}
            </p>
            <h2 className="mt-5 max-w-2xl font-display text-4xl font-medium leading-[0.95] tracking-[-0.03em] text-stone-900 sm:text-6xl lg:text-7xl">
              {launch.heading}
            </h2>
            <div aria-hidden className="mt-8 flex w-32 items-center gap-3">
              <span className="h-px flex-1 bg-amber-700/50" />
              <span className="h-1.5 w-1.5 rotate-45 bg-amber-700" />
            </div>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-stone-600 sm:text-base">
              {launch.description}
            </p>
          </div>

          <div className="motion-safe:animate-fade-up [animation-delay:220ms]">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-stone-500">
              Stay close to the making
            </p>
            <LaunchSignup variant="section" />

            <a
              href={`https://instagram.com/${site.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-[0.2em] text-stone-500 transition-colors hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700/60"
            >
              <InstagramIcon className="h-4 w-4" />
              {launch.instagramNote}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
