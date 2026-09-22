"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/lib/auth-actions";

const inputClasses =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold focus:outline-none";

const labelClasses =
  "mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-neutral-500";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
          Welcome Back
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-neutral-900 sm:text-4xl">
          Sign in to your account
        </h1>
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          Track your orders and manage the details of your Aurja pieces.
        </p>
      </div>

      <form action={formAction} className="mt-10 space-y-5">
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
            autoComplete="current-password"
            required
            placeholder="Your password"
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
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-neutral-500">
        New to Aurja?{" "}
        <Link
          href="/signup"
          className="font-medium text-gold-link underline underline-offset-4 hover:text-gold"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
