import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const CART_COOKIE_NAME = "aurja_cart";
const CART_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface CartCookiePayload {
  cartId: string;
  iat: number;
}

function getCartSecret(): Buffer {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "Missing cart configuration. Set SESSION_SECRET to a random string.",
    );
  }

  return Buffer.from(secret, "utf8");
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf8");
}

function sign(payload: string): string {
  return createHmac("sha256", getCartSecret())
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");

  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

/**
 * Remember a Swell cart id in an HMAC-signed, httpOnly cookie so the same
 * shopper keeps their cart across requests. Mirrors the session cookie in
 * session.ts and shares its SESSION_SECRET.
 *
 * Call only from a Server Action or Route Handler — cookies can only be
 * written there. Setting a cookie in an action re-renders the page and its
 * layouts in the same roundtrip, so the header cart badge stays in sync.
 */
export async function createCartCookie(cartId: string): Promise<void> {
  const payload: CartCookiePayload = {
    cartId,
    iat: Math.floor(Date.now() / 1000),
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const cookieValue = `${encodedPayload}.${sign(encodedPayload)}`;

  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_MAX_AGE_SECONDS,
  });
}

/**
 * Read the signed cart cookie and return the stored Swell cart id, or null
 * when there is no cart cookie or the signature is invalid.
 */
export async function getCartIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return null;
  }

  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex === -1) {
    return null;
  }

  const encodedPayload = cookieValue.slice(0, dotIndex);
  const signature = cookieValue.slice(dotIndex + 1);

  let payload: CartCookiePayload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload)) as CartCookiePayload;
  } catch {
    return null;
  }

  if (typeof payload?.cartId !== "string" || typeof payload?.iat !== "number") {
    return null;
  }

  if (!safeEqual(sign(encodedPayload), signature)) {
    return null;
  }

  return payload.cartId;
}

/**
 * Clear the cart cookie, e.g. after converting the cart to an order or
 * deleting the cart. Call only from a Server Action or Route Handler.
 */
export async function clearCartCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE_NAME);
}
