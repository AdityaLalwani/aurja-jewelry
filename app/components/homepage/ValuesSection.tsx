import { home, type ValueConfig } from "@/lib/site";
import {
  DiamondIcon,
  ShieldIcon,
  SparklesIcon,
  TruckIcon,
} from "../icons";

/** Config keys map to imported icons here — never inside lib/site.ts. */
const icons: Record<ValueConfig["icon"], typeof ShieldIcon> = {
  shield: ShieldIcon,
  diamond: DiamondIcon,
  truck: TruckIcon,
  sparkles: SparklesIcon,
};

/**
 * Four cards that express the principles behind AURJA jewelry.
 */
export function ValuesSection() {
  const { values } = home;

  return (
    <section
      id="philosophy"
      className="home-values relative scroll-mt-24 overflow-hidden bg-chandan text-stone-900"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full border border-amber-700/10 [box-shadow:0_0_0_28px_rgba(217,164,65,0.025),0_0_0_56px_rgba(217,164,65,0.02)]"
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-24">
        <div className="grid gap-6 sm:gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="motion-safe:animate-fade-up self-start lg:sticky lg:top-28">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-700">
              {values.eyebrow}
            </p>
            <h2 className="mt-3 max-w-md font-display text-3xl font-medium leading-[0.95] tracking-[-0.03em] text-stone-900 sm:mt-5 sm:text-5xl">
              {values.title}
            </h2>
            <div aria-hidden className="mt-5 flex w-32 items-center gap-3 sm:mt-8">
              <span className="h-px flex-1 bg-amber-700/50" />
              <span className="h-1.5 w-1.5 rotate-45 bg-amber-700" />
            </div>
            <p className="mt-5 max-w-sm text-xs leading-relaxed text-stone-600 sm:mt-8 sm:text-sm">
              We believe jewelry should feel personal, be made with care, and
              stay meaningful long after the moment it marks.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden border border-stone-200 bg-stone-200">
            {values.items.map((item, index) => {
              const Icon = icons[item.icon];
              return (
                <div
                  key={item.icon}
                  className={`group motion-safe:animate-fade-up bg-white/80 p-4 transition-colors duration-500 hover:bg-white sm:p-8 ${
                    index === 1
                      ? "[animation-delay:120ms]"
                      : index === 2
                        ? "[animation-delay:240ms]"
                        : index === 3
                          ? "[animation-delay:360ms]"
                          : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-5">
                    <span className="font-display text-3xl leading-none text-stone-300 transition-colors duration-500 group-hover:text-amber-700/70 sm:text-4xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-300 text-amber-700 transition-transform duration-500 group-hover:rotate-12 group-hover:border-amber-700/60 sm:h-10 sm:w-10">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-base font-medium leading-tight text-stone-900 sm:mt-12 sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-snug text-stone-600 transition-colors duration-500 group-hover:text-stone-700 sm:mt-3 sm:text-sm sm:leading-relaxed">
                    {item.description}
                  </p>
                  <span
                    aria-hidden
                    className="mt-4 block h-px w-8 bg-amber-700/60 transition-all duration-500 group-hover:w-16 sm:mt-7"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
