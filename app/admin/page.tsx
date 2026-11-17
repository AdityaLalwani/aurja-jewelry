import Link from "next/link";
import {
  archiveCategoryAction,
  archiveDiscountAction,
  archiveProductAction,
  saveCategoryAction,
  saveCustomerAction,
  saveDiscountAction,
  saveProductAction,
  updateInventoryAction,
  updateOrderStatusAction,
} from "@/app/admin/actions";
import {
  getAdminCategories,
  getAdminCustomers,
  getAdminDashboard,
  getAdminDiscounts,
  getAdminOrders,
  getAdminProducts,
} from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin-auth";
import type { StoreRecord } from "@/lib/store-db";

type AdminPageProps = {
  searchParams: Promise<{ section?: string; q?: string }>;
};

const sections = [
  "dashboard",
  "products",
  "categories",
  "customers",
  "orders",
  "inventory",
  "discounts",
] as const;

type Section = (typeof sections)[number];

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#9b7541]";
const labelClass =
  "mb-1 block text-[11px] font-medium uppercase tracking-[0.12em] text-stone-500";
const buttonClass =
  "rounded-lg bg-[#661514] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4b1010]";

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function jsonText(value: unknown, fallback: string): string {
  return JSON.stringify(value ?? JSON.parse(fallback), null, 2);
}

function imageUrls(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((image) => {
      if (!image || typeof image !== "object") return "";
      const file = "file" in image ? image.file : undefined;
      return file && typeof file === "object" && "url" in file
        ? text(file.url)
        : "";
    })
    .filter(Boolean)
    .join("\n");
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        className={inputClass}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
      />
    </label>
  );
}

function TextArea({
  name,
  label,
  defaultValue,
  rows = 4,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <textarea
        className={`${inputClass} font-mono text-xs`}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
      />
    </label>
  );
}

function Checkbox({
  name,
  label,
  checked,
}: {
  name: string;
  label: string;
  checked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-stone-700">
      <input type="checkbox" name={name} defaultChecked={checked} />
      {label}
    </label>
  );
}

function SearchBox({
  value,
  section,
}: {
  value: string;
  section: "customers" | "orders" | "products" | "discounts";
}) {
  return (
    <form className="flex w-full max-w-sm gap-2" action="/admin">
      <input type="hidden" name="section" value={section} />
      <input
        className={inputClass}
        name="q"
        defaultValue={value}
        placeholder="Search records"
        aria-label="Search records"
      />
      <button className="rounded-lg border border-stone-300 bg-white px-4 text-sm">
        Search
      </button>
    </form>
  );
}

function ProductEditor({
  record,
  categories,
}: {
  record?: StoreRecord;
  categories: Array<Record<string, unknown> & { id: string }>;
}) {
  const product = record?.payload ?? {};
  const options = Array.isArray(product.options) ? product.options : [];
  return (
    <details className="rounded-xl border border-stone-200 bg-white">
      <summary className="cursor-pointer list-none p-4 text-sm font-medium">
        {record ? `Edit ${text(product.name) || record.swell_id}` : "＋ Add product"}
      </summary>
      <form action={saveProductAction} className="grid gap-4 border-t border-stone-100 p-4 md:grid-cols-2">
        <input type="hidden" name="id" value={record?.swell_id ?? ""} />
        <Field name="name" label="Product name" defaultValue={text(product.name)} required />
        <Field name="slug" label="URL slug" defaultValue={text(product.slug)} required />
        <Field name="sku" label="SKU" defaultValue={text(product.sku)} />
        <Field name="price" label="Price (USD)" type="number" defaultValue={text(product.price)} />
        <Field name="price_inr" label="Price (INR)" type="number" defaultValue={text(product.price_inr)} />
        <Field name="stock_level" label="Stock" type="number" defaultValue={text(product.stock_level || 0)} />
        <label className="block">
          <span className={labelClass}>Category</span>
          <select className={inputClass} name="category_id" defaultValue={text(product.category_id)}>
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{text(category.name)}</option>
            ))}
          </select>
        </label>
        <TextArea name="description" label="Description" defaultValue={text(product.description)} rows={3} />
        <TextArea name="images" label="Image URLs (one per line)" defaultValue={imageUrls(product.images)} rows={3} />
        <TextArea name="attributes" label="Attributes JSON" defaultValue={jsonText(product.attributes, "{}")} rows={5} />
        <TextArea name="content" label="Content JSON" defaultValue={jsonText(product.content, "{}")} rows={5} />
        <TextArea name="options" label="Options JSON" defaultValue={jsonText(options, "[]")} rows={5} />
        <div className="flex items-end justify-between gap-3 md:col-span-2">
          <Checkbox name="active" label="Published on storefront" checked={product.active !== false} />
          <button className={buttonClass}>Save product</button>
        </div>
      </form>
      {record ? (
        <form action={archiveProductAction} className="border-t border-stone-100 px-4 py-3">
          <input type="hidden" name="id" value={record.swell_id} />
          <button className="text-xs text-red-700 underline underline-offset-4">Archive product</button>
        </form>
      ) : null}
    </details>
  );
}

