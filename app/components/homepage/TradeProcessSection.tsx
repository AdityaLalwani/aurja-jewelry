import Link from "next/link";
import { SectionHeading } from "./SectionHeading";

const steps = [
  {
    number: "01",
    title: "Share your brief",
    description:
      "Send design references, specifications, quantities and your requested timeline.",
  },
  {
    number: "02",
    title: "Review the scope",
    description:
      "Discuss feasibility, materials, sample requirements and the details of your project.",
  },
  {
    number: "03",
    title: "Agree the order",
    description:
      "Confirm specifications, samples, pricing, payment terms and timeline in writing.",
  },
  {
    number: "04",
    title: "Production & dispatch",
    description:
      "Work proceeds against the approved order and agreed shipping terms.",
  },
];

export function TradeProcessSection() {
  return (
    <section className="bg-stone-950 px-5 py-16 text-white sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="How we work"
          title="From your brief to an agreed production plan"
          description="Each project is reviewed individually. Specifications, samples, quantities and timelines are confirmed with you before production."
          align="left"
          tone="inverse"
        />

        <ol className="mt-10 grid gap-8 border-t border-white/15 pt-8 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.number}>
              <span className="text-xs font-medium tracking-[0.2em] text-amber-300">
                {step.number}
              </span>
              <h3 className="mt-4 font-display text-xl text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/request-quote"
            className="inline-flex h-12 items-center justify-center rounded-full bg-amber-100 px-7 text-xs font-medium uppercase tracking-[0.16em] text-stone-900 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100"
          >
            Discuss a requirement
          </Link>
          <Link
            href="/manufacturing-process"
            className="text-xs font-medium uppercase tracking-[0.16em] text-white underline decoration-white/40 underline-offset-4 transition-colors hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100"
          >
            View the full process
          </Link>
        </div>
      </div>
    </section>
  );
}
