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
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-[#0a0908] px-5 py-12 sm:py-16">
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
          className="group mb-10 flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-2 pr-4 text-xs font-medium uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-amber-200/30 hover:text-amber-100"
        >
          <Image
            src={site.logo}
            alt={`${site.name} logo`}
            width={24}
            height={24}
            className="h-6 w-6 rounded-full object-cover ring-1 ring-white/10"
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
              className="relative h-32 w-32 rounded-full object-cover ring-4 ring-amber-200/20"
            />
          ) : (
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 font-display text-4xl font-medium text-amber-100/90 ring-4 ring-amber-200/20">
              {profile.initials}
            </div>
          )}
        </div>

        {/* Name & designation */}
        <h1 className="font-display text-3xl font-semibold tracking-wide text-amber-50 sm:text-4xl">
          {profile.name}
        </h1>
        <p className="mt-2.5 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-amber-200/80">
          {profile.designation} · {profile.company}
        </p>

        {/* Gold ornament divider */}
        <div aria-hidden className="mt-8 flex w-full items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-200/40" />
          <span className="h-1.5 w-1.5 rotate-45 bg-amber-200/60" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-200/40" />
        </div>

        <p className="mt-8 text-center text-sm leading-relaxed text-zinc-400">
          {profile.bio}
        </p>

        {/* Contact icons — WhatsApp, Instagram, Email, Location in one line */}
        <div className="mt-9 flex w-full items-center justify-center gap-4">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return renderAction(
              contact,
              "flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-amber-200/70 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200/40 hover:bg-white/10 hover:text-amber-200",
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
                ? "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-amber-200/30 bg-gradient-to-r from-amber-200/15 to-amber-400/10 text-sm font-semibold tracking-wide text-amber-50 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-200 hover:border-amber-200/50 hover:from-amber-200/25 hover:to-amber-400/15"
                : "flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 text-sm font-medium tracking-wide text-zinc-100 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:border-white/25 hover:bg-white/15",
              <>
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {action.label}
              </>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-14 flex flex-col items-center gap-1 text-center">
          <span className="text-[0.65rem] uppercase tracking-[0.25em] text-zinc-500">
            © {new Date().getFullYear()} {site.name} · {site.tagline}
          </span>
        </footer>
      </main>
    </div>
  );
}