function CategoryEditor({
  category,
  categories,
}: {
  category?: Record<string, unknown> & { id: string };
  categories: Array<Record<string, unknown> & { id: string }>;
}) {
  return (
    <details className="rounded-xl border border-stone-200 bg-white">
      <summary className="cursor-pointer list-none p-4 text-sm font-medium">
        {category ? `Edit ${text(category.name)}` : "＋ Add category"}
      </summary>
      <form action={saveCategoryAction} className="grid gap-4 border-t border-stone-100 p-4 md:grid-cols-2">
        <input type="hidden" name="id" value={category?.id ?? ""} />
        <Field name="name" label="Name" defaultValue={text(category?.name)} required />
        <Field name="slug" label="Slug" defaultValue={text(category?.slug)} required />
        <label className="block">
          <span className={labelClass}>Parent category</span>
          <select className={inputClass} name="parent_id" defaultValue={text(category?.parent_id)}>
            <option value="">None</option>
            {categories.filter((item) => item.id !== category?.id).map((item) => (
              <option key={item.id} value={item.id}>{text(item.name)}</option>
            ))}
          </select>
        </label>
        <Field name="meta_title" label="SEO title" defaultValue={text(category?.meta_title)} />
        <TextArea name="description" label="Description" defaultValue={text(category?.description)} rows={3} />
        <TextArea name="meta_description" label="SEO description" defaultValue={text(category?.meta_description)} rows={3} />
        <Field name="meta_keywords" label="SEO keywords" defaultValue={text(category?.meta_keywords)} />
        <div className="flex items-end justify-between gap-3 md:col-span-2">
          <Checkbox name="active" label="Active" checked={category?.active !== false} />
          <button className={buttonClass}>Save category</button>
        </div>
      </form>
      {category ? (
        <form action={archiveCategoryAction} className="border-t border-stone-100 px-4 py-3">
          <input type="hidden" name="id" value={category.id} />
          <button className="text-xs text-red-700 underline underline-offset-4">Archive category</button>
        </form>
      ) : null}
    </details>
  );
}

function CustomerCard({
  customer,
}: {
  customer: Awaited<ReturnType<typeof getAdminCustomers>>[number];
}) {
  const account = customer.payload;
  const addresses = Array.isArray(account.addresses) ? account.addresses : [];
  const cart = Array.isArray(customer.cart) ? customer.cart : [];
  const wishlist = Array.isArray(customer.wishlist) ? customer.wishlist : [];
  const orders = Array.isArray(customer.orders) ? customer.orders : [];
  return (
    <details className="rounded-xl border border-stone-200 bg-white">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4">
        <span>
          <strong className="block text-sm">{text(account.name) || `${text(account.first_name)} ${text(account.last_name)}` || "Customer"}</strong>
          <span className="text-xs text-stone-500">{text(account.email)} · {text(account.phone)}</span>
        </span>
        <span className="text-xs text-stone-500">Addresses {addresses.length} · Orders {orders.length} · Cart {cart.length} · Wishlist {wishlist.length}</span>
      </summary>
      <form action={saveCustomerAction} className="grid gap-4 border-t border-stone-100 p-4 md:grid-cols-2">
        <input type="hidden" name="id" value={customer.id} />
        <Field name="name" label="Full name" defaultValue={text(account.name)} required />
        <Field name="email" label="Email" type="email" defaultValue={text(account.email)} required />
        <Field name="first_name" label="First name" defaultValue={text(account.first_name)} />
        <Field name="last_name" label="Last name" defaultValue={text(account.last_name)} />
        <Field name="phone" label="Phone" defaultValue={text(account.phone)} />
        <TextArea name="addresses" label="Saved addresses JSON" defaultValue={jsonText(account.addresses, "[]")} rows={5} />
        <div className="md:col-span-2">
          <button className={buttonClass}>Save customer</button>
        </div>
      </form>
      <div className="grid gap-4 border-t border-stone-100 p-4 md:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider">Saved cart</h3>
          <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-stone-50 p-3 text-[11px]">{jsonText(cart, "[]")}</pre>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider">Wishlist slugs</h3>
          <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-stone-50 p-3 text-[11px]">{jsonText(wishlist, "[]")}</pre>
        </div>
        <div className="md:col-span-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider">Orders and order enquiries</h3>
          <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-stone-50 p-3 text-[11px]">{jsonText(orders, "[]")}</pre>
        </div>
      </div>
    </details>
  );
}

