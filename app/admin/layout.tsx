import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import "./admin.css";

export const metadata: Metadata = {
  title: "Store Admin — Aurja",
  robots: { index: false, follow: false },
};

const navigation = [
  ["dashboard", "Overview"],
  ["products", "Products"],
  ["categories", "Categories"],
  ["customers", "Customers"],
  ["orders", "Orders"],
  ["inventory", "Inventory"],
  ["discounts", "Discounts"],
] as const;

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const { email } = await requireAdmin();

  return (
    <div data-admin-shell className="aurja-admin min-h-screen bg-[#f7f6f3] text-[#292824]">
      <aside className="admin-sidebar">
        <Link href="/admin" className="font-display text-2xl tracking-[0.12em]">
          AURJA
          <span className="mt-1 block font-sans text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            Store administration
          </span>
        </Link>
        <nav aria-label="Store administration" className="mt-10 space-y-1">
          {navigation.map(([section, label]) => (
            <Link
              key={section}
              href={section === "dashboard" ? "/admin" : `/admin?section=${section}`}
              className="admin-nav-link"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-neutral-200 pt-5">
          <p className="truncate text-xs text-neutral-500">{email}</p>
          <Link href="/" className="mt-3 inline-block text-xs underline underline-offset-4">
            View storefront
          </Link>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
