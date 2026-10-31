import type { Metadata } from "next";
import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site, getProfile, allProfileSlugs } from "@/lib/site";
import {
  DownloadIcon,
  GlobeIcon,
  WhatsAppIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
} from "../components/icons";

export function generateStaticParams() {
  return allProfileSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const profile = getProfile(slug);
  if (!profile) return {};

  return {
    title: `${profile.name} — ${profile.designation} | ${site.name}`,
    description: `Connect with ${profile.name}, ${profile.designation} at ${profile.company}. ${profile.bio}`,
  };
}

type Action = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  primary?: boolean;
  internal?: boolean;
  download?: boolean;
};

export default async function BioPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const profile = getProfile(slug);
  if (!profile) notFound();

  const vcardHref = `/api/vcard/${profile.slug}`;

  // Main call-to-action buttons, shown side by side at equal widths.
  const actions: Action[] = [
    {
      label: "Save Contact",
      href: vcardHref,
      icon: DownloadIcon,
      primary: true,
      download: true,
    },
    {
      label: "Visit Site",
      href: "/",
      icon: GlobeIcon,
      internal: true,
    },
  ];

  // Quick contact icons, shown in a single line under the bio.
  const contacts: Action[] = [
    {
      label: "WhatsApp",
      href: `https://wa.me/${profile.whatsapp}`,
      icon: WhatsAppIcon,
    },
    {
      label: "Instagram",
      href: `https://instagram.com/${profile.instagram}`,
      icon: InstagramIcon,
    },
    {
      label: "Email",
      href: `mailto:${profile.email}`,
      icon: MailIcon,
    },
    {
      label: "Location",
      href: profile.mapsUrl,
      icon: MapPinIcon,
    },
  ];

  // Internal links use <Link>; external ones open in a new tab.
  const renderAction = (action: Action, className: string, children: ReactNode) =>
    action.internal ? (
      <Link key={action.label} href={action.href} className={className}>
        {children}
      </Link>
    ) : (
      <a
        key={action.label}
        href={action.href}
        className={className}
        aria-label={action.label}
        target={action.download ? undefined : "_blank"}
        rel="noopener noreferrer"
        download={action.download ? `${profile.slug}.vcf` : undefined}
      >
        {children}
      </a>
    );

  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-chandan px-5 py-12 sm:py-16">
      {/* Ambient background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(180,120,40,0.22),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,rgba(120,80,180,0.10),transparent_55%)]"
      />

      <main className="flex w-full max-w-md flex-col items-center">
        {/* Brand link back to the main site */}
        <Link
          href="/"
          className="group mb-10 flex items-center gap-2.5 rounded-full border border-stone-300 bg-white/60 py-1.5 pl-2 pr-4 text-xs font-medium uppercase tracking-[0.2em] text-stone-700 transition-colors hover:border-amber-700/30 hover:text-stone-900"
        >
          <Image
            src={site.logo}
            alt={`${site.name} logo`}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover ring-1 ring-stone-300"
          />
          {site.name}
        </Link>

        {/* Photo with a soft gold halo */}
        <div className="relative mb-7">
          <div
            aria-hidden
            className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(212,175,105,0.35),transparent_70%)] blur-md"
          />
          {profile.photo ? (
            <Image
              src={profile.photo}
              alt={profile.name}
              width={160}
              height={160}
              priority
              className="relative h-32 w-32 rounded-full object-cover ring-4 ring-amber-700/20"
            />
          ) : (
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-stone-800 to-stone-900 font-display text-4xl font-medium text-amber-100/90 ring-4 ring-amber-700/20">
              {profile.initials}
            </div>
          )}
        </div>

        {/* Name & designation */}
        <h1 className="font-display text-3xl font-semibold tracking-wide text-stone-900 sm:text-4xl">
          {profile.name}
        </h1>
        <p className="mt-2.5 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-800">
          {profile.designation} · {profile.company}
        </p>

        {/* Gold ornament divider */}
        <div aria-hidden className="mt-8 flex w-full items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-700/40" />
          <span className="h-1.5 w-1.5 rotate-45 bg-amber-700/60" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-700/40" />
        </div>

        <p className="mt-8 text-center text-sm leading-relaxed text-stone-600">
          {profile.bio}
        </p>

        {/* Contact icons — WhatsApp, Instagram, Email, Location in one line */}
        <div className="mt-9 flex w-full items-center justify-center gap-4">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return renderAction(
              contact,
              "flex h-12 w-12 items-center justify-center rounded-2xl border border-stone-300 bg-white/55 text-amber-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-700/40 hover:bg-white/80 hover:text-amber-900",
              <Icon className="h-5 w-5" />
            );
          })}
        </div>

        {/* Main actions — frosted-glass buttons, equal width side by side */}
        <div className="mt-10 grid w-full grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return renderAction(
              action,
              action.primary
                ? "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-amber-700/30 bg-amber-100/80 text-sm font-semibold tracking-wide text-stone-900 backdrop-blur-xl shadow-sm transition-all duration-200 hover:border-amber-700/50 hover:bg-amber-100"
                : "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white/60 text-sm font-medium tracking-wide text-stone-800 backdrop-blur-xl shadow-sm transition-all duration-200 hover:border-stone-400 hover:bg-white/80",
              <>
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {action.label}
              </>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-14 flex flex-col items-center gap-1 text-center">
          <span className="text-[0.65rem] uppercase tracking-[0.25em] text-stone-600">
            © {new Date().getFullYear()} {site.name} · {site.tagline}
          </span>
        </footer>
      </main>
    </div>
  );
}
