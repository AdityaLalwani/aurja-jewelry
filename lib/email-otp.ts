import "server-only";

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";

const CHALLENGE_COLLECTION = "emailOtpChallenges";
const RATE_LIMIT_COLLECTION = "emailOtpRateLimits";
const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_SENDS_PER_WINDOW = 3;
const MAX_VERIFY_ATTEMPTS = 5;

export class EmailOtpError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function getOtpSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET for email OTP security.");
  }
  return secret;
}

function digest(value: string) {
  return createHmac("sha256", getOtpSecret()).update(value).digest();
}

function getEmailKey(email: string) {
  return digest(`email-otp:${email}`).toString("hex");
}

function getCodeHash(email: string, code: string) {
  return digest(`email-otp-code:${email}:${code}`).toString("hex");
}

function constantTimeEqual(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function generateEmailOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function createEmailOtpChallenge(email: string, code: string) {
  const firestore = getFirebaseAdminFirestore();
  const emailKey = getEmailKey(email);
  const challengeRef = firestore.collection(CHALLENGE_COLLECTION).doc(emailKey);
  const rateLimitRef = firestore
    .collection(RATE_LIMIT_COLLECTION)
    .doc(emailKey);
  const now = Date.now();
  const nowTimestamp = Timestamp.fromMillis(now);

  await firestore.runTransaction(async (transaction) => {
    const rateLimitSnapshot = await transaction.get(rateLimitRef);

    const rateLimit = rateLimitSnapshot.data();
    const windowStartedAt =
      rateLimit?.windowStartedAt instanceof Timestamp
        ? rateLimit.windowStartedAt.toMillis()
        : 0;
    const lastSentAt =
      rateLimit?.lastSentAt instanceof Timestamp
        ? rateLimit.lastSentAt.toMillis()
        : 0;
    const currentWindow =
      now - windowStartedAt < RATE_WINDOW_MS &&
      now >= windowStartedAt;
    const sendCount = currentWindow ? Number(rateLimit?.sendCount ?? 0) : 0;

    if (now - lastSentAt < RESEND_COOLDOWN_MS && now >= lastSentAt) {
      throw new EmailOtpError(
        "Please wait a minute before requesting another code.",
        429,
      );
    }
    if (sendCount >= MAX_SENDS_PER_WINDOW) {
      throw new EmailOtpError(
        "Too many codes requested. Please try again in an hour.",
        429,
      );
    }

    transaction.set(challengeRef, {
      codeHash: getCodeHash(email, code),
      attempts: 0,
      createdAt: nowTimestamp,
      expiresAt: Timestamp.fromMillis(now + OTP_EXPIRY_MS),
    });
    transaction.set(rateLimitRef, {
      sendCount: sendCount + 1,
      windowStartedAt: currentWindow
        ? rateLimit?.windowStartedAt
        : nowTimestamp,
      lastSentAt: nowTimestamp,
      expiresAt: Timestamp.fromMillis(now + 24 * RATE_WINDOW_MS),
    });
  });
}

export async function consumeEmailOtp(email: string, code: string) {
  const firestore = getFirebaseAdminFirestore();
  const challengeRef = firestore
    .collection(CHALLENGE_COLLECTION)
    .doc(getEmailKey(email));
  const now = Date.now();

  const result = await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(challengeRef);
    if (!snapshot.exists) {
      return { error: "invalid" as const };
    }

    const challenge = snapshot.data();
    const expiresAt =
      challenge?.expiresAt instanceof Timestamp
        ? challenge.expiresAt.toMillis()
        : 0;
    if (now >= expiresAt) {
      transaction.delete(challengeRef);
      return { error: "invalid" as const };
    }

    const attempts = Number(challenge?.attempts ?? MAX_VERIFY_ATTEMPTS);
    if (attempts >= MAX_VERIFY_ATTEMPTS) {
      return { error: "locked" as const };
    }

    const expectedHash =
      typeof challenge?.codeHash === "string" ? challenge.codeHash : "";
    const actualHash = getCodeHash(email, code);
    if (!constantTimeEqual(expectedHash, actualHash)) {
      transaction.update(challengeRef, { attempts: attempts + 1 });
      return { error: "incorrect" as const };
    }

    transaction.delete(challengeRef);
    return { error: null };
  });

  if (result.error === "locked") {
    throw new EmailOtpError(
      "Too many incorrect attempts. Request a new code.",
      429,
    );
  }
  if (result.error === "incorrect") {
    throw new EmailOtpError(
      "This code is incorrect. Check the code and try again.",
      400,
    );
  }
  if (result.error === "invalid") {
    throw new EmailOtpError(
      "This code is invalid or expired. Request a new code and try again.",
      400,
    );
  }
}

export async function discardEmailOtpChallenge(email: string, code: string) {
  const firestore = getFirebaseAdminFirestore();
  const challengeRef = firestore
    .collection(CHALLENGE_COLLECTION)
    .doc(getEmailKey(email));
  const expectedHash = getCodeHash(email, code);

  await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(challengeRef);
    const currentHash = snapshot.data()?.codeHash;
    if (snapshot.exists && currentHash === expectedHash) {
      transaction.delete(challengeRef);
    }
  });
}
