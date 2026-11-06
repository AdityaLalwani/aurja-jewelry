"use client";

import { useState, useActionState } from "react";
import { createPortal } from "react-dom";
import {
  submitCartEnquiryAction,
  type CartFormState,
} from "@/lib/cart-actions";
import type { Currency } from "@/components/StoreProvider";
import { WhatsAppIcon } from "@/app/components/icons";
import { phoneCountryCodes } from "@/lib/phone-country-codes";
import { site } from "@/lib/site";

interface CartContactDetails {
  name: string;
  email: string;
  phone: string;
}

interface CartEnquiryItem {
  name: string;
  sku: string | null;
  quantity: number;
  variantSummary: string[];
}

const inputBaseClasses =
  "rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-gold focus:outline-none";

const inputClasses = `w-full ${inputBaseClasses} px-4 py-3`;

const labelClasses =
  "mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-neutral-500";

const countryCallingCodes = [
  ...new Set(phoneCountryCodes.map(({ code }) => code)),
].sort();

export function CartEnquiryForm({
  currency,
  contactDetails,
  items,
}: {
  currency: Currency;
  contactDetails: CartContactDetails;
  items: CartEnquiryItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [state, formAction, pending] = useActionState<
    CartFormState | undefined,
    FormData
  >(submitCartEnquiryAction, undefined);
  const contactPhone = contactDetails.phone.trim();
  const contactPhoneDigits = contactPhone.replace(/\D/g, "");
  const savedCountryCode = contactPhone.startsWith("+")
    ? [...phoneCountryCodes]
        .sort((a, b) => b.code.length - a.code.length)
        .find(({ code }) => contactPhoneDigits.startsWith(code.slice(1)))
    : undefined;
  const initialCountryCode = savedCountryCode?.code ?? "+91";
  const initialPhoneNumber = savedCountryCode
    ? contactPhoneDigits.slice(initialCountryCode.length - 1)
    : contactPhoneDigits;
  const whatsappMessage = [
    "Hi Aurja, I just submitted an order request.",
    `Request reference: ${requestId}`,
    "",
    "Items:",
    ...items.map((item) => {
      const options = item.variantSummary.length
        ? `; selected options: ${item.variantSummary.join(", ")}`
        : "";
      return `- ${item.name} (SKU: ${item.sku || "Not available"}) x ${
        item.quantity
      }${options}`;
    }),
    "",
    "Could you please help me with my order?",
  ].join("\n");
  const whatsappHref = `https://wa.me/${
    site.contact.whatsapp
  }?text=${encodeURIComponent(whatsappMessage)}`;

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
                  <div className="min-w-0">
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
                      Share your contact details and any custom requests. An
                      atelier specialist will be in touch within 24 hours.
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
                    <p
                      role="status"
                      className="text-sm leading-6 text-neutral-800"
                    >
                      {state.success}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-dark"
                      >
                        Done
                      </button>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1DA851]"
                      >
                        <WhatsAppIcon className="h-4 w-4" />
                        Get in touch now
                      </a>
                    </div>
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
                      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                        <div className="min-w-0">
                          <label
                            htmlFor="order-email"
                            className={labelClasses}
                          >
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
                        <div className="min-w-0">
                          <label
                            htmlFor="order-phone-number"
                            className={labelClasses}
                          >
                            Phone number
                          </label>
                          <div className="grid min-w-0 grid-cols-[4rem_minmax(0,1fr)] gap-2">
                            <select
                              name="phoneCountryCode"
                              aria-label="Country calling code"
                              autoComplete="tel-country-code"
                              defaultValue={initialCountryCode}
                              className={`${inputBaseClasses} w-16 px-1 py-1`}
                            >
                              {countryCallingCodes.map((code) => (
                                <option key={code} value={code}>
                                  {code}
                                </option>
                              ))}
                            </select>
                            <input
                              id="order-phone-number"
                              name="phoneNumber"
                              type="tel"
                              inputMode="numeric"
                              autoComplete="tel-national"
                              placeholder="98765 43210"
                              required
                              maxLength={20}
                              defaultValue={initialPhoneNumber}
                              className={`${inputClasses} min-w-0`}
                            />
                          </div>
                        </div>
                      </div>
                    </fieldset>

                    <div>
                      <label
                        htmlFor="order-notes"
                        className={labelClasses}
                      >
                        Customization notes{" "}
                        <span className="normal-case tracking-normal">
                          (optional)
                        </span>
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
                      <p
                        role="alert"
                        className="text-sm leading-6 text-red-600"
                      >
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