function OrderCard({ record }: { record: StoreRecord }) {
  const order = record.payload;
  const status = text(order.status) || "pending";
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4">
      <div>
        <p className="text-sm font-semibold">{text(order.number ?? order.order_number) || record.swell_id}</p>
        <p className="mt-1 text-xs text-stone-500">
          {text(order.email ?? order.account_id)} · {text(order.currency) || "INR"} {text(order.grand_total ?? order.total)}
        </p>
      </div>
      <form action={updateOrderStatusAction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={record.swell_id} />
        <select className={inputClass} name="status" defaultValue={status}>
          {["pending", "processing", "fulfilled", "canceled", "refunded"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <button className={buttonClass}>Update</button>
      </form>
    </div>
  );
}

function DiscountEditor({ record }: { record?: StoreRecord }) {
  const discount = record?.payload ?? {};
  return (
    <details className="rounded-xl border border-stone-200 bg-white">
      <summary className="cursor-pointer list-none p-4 text-sm font-medium">
        {record ? `Edit ${text(discount.code) || record.swell_id}` : "＋ Add discount"}
      </summary>
      <form action={saveDiscountAction} className="grid gap-4 border-t border-stone-100 p-4 md:grid-cols-2">
        <input type="hidden" name="id" value={record?.swell_id ?? ""} />
        <Field name="code" label="Code" defaultValue={text(discount.code)} required />
        <Field name="name" label="Name" defaultValue={text(discount.name)} required />
        <label className="block">
          <span className={labelClass}>Type</span>
          <select className={inputClass} name="type" defaultValue={text(discount.type) || "percent"}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed amount</option>
          </select>
        </label>
        <Field name="value" label="Value" type="number" defaultValue={text(discount.value)} required />
        <div className="flex items-end justify-between gap-3 md:col-span-2">
          <Checkbox name="active" label="Active" checked={discount.active !== false} />
          <button className={buttonClass}>Save discount</button>
        </div>
      </form>
      {record && discount.active !== false ? (
        <form action={archiveDiscountAction} className="border-t border-stone-100 px-4 py-3">
          <input type="hidden" name="id" value={record.swell_id} />
          <button className="text-xs text-red-700 underline underline-offset-4">Deactivate discount</button>
        </form>
      ) : null}
    </details>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();
  const { section: requestedSection, q = "" } = await searchParams;
  const section: Section = sections.includes(requestedSection as Section)
    ? (requestedSection as Section)
    : "dashboard";

  if (section === "dashboard") {
    const stats = await getAdminDashboard();
    const cards = [
      ["Products", stats.products, "products"],
      ["Categories", stats.categories, "categories"],
      ["Customers", stats.customers, "customers"],
      ["Orders", stats.orders, "orders"],
      ["Active discounts", stats.discounts, "discounts"],
      ["Low stock (≤ 5)", stats.lowStock, "inventory"],
    ];
    return (
      <section>
        <p className="text-xs uppercase tracking-[0.22em] text-[#8d6a3d]">Store overview</p>
        <h1 className="mt-2 font-display text-4xl">Good day</h1>
        <p className="mt-2 text-sm text-stone-500">Manage the catalog and customer records stored in Neon.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(([label, count, target]) => (
            <Link key={label} href={`/admin?section=${target}`} className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-[#c39655]">
              <span className="text-xs uppercase tracking-wider text-stone-500">{label}</span>
              <strong className="mt-3 block font-display text-3xl">{count}</strong>
            </Link>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          Swell order and coupon history can be imported when an export is available. The storefront records quote/order enquiries (not paid orders); carts and wishlists are saved to Neon for signed-in customers.
        </div>
      </section>
    );
  }

  const title = section[0].toUpperCase() + section.slice(1);
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#8d6a3d]">Store management</p>
          <h1 className="mt-2 font-display text-4xl">{title}</h1>
        </div>
        {(section === "customers" || section === "orders" || section === "products" || section === "discounts") ? <SearchBox value={q} section={section} /> : null}
      </div>

      {section === "products" || section === "inventory" ? (
        <ProductsSection section={section} search={q} />
      ) : null}
      {section === "categories" ? <CategoriesSection /> : null}
      {section === "customers" ? <CustomersSection search={q} /> : null}
      {section === "orders" ? <OrdersSection search={q} /> : null}
      {section === "discounts" ? <DiscountsSection search={q} /> : null}
    </section>
  );
}

async function ProductsSection({
  section,
  search,
}: {
  section: "products" | "inventory";
  search: string;
}) {
  const records = await getAdminProducts(search);
  const categories = await getAdminCategories();
  if (section === "inventory") {
    return (
      <div className="mt-7 space-y-3">
        {records.map((record) => (
          <form key={record.swell_id} action={updateInventoryAction} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4">
            <input type="hidden" name="id" value={record.swell_id} />
            <div>
              <p className="text-sm font-semibold">{text(record.payload.name)}</p>
              <p className="mt-1 text-xs text-stone-500">{text(record.payload.sku)} · {text(record.payload.slug)}</p>
            </div>
            <div className="flex items-end gap-3">
              <Field name="stock_level" label="On hand" type="number" defaultValue={text(record.payload.stock_level || 0)} />
              <button className={buttonClass}>Save stock</button>
            </div>
          </form>
        ))}
        {records.length === 0 ? <EmptyState>No products yet. Add a product before tracking inventory.</EmptyState> : null}
      </div>
    );
  }
  return (
    <div className="mt-7 space-y-3">
      <ProductEditor categories={categories} />
      {records.map((record) => <ProductEditor key={record.swell_id} record={record} categories={categories} />)}
      {records.length === 0 ? <EmptyState>There are no products in Neon yet. You can create them here or import a Swell export.</EmptyState> : null}
    </div>
  );
}

async function CategoriesSection() {
  const categories = await getAdminCategories();
  return (
    <div className="mt-7 space-y-3">
      <CategoryEditor categories={categories} />
      {categories.map((category) => (
        <CategoryEditor key={category.id} category={category} categories={categories} />
      ))}
      {categories.length === 0 ? <EmptyState>No categories in Neon yet.</EmptyState> : null}
    </div>
  );
}

async function CustomersSection({ search }: { search: string }) {
  const customers = await getAdminCustomers(search);
  return (
    <div className="mt-7 space-y-3">
      {customers.map((customer) => <CustomerCard key={customer.id} customer={customer} />)}
      {customers.length === 0 ? <EmptyState>No customer records matched. Customers appear after sign-in or a Swell import.</EmptyState> : null}
    </div>
  );
}

async function OrdersSection({ search }: { search: string }) {
  const orders = await getAdminOrders(search);
  return (
    <div className="mt-7 space-y-3">
      {orders.map((record) => <OrderCard key={record.swell_id} record={record} />)}
      {orders.length === 0 ? <EmptyState>No orders are stored yet. Import Swell order records when an export is available.</EmptyState> : null}
    </div>
  );
}

async function DiscountsSection({ search }: { search: string }) {
  const discounts = await getAdminDiscounts(search);
  return (
    <div className="mt-7 space-y-3">
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
        Discount codes are stored for management and migration; the current
        enquiry-only storefront does not apply discounts at checkout.
      </p>
      <DiscountEditor />
      {discounts.map((record) => <DiscountEditor key={record.swell_id} record={record} />)}
      {discounts.length === 0 ? <EmptyState>No discounts in Neon yet.</EmptyState> : null}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed border-stone-300 bg-white/70 p-8 text-center text-sm text-stone-500">{children}</div>;
}
