import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { createSession } from "@/lib/session";
import {
  createAccount,
  getAccountByAuthUid,
  getAccountByEmail,
  linkAccountAuthUid,
} from "@/lib/store-db";

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

function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "23505",
  );
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

  let account =
    (await getAccountByAuthUid(decodedToken.uid)) ??
    (await getAccountByEmail(email));
  if (account && account.auth_uid !== decodedToken.uid) {
    if (account.auth_uid) {
      throw new FirebaseSessionError(
        "This email is already linked to another sign-in account.",
        409,
      );
    }
    const linked = await linkAccountAuthUid(account.id, decodedToken.uid);
    if (!linked) {
      throw new FirebaseSessionError(
        "This Firebase account is already linked to another customer.",
        409,
      );
    }
    account.auth_uid = decodedToken.uid;
  }

  if (!account) {
    const { firstName, lastName } = splitDisplayName(decodedToken.name);
    try {
      account = await createAccount(
        {
          email,
          ...(firstName ? { first_name: firstName } : {}),
          ...(lastName ? { last_name: lastName } : {}),
        },
        decodedToken.uid,
      );
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      account = await getAccountByAuthUid(decodedToken.uid);
      if (!account) throw error;
    }
  }

  await createSession(account.id, email);
}
