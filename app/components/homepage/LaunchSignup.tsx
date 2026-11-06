"use client";

import { useId, useState, type FormEvent } from "react";
import { home } from "@/lib/site";
import { submitSubscription } from "@/lib/subscribe";

type SignupStatus = "idle" | "invalid" | "pending" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Launch-signup form — email capture used in the launch section and the footer.
 */
export function LaunchSignup({
  variant = "section",
}: {
  variant?: "section" | "footer";
}) {
  const { launchSignup } = home;
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SignupStatus>("idle");

  const isFooter = variant === "footer";
  const messageClass = isFooter
    ? "text-amber-200/80"
    : "text-amber-700";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "pending" || status === "success") return;

    if (!EMAIL_PATTERN.test(email)) {
      setStatus("invalid");
      return;
    }

    setStatus("pending");
    try {
      await submitSubscription({ email, source: "launch" });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p
        aria-live="polite"
        className={`flex items-center justify-center gap-3 rounded-2xl px-6 py-5 text-sm font-medium ${
          isFooter
            ? "bg-white/5 text-amber-200 ring-1 ring-amber-500/30"
            : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
        }`}
      >
        <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-amber-600" />
        {launchSignup.successMessage}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={status === "pending"}
      className="w-full"
    >
      <div
        className={`flex overflow-hidden rounded-full transition-shadow focus-within:ring-2 ${
          isFooter
            ? "bg-white/5 ring-1 ring-white/10 focus-within:ring-amber-600/60"
            : "bg-white shadow-sm ring-1 ring-stone-200 focus-within:ring-amber-600/60"
        }`}
      >
        <label htmlFor={emailId} className="sr-only">
          Email address
        </label>
        <input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "invalid") setStatus("idle");
          }}
          placeholder={launchSignup.placeholder}
          aria-invalid={status === "invalid"}
          className={`h-12 w-full bg-transparent px-5 text-sm focus:outline-none ${
            isFooter
              ? "text-stone-200 placeholder:text-stone-500"
              : "text-stone-900 placeholder:text-stone-400"
          }`}
        />
        <button
          type="submit"
          disabled={status === "pending"}
          className="h-12 shrink-0 bg-amber-600 px-6 text-sm font-medium text-white transition-colors hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "pending" ? "Notifying…" : launchSignup.buttonLabel}
        </button>
      </div>

      {status === "invalid" && (
        <p aria-live="polite" className={`mt-3 px-5 text-xs ${messageClass}`}>
          Please enter a valid email address.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className={`mt-3 px-5 text-xs ${messageClass}`}>
          Something went wrong —{" "}
          Please try again in a moment.
        </p>
      )}
    </form>
  );
}
