"use client";

import {
  GoogleAuthProvider,
  signInWithPopup,
} from "@firebase/auth";
import { useState } from "react";
import { firebaseAuth } from "@/lib/firebase-client";

class SignInRequestError extends Error {}

function getSignInError(error: unknown): string {
  if (error instanceof SignInRequestError) {
    return error.message;
  }

  if (
    error instanceof Error &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    const code = error.code;
    if (code === "auth/popup-closed-by-user") {
      return "The Google sign-in window was closed before completion.";
    }
    if (code === "auth/popup-blocked") {
      return "Your browser blocked the Google sign-in window. Allow pop-ups and try again.";
    }
  }

  return "We could not sign you in with Google. Please try again.";
}

export default function GoogleSignInButton({
  label,
}: {
  label: string;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function signIn() {
    setError("");
    setPending(true);

    try {
      const credential = await signInWithPopup(
        firebaseAuth,
        createGoogleProvider(),
      );
      const idToken = await credential.user.getIdToken();
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      let result: unknown;
      try {
        result = await response.json();
      } catch {
        throw new SignInRequestError(
          "The sign-in service returned an invalid response.",
        );
      }

      if (!response.ok || !result || typeof result !== "object") {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "We could not complete sign-in. Please try again.";
        throw new SignInRequestError(message);
      }
      if (!("redirectTo" in result) || typeof result.redirectTo !== "string") {
        throw new SignInRequestError(
          "The sign-in service returned an invalid response.",
        );
      }

      window.location.assign(result.redirectTo);
    } catch (signInError) {
      console.error(
        "Google sign-in failed",
        signInError instanceof Error ? signInError.message : "Unknown error",
      );
      setError(getSignInError(signInError));
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        aria-busy={pending}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white px-8 py-3 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
            transform="translate(0 4)"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.75 7.18l7.73 6C44.43 38.16 47 31.98 47 24.55Z"
            transform="translate(0 0)"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.55 2.56 10.78l7.97-6.19Z"
            transform="translate(0 4)"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
            transform="translate(0 0)"
          />
        </svg>
        {pending ? "Connecting to Google…" : label}
      </button>
      {error ? (
        <p role="alert" className="mt-4 text-center text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}
