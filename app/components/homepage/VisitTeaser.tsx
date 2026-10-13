import { site, home } from "@/lib/site";
import { MapPinIcon, WhatsAppIcon } from "../icons";

/**
 * Visit teaser — a centered frosted card inviting visitors to the atelier,
 * with real WhatsApp and Google Maps links from site.contact. Anchored at
 * `#visit` for the Contact nav link.
 */
export function VisitTeaser() {
  const { visit } = home;

  return (
    <section
      id="visit"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24"
    >
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center ring-1 ring-stone-200 motion-safe:animate-fade-up sm:p-12">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-200">
          <MapPinIcon className="h-5 w-5" />
        </span>
        <p className="mt-4 text-xs font-medium uppercase tracking-[0.3em] text-amber-700">
          {visit.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-2xl font-medium text-stone-900 sm:text-3xl">
          {visit.title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-stone-500">
          {visit.description}
        </p>
        <p className="mt-3 text-xs uppercase tracking-[0.15em] text-stone-400">
          {site.contact.location}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href={`https://wa.me/${site.contact.whatsapp}`}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-8 text-sm font-medium tracking-wide text-amber-50 transition-colors hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 sm:w-auto"
          >
            <WhatsAppIcon className="h-4 w-4" />
            {visit.whatsappLabel}
          </a>
          <a
            href={site.contact.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center rounded-full border border-stone-900/20 px-8 text-sm font-medium tracking-wide text-stone-900 transition-colors hover:border-amber-600 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 sm:w-auto"
          >
            {visit.directionsLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
