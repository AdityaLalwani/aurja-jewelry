"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type SubmissionResult = { ok?: boolean; error?: string };

export function CustomDesignForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("design");

    if (file instanceof File && file.size > 3 * 1024 * 1024) {
      setError("Please choose a file no larger than 3 MB.");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");
    const activeRequestId = requestId || crypto.randomUUID();
    setRequestId(activeRequestId);
    formData.set("requestId", activeRequestId);

    try {
      const response = await fetch("/api/custom-design", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json().catch(() => null)) as SubmissionResult | null;

      if (!response.ok || !result?.ok) {
        setError(result?.error ?? "We could not send your request. Please try again.");
        return;
      }

      form.reset();
      setRequestId("");
      setMessage("Thank you. Your design request has been sent to our atelier.");
    } catch {
      setError("We could not reach our team. Please try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="mt-7 space-y-5"
      onSubmit={handleSubmit}
      onChange={() => {
        if (requestId) setRequestId("");
      }}
    >
      <div>
        <label htmlFor="custom-name" className="text-sm font-medium text-stone-800">
          Your name
        </label>
        <input
          id="custom-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={120}
          required
          className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="custom-email" className="text-sm font-medium text-stone-800">
            Email address
          </label>
          <input
            id="custom-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15"
          />
        </div>
        <div>
          <label htmlFor="custom-phone" className="text-sm font-medium text-stone-800">
            Phone / WhatsApp
          </label>
          <input
            id="custom-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={24}
            required
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15"
          />
        </div>
      </div>

      <div>
        <label htmlFor="custom-details" className="text-sm font-medium text-stone-800">
          Tell us about your design
        </label>
        <textarea
          id="custom-details"
          name="details"
          rows={4}
          maxLength={1500}
          placeholder="Style, jewelry type, materials, size or anything else we should know"
          className="mt-2 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15"
        />
      </div>

      <div>
        <label htmlFor="custom-design-file" className="text-sm font-medium text-stone-800">
          Upload your design
        </label>
        <input
          id="custom-design-file"
          name="design"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          className="mt-2 block w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-700 file:mr-4 file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200"
        />
        <p className="mt-2 text-xs leading-relaxed text-stone-500">
          JPG, PNG, WebP or PDF · Maximum file size 3 MB
        </p>
      </div>

      <p className="text-xs leading-relaxed text-stone-500">
        By submitting, you agree that we may use your details and design file
        to review your request and prepare a quote. See our{" "}
        <Link
          href="/privacy-policy"
          className="underline underline-offset-4 hover:text-amber-700"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <div aria-live="polite" className="min-h-5 text-sm">
        {error ? <p className="text-red-700">{error}</p> : null}
        {message ? <p className="text-emerald-800">{message}</p> : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-stone-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.16em] text-amber-50 transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Sending request…" : "Send design for a quote"}
      </button>
    </form>
  );
}
