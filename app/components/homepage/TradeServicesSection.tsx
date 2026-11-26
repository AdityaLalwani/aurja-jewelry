import Link from "next/link";
import { ArrowRightIcon } from "../icons";
import { SectionHeading } from "./SectionHeading";

const services = [
  {
    number: "01",
    title: "Wholesale",
    description:
      "Jewellery supply for jewellers, showrooms and established brands.",
    href: "/wholesale",
  },
  {
    number: "02",
    title: "OEM manufacturing",
    description:
      "Develop and produce jewellery around your designs and specifications.",
    href: "/manufacturing",
  },
  {
    number: "03",
    title: "Private label",
    description:
      "Explore jewellery development under your own brand, scoped to your brief.",
    href: "/private-label",
  },
  {
    number: "04",
    title: "Export",
    description:
      "Discuss destination, shipping and order terms with our trade team.",
    href: "/export",
  },
];

export function TradeServicesSection() {
  return (
    <section
      id="trade-services"
      className="border-y border-stone-200 bg-white px-5 py-16 sm:px-8 sm:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Trade services"
          title="A manufacturing partner for your next collection"
          description="From wholesale sourcing to private-label and OEM projects, discuss a jewellery requirement shaped around your business."
        />

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group flex min-h-56 flex-col border border-stone-200 bg-cream/50 p-6 transition-colors hover:border-amber-700/50 hover:bg-amber-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/60"
            >
              <span className="text-xs font-medium tracking-[0.2em] text-amber-700">
                {service.number}
              </span>
              <h3 className="mt-7 font-display text-xl text-stone-900">
                {service.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">
                {service.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-800">
                Explore service
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
