"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { queryNeon } from "@/lib/neon-db";
import {
  getStoreRecord,
  saveStoreRecord,
  updateAccount,
} from "@/lib/store-db";

function readText(formData: FormData, key: string, maxLength = 5000): string {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (text.length > maxLength) throw new Error(`${key} is too long.`);
  return text;
}

function readJson(formData: FormData, key: string): Record<string, unknown> {
  const text = readText(formData, key, 20_000);
  if (!text) return {};
  const parsed: unknown = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${key} must be a JSON object.`);
  }
  return parsed as Record<string, unknown>;
}

function readBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function readAmount(formData: FormData, key: string): number {
  const value = Number(readText(formData, key, 40));
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${key} must be a non-negative number.`);
  }
  return value;
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function imageUrlLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => {
      if (url.startsWith("/") && !url.startsWith("//")) return url;
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        throw new Error("Image URLs must be HTTPS URLs or site-relative paths.");
      }
      if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
        throw new Error("Image URLs must use HTTPS.");
      }
      return url;
    });
}

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidatePath("/search");
  revalidatePath("/wishlist");
  revalidatePath("/sitemap.xml");
}

export async function saveProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id", 100) || randomUUID();
  const name = readText(formData, "name", 160);
  const slug = slugify(readText(formData, "slug", 200) || name);
  if (!name || !slug) throw new Error("Product name and slug are required.");

  const categoryId = readText(formData, "category_id", 100);
  const existing = await getStoreRecord("swell_products", id);
  const product = {
    ...(existing?.payload ?? {}),
    id,
    name,
    slug,
    sku: readText(formData, "sku", 120) || undefined,
    description: readText(formData, "description", 10_000) || undefined,
    price: readAmount(formData, "price"),
    price_inr: readAmount(formData, "price_inr"),
    stock_level: Math.floor(readAmount(formData, "stock_level")),
    active: readBoolean(formData, "active"),
    category_id: categoryId || undefined,
    categories: categoryId ? [categoryId] : [],
    images: imageUrlLines(readText(formData, "images", 10_000)).map((url) => ({
      file: { url },
    })),
    attributes: readJson(formData, "attributes"),
    content: readJson(formData, "content"),
    options: JSON.parse(readText(formData, "options", 20_000) || "[]"),
    date_updated: new Date().toISOString(),
  };
  if (!Array.isArray(product.options)) {
    throw new Error("Product options must be a JSON array.");
  }
  const duplicate = await queryNeon<{ swell_id: string }>(
    "SELECT swell_id FROM swell_products WHERE payload ->> 'slug' = $1 AND swell_id <> $2 LIMIT 1",
    [slug, id],
  );
  if (duplicate.length > 0) throw new Error("That product slug is already in use.");

  await saveStoreRecord("swell_products", id, product);
  revalidateAdmin();
  redirect("/admin?section=products");
}

export async function archiveProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id", 100);
  const existing = await getStoreRecord("swell_products", id);
  if (!existing) throw new Error("Product was not found.");
  await saveStoreRecord("swell_products", id, {
    ...existing.payload,
    active: false,
    date_updated: new Date().toISOString(),
  });
  revalidateAdmin();
  redirect("/admin?section=products");
}

export async function saveCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id", 100) || randomUUID();
  const name = readText(formData, "name", 160);
  const slug = slugify(readText(formData, "slug", 200) || name);
  if (!name || !slug) throw new Error("Category name and slug are required.");
  const existing = await getStoreRecord("swell_categories", id);
  const category = {
    ...(existing?.payload ?? {}),
    id,
    name,
    slug,
    active: readBoolean(formData, "active"),
    parent_id: readText(formData, "parent_id", 100) || undefined,
    description: readText(formData, "description", 5000) || undefined,
    meta_title: readText(formData, "meta_title", 200) || undefined,
    meta_description: readText(formData, "meta_description", 500) || undefined,
    meta_keywords: readText(formData, "meta_keywords", 500) || undefined,
    date_updated: new Date().toISOString(),
  };
  const duplicate = await queryNeon<{ swell_id: string }>(
    "SELECT swell_id FROM swell_categories WHERE payload ->> 'slug' = $1 AND swell_id <> $2 LIMIT 1",
    [slug, id],
  );
  if (duplicate.length > 0) throw new Error("That category slug is already in use.");
  await saveStoreRecord("swell_categories", id, category);
  revalidateAdmin();
  redirect("/admin?section=categories");
}

