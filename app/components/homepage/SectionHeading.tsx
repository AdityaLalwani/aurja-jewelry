type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** Left-aligned for split sections; centered (default) for stacked ones. */
  align?: "left" | "center";
};

/**
 * Shared section heading — gold eyebrow, serif title, ornament divider.
 * Copy comes from lib/site.ts so sections stay consistent.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-2xl font-medium text-stone-900 sm:text-4xl">
        {title}
      </h2>
      <div
        aria-hidden
        className={`mt-5 flex items-center gap-3 ${
          centered ? "mx-auto w-full max-w-xs" : "w-28"
        }`}
      >
        <span className="h-px flex-1 bg-stone-300" />
        <span className="h-1.5 w-1.5 rotate-45 bg-amber-600" />
        <span className="h-px flex-1 bg-stone-300" />
      </div>
      {description ? (
        <p
          className={`mt-5 text-sm leading-relaxed text-stone-500 ${
            centered ? "mx-auto max-w-xl" : ""
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
