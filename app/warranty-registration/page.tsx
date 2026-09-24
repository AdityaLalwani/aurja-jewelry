import type { Metadata } from "next";
import { SiteFooter } from "../components/homepage/SiteFooter";
import { SiteHeader } from "../components/homepage/SiteHeader";
import { WarrantyEmbed } from "./WarrantyEmbed";

export const metadata: Metadata = {
  title: "Warranty Registration — AURJA",
  description:
    "Register your AURJA jewellery warranty and keep your piece protected.",
};

export default function WarrantyRegistrationPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-stone-200 bg-[#f4eee5]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(217,164,65,0.2),transparent_32%),linear-gradient(135deg,#faf7f2,#f1e8dc)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full border border-amber-700/15 [box-shadow:0_0_0_20px_rgba(217,164,65,0.035),0_0_0_40px_rgba(217,164,65,0.025)]"
          />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.7fr_1fr] lg:items-center lg:gap-20">
            <div className="motion-safe:animate-fade-up">
              <p className="text-[0.68rem] font-medium uppercase tracking-[0.32em] text-amber-700">
                A little peace of mind
              </p>
              <h1 className="mt-5 max-w-xl font-display text-5xl font-medium leading-[0.95] tracking-[-0.04em] text-stone-900 sm:text-7xl">
                Register your warranty.
              </h1>
              <div aria-hidden className="mt-8 flex w-36 items-center gap-3">
                <span className="h-px flex-1 bg-amber-700/50" />
                <span className="h-1.5 w-1.5 rotate-45 bg-amber-700" />
              </div>
              <p className="mt-8 max-w-md text-base leading-relaxed text-stone-600 sm:text-lg">
                Tell us about your AURJA piece so we can keep its details on
                record and support you long after it becomes part of your
                story.
              </p>
            </div>

            <div className="motion-safe:animate-fade-up [animation-delay:160ms] lg:justify-self-end">
              <div className="max-w-lg border-y border-stone-300/80 py-9 sm:py-12">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500">
                  Warranty registration
                </p>
                <h2 className="mt-4 font-display text-3xl font-medium text-stone-900 sm:text-4xl">
                  Keep your piece protected.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
                  Activate your warranty in a few simple steps. Have your
                  purchase details nearby before you begin.
                </p>
                <WarrantyEmbed />
                <p className="mt-5 text-xs leading-relaxed text-stone-500">
                  Your information is used to maintain your warranty record and
                  provide product support.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
