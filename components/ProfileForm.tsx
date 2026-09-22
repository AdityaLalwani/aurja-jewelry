"use client";

import { useActionState } from "react";
import {
  logoutAction,
  updateProfileAction,
} from "@/lib/auth-actions";

const inputClasses =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold focus:outline-none";

const labelClasses =
  "mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-neutral-500";

interface ProfileFormProps {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export function ProfileForm({
  email,
  firstName,
  lastName,
  phone,
}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    undefined,
  );

  return (
    <section className="rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900">
        Your details
      </h2>

      <form action={formAction} className="mt-6 space-y-5">
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
              defaultValue={firstName}
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
              defaultValue={lastName}
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
            defaultValue={email}
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClasses}>
            Phone (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={phone}
            placeholder="+91 98765 43210"
            className={inputClasses}
          />
        </div>

        {state?.error ? (
          <p role="alert" className="text-sm text-red-600">
            {state.error}
          </p>
        ) : null}
        {state?.success ? (
          <p role="status" className="text-sm text-emerald-600">
            {state.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-gold px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>

      <form action={logoutAction} className="mt-8 border-t border-neutral-200/80 pt-6">
        <button
          type="submit"
          className="text-xs font-medium tracking-wide text-neutral-400 underline underline-offset-4 transition-colors hover:text-neutral-900"
        >
          Sign out
        </button>
      </form>
    </section>
  );
}
