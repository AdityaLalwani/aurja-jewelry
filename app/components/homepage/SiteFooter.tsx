import Image from "next/image";
import Link from "next/link";
import { CurrencySelector } from "@/components/CurrencySelector";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { site, home } from "@/lib/site";
import { InstagramIcon, MailIcon, WhatsAppIcon } from "../icons";

/** Social links live here (not in config) so lib/site.ts stays serializable. */
const socials = [
  {
    label: `${site.name} on Instagram`,
    href: `https://instagram.com/${site.instagram}`,
    Icon: InstagramIcon,
    external: true,
  },
  {
    label: "WhatsApp us",
    href: `https://wa.me/${site.contact.whatsapp}`,
    Icon: WhatsAppIcon,
    external: true,
  },
  {
    label: "Email us",
    href: `mailto:${site.contact.email}`,
    Icon: MailIcon,
    external: false,
  },
];

/**
 * Site footer — charcoal ground with the brand row, link columns, and a
 * slim bottom bar. The year is prerendered at
 * build time, matching the bio page's pattern.
 */
export function SiteFooter() {
  const { footer } = home;
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#120f0d] text-stone-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,197,130,0.16),transparent_38%)]" />

      <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <div className="rounded-[30px] border border-white/10 bg-[#1b1714]/90 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-sm sm:p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <Link
                href="/"
                className="inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
                aria-label={`${site.name} — home`}
              >
                <Image
                  src={site.logo}
                  alt=""
                  width={58}
                  height={58}
                  className="h-[58px] w-[58px] rounded-full object-cover ring-1 ring-amber-200/20 shadow-[0_8px_30px_rgba(218,165,32,0.2)]"
                />
                <span className="font-display text-2xl font-medium tracking-[0.35em] text-amber-50">
                  {site.name}
                </span>
              </Link>
              <p className="mt-4 max-w-md text-sm leading-6 text-stone-300/90">
                {site.tagline}
              </p>
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link
                href="/custom-design"
                className="inline-flex items-center rounded-full border border-amber-300/40 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-amber-50 transition-all duration-200 hover:border-amber-200/60 hover:bg-amber-300/15 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
              >
                Custom Design
              </Link>

              <div className="flex items-center gap-3">
                {socials.map(({ label, href, Icon, external }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 transition-all duration-200 hover:border-amber-200/50 hover:bg-amber-300/10 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div aria-hidden className="my-8 h-px bg-gradient-to-r from-transparent via-amber-200/30 to-transparent" />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {footer.linkColumns.map((column) => (
              <div key={column.heading}>
                <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.28em] text-amber-100/80">
                  {column.heading}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-stone-400 transition-colors duration-200 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-full border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-stone-400 sm:flex-row sm:px-6">
          <p>
            © {year} {site.name} · {site.tagline}
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <CurrencySelector />
            <CookieSettingsButton />
            <p className="uppercase tracking-[0.22em] text-amber-100/75">
              Crafted in India
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
