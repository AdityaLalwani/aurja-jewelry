import { FirebaseAuthError } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { consumeEmailOtp, EmailOtpError } from "@/lib/email-otp";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function isMissingFirebaseUser(error: unknown) {
  return (
    error instanceof FirebaseAuthError && error.code === "auth/user-not-found"
  );
}

export async function POST(request: Request) {
  let requestUrl: URL;
  try {
    requestUrl = new URL(request.url);
  } catch {
    return errorResponse("Invalid verification request.", 400);
  }
  if (request.headers.get("origin") !== requestUrl.origin) {
    return errorResponse("Invalid verification request.", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid verification request.", 400);
  }

  const email =
    body && typeof body === "object" && "email" in body
      ? body.email
      : undefined;
  const code =
    body && typeof body === "object" && "code" in body
      ? body.code
      : undefined;
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof code !== "string" ||
    !/^\d{6}$/.test(code)
  ) {
    return errorResponse("Enter a valid email and six-digit code.", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  try {
    await consumeEmailOtp(normalizedEmail, code);

    const auth = getFirebaseAdminAuth();
    let user;
    try {
      user = await auth.getUserByEmail(normalizedEmail);
      if (user.disabled) {
        return errorResponse("This account is unavailable.", 403);
      }
      if (!user.emailVerified) {
        user = await auth.updateUser(user.uid, { emailVerified: true });
      }
    } catch (error) {
      if (!isMissingFirebaseUser(error)) {
        throw error;
      }
      try {
        user = await auth.createUser({
          email: normalizedEmail,
          emailVerified: true,
        });
      } catch (createError) {
        if (
          !(createError instanceof FirebaseAuthError) ||
          createError.code !== "auth/email-already-exists"
        ) {
          throw createError;
        }
        user = await auth.getUserByEmail(normalizedEmail);
        if (user.disabled) {
          return errorResponse("This account is unavailable.", 403);
        }
        if (!user.emailVerified) {
          user = await auth.updateUser(user.uid, { emailVerified: true });
        }
      }
    }

    const customToken = await auth.createCustomToken(user.uid, {
      authMethod: "email-otp",
    });
    return NextResponse.json(
      { customToken },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof EmailOtpError) {
      return errorResponse(error.message, error.status);
    }
    const isConfigurationError =
      error instanceof Error &&
      (error.message.includes("SESSION_SECRET") ||
        error.message.includes("Firebase Admin configuration") ||
        error.message.includes("FIREBASE_SERVICE_ACCOUNT_JSON") ||
        error.message.includes("NEXT_PUBLIC_FIREBASE_PROJECT_ID"));
    console.error(
      "Email OTP verification failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return errorResponse(
      isConfigurationError
        ? "Email verification is not configured yet."
        : "We could not verify the code. Please request a new code and try again.",
      isConfigurationError ? 503 : 500,
    );
  }
}
