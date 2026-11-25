import { SearchExperience } from "@/components/SearchExperience";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: false },
};

export default function SearchPage() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-10 sm:px-6">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          Search
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          Find your piece
        </h1>
      </div>

      <SearchExperience />
    </div>
  );
}
