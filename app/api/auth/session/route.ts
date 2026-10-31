import { FirebaseAuthError } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import {
  establishAurjaSession,
  FirebaseSessionError,
} from "@/lib/firebase-session";

export const runtime = "nodejs";

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function isInvalidFirebaseToken(error: unknown): boolean {
  if (!(error instanceof FirebaseAuthError)) {
    return false;
  }
  return (
    error.code === "auth/argument-error" ||
    error.code === "auth/id-token-expired" ||
    error.code === "auth/id-token-revoked" ||
    error.code === "auth/invalid-id-token"
  );
}

export async function POST(request: Request) {
  let requestOrigin: string;
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    return errorResponse("Invalid sign-in request.", 400);
  }

  if (!requestOrigin || request.headers.get("origin") !== requestOrigin) {
    return errorResponse("Invalid sign-in request.", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid sign-in request.", 400);
  }

  const idToken =
    body && typeof body === "object" && "idToken" in body
      ? body.idToken
      : undefined;
  if (typeof idToken !== "string" || idToken.length > 8192) {
    return errorResponse("Invalid Firebase sign-in credentials.", 400);
  }

  try {
    const auth = getFirebaseAdminAuth();
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken, true);
    } catch (error) {
      if (isInvalidFirebaseToken(error)) {
        return errorResponse(
          "Your Google sign-in could not be verified. Please try again.",
          401,
        );
      }
      console.error("Firebase ID token verification failed");
      return errorResponse("Sign-in is temporarily unavailable.", 503);
    }

    await establishAurjaSession(decodedToken);
    return NextResponse.json(
      { redirectTo: "/profile" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof FirebaseSessionError) {
      return errorResponse(error.message, error.status);
    }
    const isConfigurationError =
      error instanceof Error &&
      (error.message.includes("Firebase Admin configuration") ||
        error.message.includes("FIREBASE_SERVICE_ACCOUNT_JSON") ||
        error.message.includes("NEXT_PUBLIC_FIREBASE_PROJECT_ID"));
    console.error(
      "Firebase sign-in and Swell customer provisioning failed",
      error instanceof Error ? error.message : "Unknown error",
    );
    return errorResponse(
      isConfigurationError
        ? "Firebase sign-in is not configured yet."
        : "We could not complete sign-in. Please try again.",
      isConfigurationError ? 503 : 500,
    );
  }
}
