import { NextResponse } from "next/server";
import { getCustomerActivity, upsertCustomerActivity } from "@/lib/store-db";
import { getSessionAccountId } from "@/lib/session";
import type { LocalCartItem } from "@/lib/cart-view";

export const runtime = "nodejs";

function sanitizeCartItem(value: unknown): LocalCartItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Partial<LocalCartItem>;
  const boundedText = (input: unknown, limit: number): input is string =>
    typeof input === "string" && input.length > 0 && input.length <= limit;
  if (
    !boundedText(item.id, 300) ||
    !boundedText(item.productId, 200) ||
    !boundedText(item.slug, 200) ||
    !boundedText(item.name, 200) ||
    !boundedText(item.variantKey, 1000) ||
    typeof item.quantity !== "number" ||
    !Number.isInteger(item.quantity) ||
    item.quantity < 1 ||
    item.quantity > 99 ||
    !Array.isArray(item.selectedOptions) ||
    item.selectedOptions.length > 20 ||
    !item.selectedOptions.every(
      (option) =>
        option &&
        boundedText(option.name, 100) &&
        boundedText(option.value, 100),
    ) ||
    !Array.isArray(item.variantSummary) ||
    item.variantSummary.length > 20 ||
    !item.variantSummary.every((summary) => boundedText(summary, 250))
  ) {
    return null;
  }
  return {
    id: item.id,
    productId: item.productId,
    slug: item.slug,
    name: item.name,
    sku: typeof item.sku === "string" ? item.sku.slice(0, 120) : null,
    image: typeof item.image === "string" ? item.image.slice(0, 2000) : null,
    attributes: null,
    variantSummary: item.variantSummary,
    showPriceOnRequest: item.showPriceOnRequest === true,
    price: typeof item.price === "number" && Number.isFinite(item.price) ? item.price : 0,
    priceInr:
      typeof item.priceInr === "number" && Number.isFinite(item.priceInr)
        ? item.priceInr
        : null,
    priceUsd:
      typeof item.priceUsd === "number" && Number.isFinite(item.priceUsd)
        ? item.priceUsd
        : null,
    quantity: item.quantity,
    variantKey: item.variantKey,
    selectedOptions: item.selectedOptions,
  };
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin && origin === new URL(request.url).origin);
}

export async function GET() {
  const customerId = await getSessionAccountId();
  if (!customerId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const activity = await getCustomerActivity(customerId);
  return NextResponse.json(activity, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }

  const customerId = await getSessionAccountId();
  if (!customerId) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid activity data." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid activity data." }, { status: 400 });
  }
  const submittedCart = "cart" in body ? body.cart : undefined;
  const wishlist = "wishlist" in body ? body.wishlist : undefined;
  if (
    !Array.isArray(submittedCart) ||
    submittedCart.length > 100 ||
    !Array.isArray(wishlist) ||
    wishlist.length > 500 ||
    !wishlist.every(
      (slug) => typeof slug === "string" && slug.length > 0 && slug.length <= 200,
    )
  ) {
    return NextResponse.json({ error: "Invalid activity data." }, { status: 400 });
  }
  const cart = submittedCart.map(sanitizeCartItem);
  if (cart.some((item) => item === null)) {
    return NextResponse.json({ error: "Invalid cart data." }, { status: 400 });
  }
  const cartItems = cart.filter(
    (item): item is LocalCartItem => item !== null,
  );

  await upsertCustomerActivity(
    customerId,
    cartItems,
    [...new Set(wishlist as string[])],
  );
  return new NextResponse(null, { status: 204 });
}
