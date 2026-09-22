"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction } from "@/lib/auth-actions";

const inputClasses =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold focus:outline-none";

const labelClasses =
  "mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-neutral-500";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          Join the Atelier
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          Create your account
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Save your details for a smoother checkout, and keep every Aurja
          piece close.
        </p>
      </div>

      <form action={formAction} className="mt-10 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="first_name" className={labelClasses}>
              First name
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              autoComplete="given-name"
              required
              placeholder="Aditi"
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="last_name" className={labelClasses}>
              Last name
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              autoComplete="family-name"
              required
              placeholder="Sharma"
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="At least 8 characters"
            className={inputClasses}
          />
        </div>

        {state?.error ? (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-gold px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-gold-link underline underline-offset-4 hover:text-gold"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
