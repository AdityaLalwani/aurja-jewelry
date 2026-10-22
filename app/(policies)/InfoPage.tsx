import Link from "next/link";
import type { InformationDocument } from "./content";

export function InfoPage({ document }: { document: InformationDocument }) {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-stone-200 bg-[#f6f0e8]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_0%,rgba(217,164,65,0.2),transparent_35%),linear-gradient(135deg,#faf7f2,#f1e8dc)]"
        />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
          <p className="motion-safe:animate-fade-up text-xs font-medium uppercase tracking-[0.32em] text-amber-700">
            {document.eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl motion-safe:animate-fade-up [animation-delay:120ms] font-display text-5xl font-medium leading-[0.92] tracking-[-0.04em] text-stone-900 sm:text-7xl">
            {document.title}
          </h1>
          <div aria-hidden className="mt-8 flex w-36 items-center gap-3">
            <span className="h-px flex-1 bg-amber-700/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-amber-700" />
          </div>
          <p className="mt-8 max-w-3xl text-base leading-relaxed text-stone-600 sm:text-lg">
            {document.intro}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        {document.sections ? (
          <div className="space-y-10">
            {document.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-2xl font-medium text-stone-900 sm:text-3xl">
                  {section.heading}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 text-sm leading-7 text-stone-600 sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.bullets ? (
                  <ul className="mt-4 space-y-3 pl-5 text-sm leading-7 text-stone-600 marker:text-amber-700 sm:text-base">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="list-disc">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        ) : null}

        {document.questions ? (
          <div className="divide-y divide-stone-200 border-y border-stone-200">
            {document.questions.map(({ question, answer }) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-medium text-stone-900 marker:content-none sm:text-xl">
                  {question}
                  <span
                    aria-hidden
                    className="text-xl text-amber-700 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        ) : null}

        {document.action ? (
          <div className="mt-14 border-t border-stone-200 pt-8">
            <p className="text-sm leading-relaxed text-stone-600">
              {document.action.description}
            </p>
            <Link
              href={document.action.href}
              className="mt-5 inline-flex items-center border-b border-amber-700 pb-2 text-sm font-medium uppercase tracking-[0.16em] text-stone-900 transition-colors hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
            >
              {document.action.label}
              <span aria-hidden className="ml-3 text-amber-700">
                →
              </span>
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
