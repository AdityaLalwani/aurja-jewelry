import Link from "next/link";

const FOOT_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collection", href: "/products" },
  { label: "Cart", href: "/cart" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200/60 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 sm:px-6">
        <div>
          <p className="font-display text-sm tracking-[0.35em] text-neutral-900">
            AURJA
          </p>
          <p className="mt-1 text-center text-[11px] uppercase tracking-[0.2em] text-neutral-400">
            Fine Jewelry
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex items-center gap-6 text-xs font-medium tracking-wide text-neutral-500"
        >
          {FOOT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-gold-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-[11px] uppercase tracking-[0.2em] text-neutral-400">
          © {new Date().getFullYear()} The Aurja Atelier · Crafted with care
        </p>
      </div>
    </footer>
  );
}
