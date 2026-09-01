import type { Metadata } from "next";
import Image from "next/image";
import CountdownTimer from "./components/CountdownTimer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.name} — Coming Soon`,
  description: `${site.name} — ${site.tagline}. Our new website is launching soon.`,
};

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(180,120,40,0.28),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(120,80,180,0.14),transparent_55%)]"
      />

      <main className="flex flex-col items-center gap-10 sm:gap-12">
        <Image
          src={site.logo}
          alt="AURJA — company logo"
          width={144}
          height={144}
          priority
          className="h-28 w-28 rounded-3xl object-cover ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:h-36 sm:w-36"
        />

        <div className="flex flex-col items-center gap-4">
          <h1 className="font-display text-4xl font-semibold tracking-[0.35em] text-amber-50 sm:text-6xl">
            {site.name}
          </h1>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-amber-200/70 sm:text-base">
            {site.tagline}
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <p className="text-lg font-medium text-zinc-100 sm:text-xl">
            Something beautiful is coming soon
          </p>
          <CountdownTimer targetDate={site.launchDate} />
        </div>

        <p className="max-w-md text-sm leading-relaxed text-zinc-400">
          Handcrafted jewellery, made to be treasured. Join us at the launch.
        </p>
      </main>

      <footer className="absolute bottom-6 flex items-center gap-2 text-xs text-zinc-500">
        <span>© {new Date().getFullYear()} {site.name}</span>
      </footer>
    </div>
  );
}
