import Image from "next/image";
import { site, home } from "@/lib/site";
import { InstagramIcon } from "../icons";

export function InstagramSection() {
  const { instagram } = home;
  const profileUrl = `https://instagram.com/${site.instagram}`;
  const images = Array.from({ length: 4 }, (_, index) => ({
    name: `Instagram inspiration ${index + 1}`,
    image: `/insta%20(${index + 1}).jpeg`,
  }));

  return (
    <section
      id="social"
      className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 sm:px-8 sm:py-20"
    >
      <div className="relative mx-auto grid max-w-5xl grid-cols-[minmax(0,0.7fr)_minmax(15rem,1.4fr)_minmax(0,0.7fr)] items-center gap-3 sm:gap-6">
        <div className="grid gap-3 sm:gap-5">
          {[images[0], images[1]].map(
            (item, index) =>
              item && (
                <a
                  key={item.name}
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`See ${item.name.toLowerCase()} on Instagram`}
                  className={`group relative block overflow-hidden bg-stone-200 ${
                    index === 0
                      ? "aspect-square -rotate-3 rounded-[1.5rem_0.4rem_1.5rem_0.4rem]"
                      : "aspect-[4/5] rotate-2 rounded-[0.4rem_1.5rem_0.4rem_1.5rem]"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(min-width: 768px) 16vw, 28vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </a>
              ),
          )}
        </div>

        <div className="mx-auto max-w-xl px-1 text-center sm:px-4">
          <div className="inline-flex -rotate-3 items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-amber-800 shadow-sm">
            <InstagramIcon className="h-4 w-4" />
            <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em]">
              @{site.instagram}
            </span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-normal leading-tight text-stone-900 sm:text-4xl">
            {instagram.heading}
            <span className="ml-2 inline-block rotate-6 text-amber-700">✳</span>
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-stone-600">
            A little sparkle, a little studio magic, and all the stories in between.
          </p>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-5 inline-flex items-center gap-3 border-b border-stone-400 pb-2 text-xs font-medium uppercase tracking-[0.16em] text-stone-800 transition-colors hover:border-amber-700 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/60"
          >
            {instagram.followLabel}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        <div className="grid gap-3 sm:gap-5">
          {[images[2], images[3]].map(
            (item, index) =>
              item && (
                <a
                  key={item.name}
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`See ${item.name.toLowerCase()} on Instagram`}
                  className={`group relative block overflow-hidden bg-stone-200 ${
                    index === 0
                      ? "aspect-[4/5] -rotate-2 rounded-[0.4rem_1.5rem_0.4rem_1.5rem]"
                      : "aspect-square rotate-3 rounded-[1.5rem_0.4rem_1.5rem_0.4rem]"
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(min-width: 768px) 16vw, 28vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </a>
              ),
          )}
        </div>

        {/* <div className="pointer-events-none absolute left-1/2 top-0 hidden h-full -translate-x-1/2 items-center sm:flex">
          <span
            aria-hidden
            className="flex h-16 w-16 -translate-x-[3.2rem] -translate-y-20 rotate-12 items-center justify-center rounded-full border border-white/80 bg-amber-100 font-display text-xs italic text-amber-900 shadow-lg"
          >
            made with love
          </span>
        </div> */}
      </div>
    </section>
  );
}
