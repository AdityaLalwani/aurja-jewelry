"use client";

import { useState, useActionState } from "react";
import { createPortal } from "react-dom";
import {
  submitCartEnquiryAction,
  type CartFormState,
} from "@/lib/cart-actions";
import type { Currency } from "@/components/StoreProvider";

interface CartContactDetails {
  name: string;
  email: string;
  phone: string;
}

const inputClasses =
  "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold focus:outline-none";

const labelClasses =
  "mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-neutral-500";

export function CartEnquiryForm({
  currency,
  contactDetails,
}: {
  currency: Currency;
  contactDetails: CartContactDetails;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [state, formAction, pending] = useActionState<CartFormState | undefined, FormData>(
    submitCartEnquiryAction,
    undefined,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setRequestId(crypto.randomUUID());
          setIsOpen(true);
        }}
        className="mt-6 w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
      >
        Request to Order
      </button>

      {isOpen
        ? createPortal(
        <div className="fixed inset-0 z-[130] grid place-items-center bg-neutral-950/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-request-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
                  Aurja Atelier
                </p>
                <h2
                  id="order-request-title"
                  className="mt-2 font-display text-2xl text-neutral-900"
                >
                  Request to Order
                </h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Share your delivery details and any custom requests. An atelier
                  specialist will be in touch within 24 hours.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close order request form"
                className="rounded-full px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                Close
              </button>
            </div>

            {state?.success ? (
              <div className="mt-8 rounded-xl bg-neutral-50 p-5">
                <p role="status" className="text-sm leading-6 text-neutral-800">
                  {state.success}
                </p>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="mt-5 rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
                >
                  Done
                </button>
              </div>
            ) : (
              <form action={formAction} className="mt-7 space-y-6">
                <input type="hidden" name="requestId" value={requestId} />
                <input type="hidden" name="currency" value={currency} />

                <fieldset className="space-y-4">
                  <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900">
                    Contact details
                  </legend>
                  <div>
                    <label htmlFor="order-name" className={labelClasses}>
                      Full name
                    </label>
                    <input
                      id="order-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={120}
                      defaultValue={contactDetails.name}
                      className={inputClasses}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="order-email" className={labelClasses}>
                        Email address
                      </label>
                      <input
                        id="order-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        defaultValue={contactDetails.email}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor="order-phone" className={labelClasses}>
                        Phone with country code
                      </label>
                      <input
                        id="order-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        required
                        maxLength={24}
                        defaultValue={contactDetails.phone}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900">
                    Shipping details
                  </legend>
                  <div>
                    <label htmlFor="order-address" className={labelClasses}>
                      Delivery address
                    </label>
                    <input
                      id="order-address"
                      name="address1"
                      type="text"
                      autoComplete="address-line1"
                      required
                      maxLength={200}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label htmlFor="order-address2" className={labelClasses}>
                      Apartment, suite, etc. <span className="normal-case tracking-normal">(optional)</span>
                    </label>
                    <input
                      id="order-address2"
                      name="address2"
                      type="text"
                      autoComplete="address-line2"
                      maxLength={200}
                      className={inputClasses}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="order-city" className={labelClasses}>
                        City
                      </label>
                      <input
                        id="order-city"
                        name="city"
                        type="text"
                        autoComplete="address-level2"
                        required
                        maxLength={100}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor="order-state" className={labelClasses}>
                        State / province
                      </label>
                      <input
                        id="order-state"
                        name="state"
                        type="text"
                        autoComplete="address-level1"
                        required
                        maxLength={100}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor="order-postal" className={labelClasses}>
                        Postal code
                      </label>
                      <input
                        id="order-postal"
                        name="postalCode"
                        type="text"
                        autoComplete="postal-code"
                        required
                        maxLength={20}
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor="order-country" className={labelClasses}>
                        Country
                      </label>
                      <input
                        id="order-country"
                        name="country"
                        type="text"
                        autoComplete="country-name"
                        required
                        maxLength={100}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="order-notes" className={labelClasses}>
                    Customization notes <span className="normal-case tracking-normal">(optional)</span>
                  </label>
                  <textarea
                    id="order-notes"
                    name="customizationNotes"
                    rows={4}
                    maxLength={2000}
                    placeholder="Sizing, metal finish, engraving, or any other details"
                    className={inputClasses}
                  />
                </div>

                {state?.error ? (
                  <p role="alert" className="text-sm leading-6 text-red-600">
                    {state.error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Sending request…" : "Send order request"}
                </button>
              </form>
            )}
          </section>
        </div>,
        document.body,
      )
        : null}
    </>
  );
}
