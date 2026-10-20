"use client";

import { signInWithCustomToken } from "@firebase/auth";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { firebaseAuth } from "@/lib/firebase-client";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const inputClasses =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold focus:outline-none";

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ): string;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

class OtpRequestError extends Error {}

interface ApiResponse {
  message?: string;
  customToken?: string;
  redirectTo?: string;
  error?: string;
}

export default function EmailOtpForm({
  mode,
}: {
  mode: "login" | "signup";
}) {
  const widgetContainer = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [captchaWidgetKey, setCaptchaWidgetKey] = useState(0);
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [idToken, setIdToken] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!siteKey || !widgetContainer.current) return;
    const container = widgetContainer.current;
    let widgetId: string | undefined;
    let cancelled = false;
    let appendScript = false;
    let script = document.querySelector<HTMLScriptElement>(
      'script[data-aurja-turnstile="true"]',
    );

    function onLoadError() {
      setCaptchaError("CAPTCHA could not load. Please refresh and try again.");
    }

    function renderWidget() {
      if (cancelled || !window.turnstile || !container.isConnected) return;
      try {
        widgetId = window.turnstile.render(container, {
          sitekey: siteKey,
          callback: (token) => {
            setCaptchaToken(token);
            setCaptchaError("");
          },
          "expired-callback": () => setCaptchaToken(""),
          "error-callback": () => {
            setCaptchaToken("");
            setCaptchaError("CAPTCHA verification failed. Please try again.");
          },
        });
      } catch {
        onLoadError();
      }
    }

    if (window.turnstile) {
      renderWidget();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.aurjaTurnstile = "true";
        appendScript = true;
      }
      script.addEventListener("load", renderWidget);
      script.addEventListener("error", onLoadError);
      if (appendScript) document.head.append(script);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", renderWidget);
      script?.removeEventListener("error", onLoadError);
      if (widgetId) window.turnstile?.remove(widgetId);
      container.replaceChildren();
    };
  }, [captchaWidgetKey]);

  async function readResponse(response: Response): Promise<ApiResponse> {
    try {
      return (await response.json()) as ApiResponse;
    } catch {
      throw new OtpRequestError(
        "The verification service returned an invalid response.",
      );
    }
  }

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    if (!captchaToken) {
      setError("Complete the CAPTCHA before requesting a code.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/auth/email-otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          captchaToken,
        }),
      });
      const result = await readResponse(response);
      if (!response.ok) {
        throw new OtpRequestError(
          result.error ?? "We could not send a code. Please try again.",
        );
      }

      setStep("code");
      setStatus(
        result.message ??
          "If this address can receive a code, it has been sent. Check your inbox.",
      );
      setCaptchaToken("");
      setCaptchaWidgetKey((key) => key + 1);
    } catch (requestError) {
      console.error(
        "Email OTP request failed",
        requestError instanceof Error ? requestError.message : "Unknown error",
      );
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We could not send a code. Please try again.",
      );
      setCaptchaToken("");
      setCaptchaWidgetKey((key) => key + 1);
    } finally {
      setPending(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    setPending(true);

    try {
      const response = await fetch("/api/auth/email-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code,
        }),
      });
      const result = await readResponse(response);
      if (!response.ok || !result.customToken) {
        throw new OtpRequestError(
          result.error ?? "We could not verify the code. Please try again.",
        );
      }

      const credential = await signInWithCustomToken(
        firebaseAuth,
        result.customToken,
      );
      const verifiedIdToken = await credential.user.getIdToken();
      setIdToken(verifiedIdToken);
      await establishAurjaSession(verifiedIdToken);
    } catch (verificationError) {
      console.error(
        "Email OTP verification failed",
        verificationError instanceof Error
          ? verificationError.message
          : "Unknown error",
      );
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "We could not verify the code. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function establishAurjaSession(token: string) {
    const sessionResponse = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
    });
    const sessionResult = await readResponse(sessionResponse);
    if (!sessionResponse.ok || typeof sessionResult.redirectTo !== "string") {
      throw new OtpRequestError(
        sessionResult.error ?? "We could not finish signing you in.",
      );
    }

    window.location.assign(sessionResult.redirectTo);
  }

  async function retrySession() {
    if (!idToken) return;
    setError("");
    setPending(true);
    try {
      await establishAurjaSession(idToken);
    } catch (sessionError) {
      setError(
        sessionError instanceof Error
          ? sessionError.message
          : "We could not finish signing you in.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-6 border-t border-neutral-200 pt-6">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
        Or continue with email OTP
      </p>

      {step === "email" ? (
        <form onSubmit={requestCode} className="space-y-4">
          <div>
            <label
              htmlFor={`${mode}-otp-email`}
              className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-neutral-500"
            >
              Email address
            </label>
            <input
              id={`${mode}-otp-email`}
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </div>
          {siteKey ? (
            <div>
              <div key={captchaWidgetKey} ref={widgetContainer} />
              {captchaError ? (
                <p role="alert" className="mt-2 text-sm text-red-600">
                  {captchaError}
                </p>
              ) : null}
            </div>
          ) : (
            <p role="alert" className="text-sm text-red-600">
              CAPTCHA is not configured. Please use Google sign-in.
            </p>
          )}
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending || !captchaToken || !siteKey}
            aria-busy={pending}
            className="w-full rounded-full bg-gold px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Sending code…" : "Email me a six-digit code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4">
          <p className="text-center text-sm text-neutral-500">
            Enter the six-digit code sent to <strong>{email}</strong>.
          </p>
          <div>
            <label
              htmlFor={`${mode}-otp-code`}
              className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-neutral-500"
            >
              Verification code
            </label>
            <input
              id={`${mode}-otp-code`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              minLength={6}
              maxLength={6}
              required
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className={`${inputClasses} text-center text-lg tracking-[0.4em]`}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}
          {idToken ? (
            <button
              type="button"
              onClick={retrySession}
              disabled={pending}
              className="w-full rounded-full bg-gold px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Retry sign-in"}
            </button>
          ) : null}
          {status ? (
            <p role="status" className="text-sm text-green-700">
              {status}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending || code.length !== 6}
            aria-busy={pending}
            className="w-full rounded-full bg-gold px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Verifying…" : mode === "signup" ? "Verify and sign up" : "Verify and sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
              setStatus("");
            }}
            disabled={pending}
            className="w-full text-sm font-medium text-gold-link underline underline-offset-4 hover:text-gold disabled:opacity-60"
          >
            Use a different email or request another code
          </button>
        </form>
      )}
      {status && step === "email" ? (
        <p role="status" className="mt-3 text-center text-sm text-green-700">
          {status}
        </p>
      ) : null}
    </section>
  );
}
