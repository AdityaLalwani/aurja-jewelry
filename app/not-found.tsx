import Link from "next/link";
import { SiteFooter } from "./components/homepage/SiteFooter";

export default function NotFound() {
  return (
    <>
      <main className="flex flex-1 items-center justify-center bg-chandan px-5 py-24 text-center">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-amber-700">
            404 · Page not found
          </p>
          <h1 className="mt-5 font-display text-4xl font-medium leading-tight text-stone-900 sm:text-6xl">
            This page has wandered off.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-stone-600 sm:text-base">
            The page may have moved or the link may be incorrect. Find your way
            back to the AURJA collection.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex rounded-full bg-stone-900 px-7 py-3 text-xs font-medium uppercase tracking-[0.18em] text-amber-50 transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2"
          >
            Explore the collection
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
