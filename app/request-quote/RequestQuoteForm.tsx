"use client";

import type { FormEvent } from "react";
import { site } from "@/lib/site";

const fieldClassName =
  "mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15";

export function RequestQuoteForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const fields = [
      ["Company", "company"],
      ["Country", "country"],
      ["Contact name", "name"],
      ["Business email", "email"],
      ["Phone / WhatsApp", "phone"],
      ["Product type", "productType"],
      ["Estimated quantity", "quantity"],
      ["Metal", "metal"],
      ["Diamond requirement", "diamond"],
      ["Target price", "targetPrice"],
      ["Requested timeline", "timeline"],
      ["Additional details", "details"],
    ];
    const message = fields
      .map(([label, name]) => {
        const value = String(formData.get(name) ?? "").trim();
        return value ? `${label}: ${value}` : "";
      })
      .filter(Boolean)
      .join("\n");
    const url = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(
      `Hello AURJA, I would like to discuss a trade quotation.\n\n${message}`,
    )}`;

    window.location.assign(url);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-5 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2 sm:p-8"
    >
      <div>
        <label htmlFor="rfq-company" className="text-sm font-medium text-stone-800">
          Company / brand
        </label>
        <input id="rfq-company" name="company" required maxLength={160} className={fieldClassName} />
      </div>
      <div>
        <label htmlFor="rfq-country" className="text-sm font-medium text-stone-800">
          Country
        </label>
        <input id="rfq-country" name="country" required maxLength={100} className={fieldClassName} />
      </div>
      <div>
        <label htmlFor="rfq-name" className="text-sm font-medium text-stone-800">
          Contact name
        </label>
        <input id="rfq-name" name="name" autoComplete="name" required maxLength={120} className={fieldClassName} />
      </div>
      <div>
        <label htmlFor="rfq-email" className="text-sm font-medium text-stone-800">
          Business email
        </label>
        <input id="rfq-email" name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClassName} />
      </div>
      <div>
        <label htmlFor="rfq-phone" className="text-sm font-medium text-stone-800">
          Phone / WhatsApp
        </label>
        <input id="rfq-phone" name="phone" type="tel" autoComplete="tel" required maxLength={32} className={fieldClassName} />
      </div>
      <div>
        <label htmlFor="rfq-type" className="text-sm font-medium text-stone-800">
          Product type
        </label>
        <select id="rfq-type" name="productType" required defaultValue="" className={fieldClassName}>
          <option value="" disabled>Select a product type</option>
          <option>Rings</option>
          <option>Earrings</option>
          <option>Necklaces / neckpieces</option>
          <option>Bracelets</option>
          <option>Other / custom requirement</option>
        </select>
      </div>
      <div>
        <label htmlFor="rfq-quantity" className="text-sm font-medium text-stone-800">
          Estimated quantity
        </label>
        <input id="rfq-quantity" name="quantity" required maxLength={100} placeholder="Share an estimate or range" className={fieldClassName} />
      </div>
      <div>
        <label htmlFor="rfq-metal" className="text-sm font-medium text-stone-800">
          Metal / purity
        </label>
        <select id="rfq-metal" name="metal" required defaultValue="" className={fieldClassName}>
          <option value="" disabled>Select a requirement</option>
          <option>9K gold</option>
          <option>10K gold</option>
          <option>14K gold</option>
          <option>18K gold</option>
          <option>Discuss options</option>
        </select>
      </div>
      <div>
        <label htmlFor="rfq-diamond" className="text-sm font-medium text-stone-800">
          Diamond requirement
        </label>
        <select id="rfq-diamond" name="diamond" required defaultValue="" className={fieldClassName}>
          <option value="" disabled>Select a requirement</option>
          <option>Natural diamonds</option>
          <option>Lab-grown diamonds</option>
          <option>Open to either / discuss</option>
        </select>
      </div>
      <div>
        <label htmlFor="rfq-target-price" className="text-sm font-medium text-stone-800">
          Target price and currency (optional)
        </label>
        <input id="rfq-target-price" name="targetPrice" maxLength={120} className={fieldClassName} />
      </div>
      <div>
        <label htmlFor="rfq-timeline" className="text-sm font-medium text-stone-800">
          Requested timeline
        </label>
        <input id="rfq-timeline" name="timeline" required maxLength={120} placeholder="Target sample or delivery date" className={fieldClassName} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="rfq-details" className="text-sm font-medium text-stone-800">
          Additional specifications (optional)
        </label>
        <textarea id="rfq-details" name="details" rows={4} maxLength={1500} className={fieldClassName} />
      </div>
      <p className="text-xs leading-5 text-stone-500 sm:col-span-2">
        Submitting opens WhatsApp with your enquiry for review. It does not
        place an order or confirm price, MOQ or delivery dates.
      </p>
      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-900 px-6 text-xs font-medium uppercase tracking-[0.16em] text-amber-50 transition-colors hover:bg-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 sm:col-span-2"
      >
        Continue to WhatsApp
      </button>
    </form>
  );
}
