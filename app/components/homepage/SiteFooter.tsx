import Image from "next/image";
import Link from "next/link";
import { site, home } from "@/lib/site";
import { InstagramIcon, MailIcon, WhatsAppIcon } from "../icons";
import { LaunchSignup } from "./LaunchSignup";

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
 * Site footer — charcoal ground with the brand row, two link columns plus
 * the launch signup, and a slim bottom bar. The year is prerendered at
 * build time, matching the bio page's pattern.
 */
export function SiteFooter() {
  const { footer, launch } = home;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-950 text-stone-300">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        {/* Brand row */}
        <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
              aria-label={`${site.name} — home`}
            >
              <Image
                src={site.logo}
                alt=""
                width={52}
                height={52}
                className="h-[52px] w-[52px] rounded-full object-cover ring-1 ring-white/10"
              />
              <span className="font-display text-xl font-medium tracking-[0.35em] text-amber-50">
                {site.name}
              </span>
            </Link>
            <p className="mt-3 text-sm text-stone-400">{site.tagline}</p>
          </div>

          <div className="flex items-center gap-3">
            {socials.map(({ label, href, Icon, external }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-stone-400 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div aria-hidden className="mt-10 h-px bg-gradient-to-r from-transparent via-amber-200/30 to-transparent" />

        {/* Link columns + launch signup */}
        <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {footer.linkColumns.map((column) => (
            <div key={column.heading}>
              <h3 className="text-xs font-medium uppercase tracking-[0.25em] text-amber-200/70">
                {column.heading}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-stone-400 transition-colors hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Launch signup */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.25em] text-amber-200/70">
              {launch.eyebrow}
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-stone-400">
              {launch.description}
            </p>
            <div className="mt-5">
              <LaunchSignup variant="footer" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 text-xs text-stone-500 sm:flex-row">
          <p>
            © {year} {site.name} · {site.tagline}
          </p>
          <p className="uppercase tracking-[0.2em]">Crafted in India</p>
        </div>
      </div>
    </footer>
  );
}
