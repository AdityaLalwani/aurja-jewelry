import { home, type ValueConfig } from "@/lib/site";

function PrincipleIcon({ icon }: { icon: ValueConfig["icon"] }) {
  const sharedProps = {
    className: "h-9 w-9 sm:h-10 sm:w-10",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.35,
    viewBox: "0 0 40 40",
    "aria-hidden": true as const,
  };

  switch (icon) {
    case "leaf":
      return (
        <svg {...sharedProps}>
          <path d="M20 34V18" />
          <path d="M20 22C11 22 7 16 7 7c9 0 15 4 15 13" />
          <path d="M20 17c0-8 5-12 13-12 0 8-4 14-13 14" />
          <path d="m11 12 9 9m10-11-9 9" />
        </svg>
      );
    case "heart":
      return (
        <svg {...sharedProps}>
          <path d="M20 33 7.5 21C-1 12.5 10 3 20 12c10-9 21 .5 12.5 9L20 33Z" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...sharedProps}>
          <path d="M8 9h24l5 8-17 18L3 17l5-8Z" />
          <path d="m3 17 34 0M15 9l5 8 5-8m-5 8v18" />
        </svg>
      );
    case "star":
      return (
        <svg {...sharedProps}>
          <path d="M20 3v34M3 20h34M8 8l24 24M32 8 8 32" />
          <path d="m20 9 2.2 8.8L31 20l-8.8 2.2L20 31l-2.2-8.8L9 20l8.8-2.2L20 9Z" />
        </svg>
      );
  }
}

/**
 * Four principles that express the values behind AURJA jewelry.
 */
export function ValuesSection() {
  const { values } = home;

  return (
    <section
      id="philosophy"
      className="home-values relative isolate scroll-mt-24 overflow-hidden text-[#fbf2e8]"
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 760"
      >
        <defs>
          <linearGradient id="aurja-values-sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#f1c99f" />
            <stop offset="44%" stopColor="#d99562" />
            <stop offset="100%" stopColor="#a95732" />
          </linearGradient>
          <linearGradient id="aurja-values-hills" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#b76d42" />
            <stop offset="100%" stopColor="#783c23" />
          </linearGradient>
        </defs>
        <rect width="1440" height="760" fill="url(#aurja-values-sky)" />
        <path
          d="M0 278 110 310 235 276 350 305 490 264 620 285 790 237 925 257 1100 187 1220 205 1360 157 1440 172V760H0Z"
          fill="#d29460"
          opacity=".9"
        />
        <path
          d="m0 350 130-37 108 30 134-62 137 25 153-45 117 17 138-70 118 16 122-72 130-32 153 38v602H0Z"
          fill="url(#aurja-values-hills)"
          opacity=".94"
        />
        <path
          d="m0 466 145-38 118 27 146-48 147 36 137-30 170 38 139-52 147 25 123-53 168 41v348H0Z"
          fill="#814326"
          opacity=".96"
        />
      </svg>
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
        <header className="mx-auto max-w-4xl text-center">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#60381f]">
            {values.eyebrow}
          </p>
          <h2 className="mt-4 whitespace-nowrap font-display text-[clamp(1.05rem,5.4vw,3.6rem)] font-normal leading-tight tracking-[-0.045em] text-[#4c2b1a] sm:mt-5">
            {values.title}
          </h2>
          <span
            aria-hidden
            className="mx-auto mt-6 block h-px w-14 bg-[#78482b]/65 sm:mt-7"
          />
          <p className="mt-5 font-display text-sm italic leading-relaxed text-[#60381f]/90 sm:text-lg">
            {values.subtitle}
          </p>
        </header>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-9 sm:mt-16 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-0">
          {values.items.map((item, index) => (
            <article
              key={item.icon}
              className="motion-safe:animate-fade-up flex flex-col items-center text-center"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <span className="text-[#fff0e2]">
                <PrincipleIcon icon={item.icon} />
              </span>
              <h3 className="mt-3 flex min-h-[3.25rem] max-w-[15rem] items-center justify-center font-display text-center text-base font-normal leading-tight text-[#fff5eb] sm:mt-5 sm:min-h-[3.75rem] sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-2 min-h-[6.25rem] max-w-[19rem] text-xs leading-5 text-[#f5e9e2]/85 sm:mt-3 sm:min-h-28 sm:text-[0.93rem] sm:leading-7">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div
          aria-hidden
          className="mx-auto mt-14 flex max-w-2xl items-center gap-4 text-[#f0c7a9] sm:mt-20"
        >
          <span className="h-px flex-1 bg-[#f0c7a9]/35" />
          <span className="text-xl leading-none">✦</span>
          <span className="h-px flex-1 bg-[#f0c7a9]/35" />
        </div>
      </div>
    </section>
  );
}
