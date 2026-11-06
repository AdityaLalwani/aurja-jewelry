import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "aurja_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

interface SessionPayload {
  accountId: string;
  iat: number;
}

function getSessionSecret(): Buffer {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "Missing session configuration. Set SESSION_SECRET to a random string.",
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
  return createHmac("sha256", getSessionSecret())
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
 * Create a signed session cookie for the given Swell account id. Swell does
 * not issue a session token, so the app keeps the user logged in by storing
 * the account id in an HMAC-signed, httpOnly cookie.
 *
 * Call only from a Server Action or Route Handler — cookies can only be
 * written there.
 */
export async function createSession(accountId: string): Promise<void> {
  const payload: SessionPayload = {
    accountId,
    iat: Math.floor(Date.now() / 1000),
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const cookieValue = `${encodedPayload}.${sign(encodedPayload)}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Read the signed session cookie and return the authenticated Swell account
 * id, or null when there is no session or the signature is invalid.
 */
export async function getSessionAccountId(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return null;
  }

  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex === -1) {
    return null;
  }

  const encodedPayload = cookieValue.slice(0, dotIndex);
  const signature = cookieValue.slice(dotIndex + 1);

  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
  } catch {
    return null;
  }

  if (
    typeof payload?.accountId !== "string" ||
    typeof payload?.iat !== "number"
  ) {
    return null;
  }

  if (!safeEqual(sign(encodedPayload), signature)) {
    return null;
  }

  return payload.accountId;
}

/**
 * Clear the session cookie. Call only from a Server Action or Route Handler.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