export async function archiveCategoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id", 100);
  const existing = await getStoreRecord("swell_categories", id);
  if (!existing) throw new Error("Category was not found.");
  await saveStoreRecord("swell_categories", id, {
    ...existing.payload,
    active: false,
    date_updated: new Date().toISOString(),
  });
  revalidateAdmin();
  redirect("/admin?section=categories");
}

export async function updateInventoryAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id", 100);
  const stockLevel = Math.floor(readAmount(formData, "stock_level"));
  const existing = await getStoreRecord("swell_products", id);
  if (!existing) throw new Error("Product was not found.");
  await saveStoreRecord("swell_products", id, {
    ...existing.payload,
    stock_level: stockLevel,
    date_updated: new Date().toISOString(),
  });
  revalidateAdmin();
  redirect("/admin?section=inventory");
}

export async function saveCustomerAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id", 100);
  const name = readText(formData, "name", 200);
  const email = readText(formData, "email", 254).toLowerCase();
  if (!id || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Customer id, name, and a valid email are required.");
  }
  const addressesText = readText(formData, "addresses", 20_000);
  let addresses: unknown[] = [];
  if (addressesText) {
    const parsed: unknown = JSON.parse(addressesText);
    if (!Array.isArray(parsed)) throw new Error("Addresses must be a JSON array.");
    addresses = parsed;
  }
  const [identity] = await queryNeon<{ auth_uid: string | null; payload: { email?: string } }>(
    "SELECT auth_uid, payload FROM swell_customers WHERE swell_id = $1",
    [id],
  );
  if (!identity) throw new Error("Customer was not found.");
  if (
    identity.auth_uid &&
    typeof identity.payload.email === "string" &&
    identity.payload.email.toLowerCase() !== email
  ) {
    throw new Error("This sign-in email must be changed through Firebase.");
  }
  const account = await updateAccount(id, {
    name,
    email,
    first_name: readText(formData, "first_name", 100),
    last_name: readText(formData, "last_name", 100),
    phone: readText(formData, "phone", 60),
    addresses,
  });
  if (!account) throw new Error("Customer was not found.");
  revalidateAdmin();
  redirect("/admin?section=customers");
}

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id", 100);
  const status = readText(formData, "status", 40);
  if (!["pending", "processing", "fulfilled", "canceled", "refunded"].includes(status)) {
    throw new Error("Choose a valid order status.");
  }
  const order = await getStoreRecord("swell_orders", id);
  if (!order) throw new Error("Order was not found.");
  await saveStoreRecord("swell_orders", id, {
    ...order.payload,
    status,
    date_updated: new Date().toISOString(),
  });
  revalidateAdmin();
  redirect("/admin?section=orders");
}

export async function saveDiscountAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id", 100) || randomUUID();
  const code = readText(formData, "code", 80).toUpperCase();
  const name = readText(formData, "name", 160);
  const type = readText(formData, "type", 20);
  const value = readAmount(formData, "value");
  if (!code || !name || !["percent", "fixed"].includes(type) || value === 0) {
    throw new Error("Enter a code, name, valid discount type, and positive value.");
  }
  if (type === "percent" && value > 100) {
    throw new Error("Percentage discounts cannot exceed 100.");
  }
  const duplicate = await queryNeon<{ swell_id: string }>(
    "SELECT swell_id FROM swell_discounts WHERE upper(payload ->> 'code') = $1 AND swell_id <> $2 LIMIT 1",
    [code, id],
  );
  if (duplicate.length > 0) throw new Error("That discount code is already in use.");
  const existing = await getStoreRecord("swell_discounts", id);
  await saveStoreRecord("swell_discounts", id, {
    ...(existing?.payload ?? {}),
    id,
    code,
    name,
    type,
    value,
    active: readBoolean(formData, "active"),
    date_updated: new Date().toISOString(),
  });
  revalidateAdmin();
  redirect("/admin?section=discounts");
}

export async function archiveDiscountAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readText(formData, "id", 100);
  const discount = await getStoreRecord("swell_discounts", id);
  if (!discount) throw new Error("Discount was not found.");
  await saveStoreRecord("swell_discounts", id, {
    ...discount.payload,
    active: false,
    date_updated: new Date().toISOString(),
  });
  revalidateAdmin();
  redirect("/admin?section=discounts");
}
