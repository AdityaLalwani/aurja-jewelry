import type { Metadata } from "next";
import { site } from "@/lib/site";
import { CustomDesignForm } from "./CustomDesignForm";

export const metadata: Metadata = {
  title: `Custom Design | ${site.name}`,
  description: `Share your jewellery idea with ${site.name} and request a custom quote.`,
};

export default function CustomDesignPage() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b border-stone-200 bg-[#f6f0e8]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_0%,rgba(217,164,65,0.2),transparent_35%),linear-gradient(135deg,#faf7f2,#f1e8dc)]"
        />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
          <p className="motion-safe:animate-fade-up text-xs font-medium uppercase tracking-[0.32em] text-amber-700">
            Made personal
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-5xl font-medium leading-[0.92] tracking-[-0.04em] text-stone-900 sm:text-7xl">
            Your idea, shaped by Aurja.
          </h1>
          <div aria-hidden className="mt-8 flex w-36 items-center gap-3">
            <span className="h-px flex-1 bg-amber-700/50" />
            <span className="h-1.5 w-1.5 rotate-45 bg-amber-700" />
          </div>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Share a sketch, reference image or PDF and tell us a little about
            the piece you have in mind. Our team will review your request and
            get in touch with a quote based on your design and specifications.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-700">
            Before you begin
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium text-stone-900 sm:text-4xl">
            Every detail helps.
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-stone-600 sm:text-base">
            <li>Tell us about the style, materials and size you have in mind.</li>
            <li>Upload one reference file (JPG, PNG, WebP or PDF, up to 3 MB).</li>
            <li>
              Your request is not an order. We will confirm the quote and
              details with you before any order is accepted.
            </li>
            <li>
              Please upload only designs or images you have permission to
              share.
            </li>
          </ul>
        </div>
        <div className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-6 shadow-[0_18px_45px_rgba(120,78,24,0.06)] sm:p-8">
          <h2 className="font-display text-2xl font-medium text-stone-900">
            Request a custom quote
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            Share your contact details and design file with our atelier.
          </p>
          <CustomDesignForm />
        </div>
      </section>
    </main>
  );
}
