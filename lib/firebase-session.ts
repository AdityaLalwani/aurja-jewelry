import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { createSession } from "@/lib/session";
import {
  createSwellAccount,
  getSwellAccountByEmail,
  isSwellDuplicateEmailError,
} from "@/lib/swell";

export class FirebaseSessionError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function splitDisplayName(displayName: string | undefined) {
  const parts = displayName?.trim().split(/\s+/).filter(Boolean) ?? [];
  return {
    firstName: parts[0]?.slice(0, 80) ?? "",
    lastName: parts.slice(1).join(" ").slice(0, 80),
  };
}

export async function establishAurjaSession(decodedToken: DecodedIdToken) {
  const provider = decodedToken.firebase.sign_in_provider;
  if (
    (provider !== "google.com" && provider !== "custom") ||
    decodedToken.email_verified !== true ||
    typeof decodedToken.email !== "string" ||
    !decodedToken.email
  ) {
    throw new FirebaseSessionError(
      "A verified Google account or email OTP is required.",
      403,
    );
  }

  const email = decodedToken.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new FirebaseSessionError(
      "Firebase did not provide a valid email address.",
      403,
    );
  }

  let account = await getSwellAccountByEmail(email);
  if (!account) {
    const { firstName, lastName } = splitDisplayName(decodedToken.name);
    try {
      account = await createSwellAccount({
        email,
        ...(firstName ? { first_name: firstName } : {}),
        ...(lastName ? { last_name: lastName } : {}),
      });
    } catch (error) {
      if (!isSwellDuplicateEmailError(error)) {
        throw error;
      }
      account = await getSwellAccountByEmail(email);
      if (!account) {
        throw error;
      }
    }
  }

  await createSession(account.id);
}
