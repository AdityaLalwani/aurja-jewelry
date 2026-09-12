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
 * Values — four cards on a soft stone band explaining what makes AURJA
 * different. The fuller pre-launch successor to the old trust strip.
 */
export function ValuesSection() {
  const { values } = home;

  return (
    <section className="relative overflow-hidden bg-stone-950 text-stone-50">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full border border-amber-300/10 [box-shadow:0_0_0_28px_rgba(217,164,65,0.025),0_0_0_56px_rgba(217,164,65,0.02)]"
      />
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="motion-safe:animate-fade-up self-start lg:sticky lg:top-28">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-300">
              {values.eyebrow}
            </p>
            <h2 className="mt-5 max-w-md font-display text-4xl font-medium leading-[0.95] tracking-[-0.03em] text-stone-50 sm:text-5xl">
              {values.title}
            </h2>
            <div aria-hidden className="mt-8 flex w-32 items-center gap-3">
              <span className="h-px flex-1 bg-amber-300/50" />
              <span className="h-1.5 w-1.5 rotate-45 bg-amber-300" />
            </div>
            <p className="mt-8 max-w-sm text-sm leading-relaxed text-stone-400">
              Thoughtful materials, close relationships and a slower way of
              making. The details are where our difference lives.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border border-stone-700/70 bg-stone-700/70 sm:grid-cols-2">
          {values.items.map((item, index) => {
            const Icon = icons[item.icon];
            return (
              <div
                key={item.icon}
                className={`group motion-safe:animate-fade-up bg-stone-950 p-6 transition-colors duration-500 hover:bg-stone-900 sm:p-8 ${
                  index === 1
                    ? "[animation-delay:120ms]"
                    : index === 2
                      ? "[animation-delay:240ms]"
                      : index === 3
                        ? "[animation-delay:360ms]"
                        : ""
                }`}
              >
                <div className="flex items-start justify-between gap-5">
                  <span className="font-display text-4xl leading-none text-stone-700 transition-colors duration-500 group-hover:text-amber-300/70">
                    {String(values.items.indexOf(item) + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-700 text-amber-300 transition-transform duration-500 group-hover:rotate-12 group-hover:border-amber-300/60">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="mt-12 font-display text-xl font-medium text-stone-100">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-400 transition-colors duration-500 group-hover:text-stone-300">
                  {item.description}
                </p>
                <span
                  aria-hidden
                  className="mt-7 block h-px w-8 bg-amber-300/60 transition-all duration-500 group-hover:w-16"
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
