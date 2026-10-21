import Link from "next/link";
import { home } from "@/lib/site";
import { MediaTile } from "./MediaTile";
import { SectionHeading } from "./SectionHeading";
import { ArrowRightIcon } from "../icons";

export function CategoryGrid() {
  const { categories } = home;

  return (
    <section
      id="collection"
      className="home-categories mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"
    >
      <SectionHeading
        eyebrow={categories.eyebrow}
        title={categories.title}
        description={categories.description}
      />

      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-7 sm:mt-14 sm:gap-x-6 sm:gap-y-9 md:grid-cols-3">
        {categories.items.map((category) => (
          <Link
            key={category.slug}
            href={`/products?category=${category.slug}`}
            aria-label={`Shop ${category.name}`}
            className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/60 focus-visible:ring-offset-4"
          >
            <MediaTile
              src={category.image}
              alt={category.name}
              variant={category.variant}
              className="aspect-[5/4] rounded-xl transition-shadow duration-500 group-hover:shadow-[0_12px_30px_rgba(41,37,36,0.10)] sm:aspect-[4/3]"
            />
            <div className="flex items-start justify-between gap-3 border-b border-stone-200/80 py-3 sm:py-4">
              <div>
                <h3 className="font-display text-base font-normal text-stone-800 transition-colors group-hover:text-amber-800 sm:text-lg">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs font-light tracking-wide text-stone-500 sm:text-sm">
                  {category.description}
                </p>
              </div>
              <ArrowRightIcon className="mt-1 h-4 w-4 shrink-0 text-stone-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-amber-700" />
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-12 text-center sm:mt-16">
        <p className="font-display text-lg font-normal text-stone-600 sm:text-xl">
          Can&apos;t decide? Browse the entire edit.
        </p>
        <Link
          href="/products"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-stone-300 px-7 text-xs font-medium uppercase tracking-[0.16em] text-stone-700 transition-colors hover:border-amber-700 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/60"
        >
          Shop all jewellery
        </Link>
      </div>
    </section>
  );
}
