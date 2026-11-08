"use server";

import {
  getDefaultVariantSelections,
  getFirstImageUrl,
  getJewelryProductBySlug,
  getSelectedVariantPrice,
  isNaturalGemstoneSelection,
} from "@/lib/swell";
import type { LocalCartItem } from "@/lib/cart-view";
import { phoneCountryCodes } from "@/lib/phone-country-codes";

export interface CartFormState {
  error?: string;
  success?: string;
  localCartItem?: LocalCartItem;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+[^\s@]*\.[^\s@]+$/;
const MIN_ITEM_QUANTITY = 1;
const MAX_ITEM_QUANTITY = 99;

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Quantities are clamped server-side; the client's −/+ controls are a convenience, not a boundary. */
function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) {
    return MIN_ITEM_QUANTITY;
  }
  return Math.min(
    MAX_ITEM_QUANTITY,
    Math.max(MIN_ITEM_QUANTITY, Math.round(value)),
  );
}

export async function addToCartAction(
  _prevState: CartFormState | undefined,
  formData: FormData,
): Promise<CartFormState> {
  const slug = readField(formData, "slug");
  const quantity = clampQuantity(Number(readField(formData, "quantity")));
  const selectedOptionsField = readField(formData, "selectedOptions");
  if (!slug) {
    return { error: "This piece is no longer available." };
  }

  try {
    const product = await getJewelryProductBySlug(slug);
    if (!product || product.slug !== slug) {
      return { error: "This piece is no longer available." };
    }

    let submittedOptions: unknown = {};
    if (selectedOptionsField) {
      try {
        submittedOptions = JSON.parse(selectedOptionsField);
      } catch {
        return { error: "Please refresh the page and try again." };
      }
    }
    if (
      !submittedOptions ||
      typeof submittedOptions !== "object" ||
      Array.isArray(submittedOptions) ||
      Object.keys(submittedOptions).length > 20
    ) {
      return { error: "Please refresh the page and try again." };
    }

    const selections = Object.fromEntries(
      Object.entries(submittedOptions).flatMap(([name, value]) =>
        typeof value === "string" && value.trim()
          ? [[name, value.trim()]]
          : [],
      ),
    );
    const defaultSelections =
      Object.keys(selections).length > 0
        ? selections
        : getDefaultVariantSelections(product.variant_options ?? []);
    const selectedOptions: Array<{ name: string; value: string }> = [];
    const normalizedSelections: Record<string, string> = {};
    for (const [name, value] of Object.entries(defaultSelections)) {
      const option = product.variant_options?.find(
        (candidate) =>
          (candidate.name ?? "Option").trim().toLowerCase() ===
          name.trim().toLowerCase(),
      );
      const selectedValue = option?.values.find(
        (candidate) =>
          candidate.active !== false &&
          (candidate.name ?? "Value").trim().toLowerCase() ===
            value.trim().toLowerCase(),
      );
      if (!option || !selectedValue) {
        return { error: "A selection for this piece is no longer available." };
      }
      const optionName = (option.name ?? "Option").trim();
      const valueName = (selectedValue.name ?? "Value").trim();
      selectedOptions.push({ name: optionName, value: valueName });
      normalizedSelections[optionName] = valueName;
    }

    const variantKey =
      Object.entries(normalizedSelections)
        .map(([name, value]) => `${name}:${value}`)
        .sort()
        .join("|") || "default";
    const selectedPriceUsd = getSelectedVariantPrice(
      product.variant_options ?? [],
      normalizedSelections,
    );
    const selectedPriceInr = getSelectedVariantPrice(
      product.variant_options ?? [],
      normalizedSelections,
      "INR",
    );
    const naturalGemstoneSelected = isNaturalGemstoneSelection(
      product.variant_options ?? [],
      normalizedSelections,
    );
    const localCartItem: LocalCartItem = {
      id: `local-${JSON.stringify([product.id ?? product.slug, variantKey])}`,
      productId: product.id ?? product.slug,
      slug: product.slug,
      name: product.name,
      sku: product.sku ?? null,
      image: getFirstImageUrl(product.images) ?? null,
      attributes: product.attributes,
      variantSummary: selectedOptions.map(
        ({ name, value }) => `${name}: ${value}`,
      ),
      showPriceOnRequest: naturalGemstoneSelected,
      price: selectedPriceUsd || product.attributes.price_usd,
      priceInr: naturalGemstoneSelected
        ? null
        : selectedPriceInr || product.price_inr,
      priceUsd: naturalGemstoneSelected
        ? null
        : selectedPriceUsd || product.attributes.price_usd,
      quantity,
      variantKey,
      selectedOptions,
    };
    return { success: "Added", localCartItem };
  } catch (error) {
    console.error("Add to cart failed", error);
    return {
      error:
        process.env.NODE_ENV !== "production" && error instanceof Error
          ? error.message
          : "We could not add this piece to your cart right now. Please try again in a moment.",
    };
  }
}

export async function submitProductEnquiryAction(
  _prevState: CartFormState | undefined,
  formData: FormData,
): Promise<CartFormState> {
  const requestId = readField(formData, "requestId");
  const slug = readField(formData, "slug");
  const name = readField(formData, "name");
  const email = readField(formData, "email").toLowerCase();
  const phoneCountryCode = readField(formData, "phoneCountryCode");
  const phoneNumber = readField(formData, "phoneNumber");
  const phone = `${phoneCountryCode}${phoneNumber.replace(/\D/g, "")}`;
  const currency = readField(formData, "currency");
  const selectedOptionsJson = readField(formData, "selectedOptions");

  if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
    return { error: "Please reopen the form and try again." };
  }
  if (selectedOptionsJson.length > 4000) {
    return { error: "Please refresh the page and try again." };
  }
  let submittedOptions: Record<string, unknown> = {};
  if (selectedOptionsJson) {
    try {
      const parsed: unknown = JSON.parse(selectedOptionsJson);
      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed) ||
        Object.keys(parsed).length > 20
      ) {
        return { error: "Please refresh the page and try again." };
      }
      submittedOptions = parsed as Record<string, unknown>;
    } catch {
      return { error: "Please refresh the page and try again." };
    }
  }
  if (!slug || slug.length > 200) {
    return { error: "This piece is no longer available." };
  }
  if (!name || name.length > 120) {
    return { error: "Please enter your name." };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { error: "Please enter a valid email address." };
  }
  if (
    !phoneCountryCodes.some(({ code }) => code === phoneCountryCode) ||
    phoneNumber.length > 20 ||
    !/^[0-9\s().-]+$/.test(phoneNumber)
  ) {
    return {
      error: "Please select a country code and enter a valid phone number.",
    };
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (
    !/^\+[0-9\s().-]+$/.test(phone) ||
    phoneDigits.length < 8 ||
    phoneDigits.length > 15
  ) {
    return {
      error: "Please enter a valid phone number.",
    };
  }
  if (currency !== "INR" && currency !== "USD") {
    return { error: "Please refresh the page and try again." };
  }

  try {
    const product = await getJewelryProductBySlug(slug);
    if (!product || product.slug !== slug) {
      return { error: "This piece is no longer available." };
    }

    const selectedOptions: { name: string; value: string }[] = [];
    const normalizedSelectedOptions: Record<string, string> = {};
    for (const [optionName, rawValue] of Object.entries(submittedOptions)) {
      if (
        !optionName.trim() ||
        optionName.length > 100 ||
        typeof rawValue !== "string" ||
        !rawValue.trim() ||
        rawValue.length > 100
      ) {
        return { error: "Please refresh the page and try again." };
      }
      const option = product.variant_options?.find(
        (candidate) =>
          (candidate.name ?? "Option").trim().toLowerCase() ===
          optionName.trim().toLowerCase(),
      );
      const value = option?.values.find(
        (candidate) =>
          candidate.active !== false &&
          (candidate.name ?? "Value").trim().toLowerCase() ===
            rawValue.trim().toLowerCase(),
      );
      if (!option || !value) {
        return { error: "Please refresh the page and try again." };
      }
      selectedOptions.push({
        name: (option.name ?? "Option").trim(),
        value: (value.name ?? "Value").trim(),
      });
      normalizedSelectedOptions[option.name ?? "Option"] =
        value.name ?? "Value";
    }

    const options = product.variant_options ?? [];
    const naturalGemstoneSelected = isNaturalGemstoneSelection(
      options,
      normalizedSelectedOptions,
    );
    const selectedVariantPrice = getSelectedVariantPrice(
      options,
      normalizedSelectedOptions,
    );
    const priceUsd = naturalGemstoneSelected
      ? 0
      : selectedVariantPrice > 0
        ? selectedVariantPrice
        : product.attributes.price_usd;
    const price =
      selectedOptions.length > 0
        ? currency === "INR"
          ? naturalGemstoneSelected
            ? 0
            : getSelectedVariantPrice(options, normalizedSelectedOptions, "INR") ||
              product.price_inr
          : priceUsd
        : currency === "INR"
          ? product.price_inr
          : product.attributes.price_usd;

    const specifications = product.sku ? [`SKU: ${product.sku}`] : [];
    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const webhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
    if (!webhookUrl || !webhookSecret) {
      console.error("Product enquiry notifications are not configured.");
      return {
        error:
          "We could not send your request to our team right now. Please try again later.",
      };
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "product-enquiry",
        requestId,
        name,
        email,
        phone,
        product: {
          name: product.name,
          slug: product.slug,
          price,
          currency,
          image: product.images[0] ?? "",
          specifications,
          selectedOptions,
        },
        secret: webhookSecret,
      }),
      cache: "no-store",
    });
    const responseText = await response.text();
    let result: { ok?: boolean; error?: string } | null = null;
    try {
      result = JSON.parse(responseText) as { ok?: boolean; error?: string };
    } catch {
      // Apps Script can return HTML when its deployment or authorization fails.
    }

    if (!response.ok || !result?.ok) {
      const detail =
        typeof result?.error === "string"
          ? result.error.slice(0, 200)
          : `Apps Script returned HTTP ${response.status} without a valid confirmation.`;
      console.error(
        `Product enquiry notification failed (HTTP ${response.status}): ${detail}`,
      );

      if (detail === "Invalid email" || detail === "Invalid source") {
        return {
          error:
            "The deployed enquiry service does not recognize product enquiries. Deploy the latest Code.gs as a new Apps Script web app version, then try again.",
        };
      }
      if (detail === "Unauthorized") {
        return {
          error:
            "The enquiry service rejected its authentication. Check that GOOGLE_SHEETS_WEBHOOK_SECRET matches the Apps Script AURJA_WEBHOOK_SECRET.",
        };
      }
      if (detail === "Invalid contact details") {
        return {
          error:
            "The enquiry service rejected the contact details. Enter a valid phone number with its country code and try again.",
        };
      }
      if (detail === "Invalid product details") {
        return {
          error:
            "The enquiry service rejected this product's details. Please contact Aurja so the team can assist.",
        };
      }
      if (detail.startsWith("Missing or invalid AURJA_SALES_EMAIL")) {
        return {
          error:
            "The sales notification address is missing or invalid. Please contact Aurja so the team can assist.",
        };
      }
      if (detail === "Missing spreadsheet ID") {
        return {
          error:
            "The enquiry service is missing its spreadsheet configuration. Please contact Aurja so the team can assist.",
        };
      }

      return {
        error:
          `We could not send your request to our team (${detail}). Please try again later or contact Aurja.`,
      };
    }
  } catch (error) {
    console.error(
      "Product enquiry submission failed",
      error instanceof Error ? error.message : String(error),
    );
    return {
      error:
        "We could not send your request to our team right now. Please try again later.",
    };
  }

  return {
    success:
      "Thank you — our team has received your enquiry and will be in touch soon.",
  };
}

async function notifyCartEnquiry(
  lead: object,
): Promise<CartFormState> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const webhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  if (!webhookUrl || !webhookSecret) {
    console.error("Order enquiry notifications are not configured.");
    return {
      error:
        "Our team notification service is not configured. Please contact the Aurja atelier to send your request.",
    };
  }

  try {
    const notificationResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "order-enquiry",
        ...lead,
        secret: webhookSecret,
      }),
      cache: "no-store",
    });
    const responseText = await notificationResponse.text();
    let notificationResult: { ok?: boolean; error?: string } | null = null;
    try {
      notificationResult = JSON.parse(responseText) as {
        ok?: boolean;
        error?: string;
      };
    } catch {
      // Apps Script may return an HTML error page when its deployment or
      // authorization is broken; keep that response out of the UI.
    }

    if (!notificationResponse.ok || !notificationResult?.ok) {
      const detail =
        typeof notificationResult?.error === "string"
          ? notificationResult.error.slice(0, 200)
          : `Apps Script returned HTTP ${notificationResponse.status} without a valid confirmation.`;
      console.error("Order enquiry notification failed", {
        status: notificationResponse.status,
        detail,
      });
      return {
        error: `We could not send your request to our team (${detail}). Please try again or contact Aurja.`,
      };
    }
  } catch (error) {
    console.error("Order enquiry notification request failed", error);
    return {
      error:
        "We could not reach the notification service. Please try again or contact the Aurja atelier.",
    };
  }

  return {
    success:
      "Thank you — your order request has been received. An Aurja atelier specialist will reach out within 24 hours.",
  };
}

interface LocalCartEnquiryInput {
  slug: string;
  quantity: number;
  selectedOptions: Array<{ name: string; value: string }>;
}

async function submitLocalCartEnquiry(
  input: string,
  details: {
    requestId: string;
    name: string;
    email: string;
    phone: string;
    customizationNotes: string;
    currency: "INR" | "USD";
  },
): Promise<CartFormState> {
  if (input.length > 20000) {
    return { error: "Please refresh the page and try again." };
  }

  let submitted: unknown;
  try {
    submitted = JSON.parse(input);
  } catch {
    return { error: "Please refresh the page and try again." };
  }
  if (!Array.isArray(submitted) || submitted.length === 0 || submitted.length > 50) {
    return { error: "Your cart is empty or invalid. Please refresh the page." };
  }

  const lines: LocalCartEnquiryInput[] = [];
  for (const value of submitted) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { error: "Please refresh the page and try again." };
    }
    const line = value as Record<string, unknown>;
    if (
      typeof line.slug !== "string" ||
      !line.slug ||
      line.slug.length > 200 ||
      typeof line.quantity !== "number" ||
      !Number.isInteger(line.quantity) ||
      line.quantity < MIN_ITEM_QUANTITY ||
      line.quantity > MAX_ITEM_QUANTITY ||
      !Array.isArray(line.selectedOptions) ||
      line.selectedOptions.length > 20
    ) {
      return { error: "Please refresh the page and try again." };
    }
    const selectedOptions: LocalCartEnquiryInput["selectedOptions"] = [];
    for (const optionValue of line.selectedOptions) {
      if (
        !optionValue ||
        typeof optionValue !== "object" ||
        Array.isArray(optionValue)
      ) {
        return { error: "Please refresh the page and try again." };
      }
      const option = optionValue as Record<string, unknown>;
      if (
        typeof option.name !== "string" ||
        !option.name.trim() ||
        option.name.length > 100 ||
        typeof option.value !== "string" ||
        !option.value.trim() ||
        option.value.length > 100
      ) {
        return { error: "Please refresh the page and try again." };
      }
      selectedOptions.push({
        name: option.name.trim(),
        value: option.value.trim(),
      });
    }
    lines.push({
      slug: line.slug,
      quantity: line.quantity,
      selectedOptions,
    });
  }

  let products: Array<Awaited<ReturnType<typeof getJewelryProductBySlug>>>;
  try {
    products = await Promise.all(
      lines.map(({ slug }) => getJewelryProductBySlug(slug)),
    );
  } catch (error) {
    console.error("Could not load products for local cart enquiry", error);
    return {
      error:
        "We could not prepare your order request. Please try again, or contact the Aurja atelier if the problem continues.",
    };
  }
  const items = [];
  for (const [index, line] of lines.entries()) {
    const product = products[index];
    if (!product || product.slug !== line.slug) {
      return { error: "A piece in your cart is no longer available." };
    }
    const normalizedOptions: Record<string, string> = {};
    const selectedOptions: Array<{ name: string; value: string }> = [];
    for (const selected of line.selectedOptions) {
      const option = product.variant_options?.find(
        (candidate) =>
          (candidate.name ?? "Option").trim().toLowerCase() ===
          selected.name.toLowerCase(),
      );
      const value = option?.values.find(
        (candidate) =>
          candidate.active !== false &&
          (candidate.name ?? "Value").trim().toLowerCase() ===
            selected.value.toLowerCase(),
      );
      if (!option || !value) {
        return { error: "A selection in your cart is no longer available." };
      }
      const optionName = (option.name ?? "Option").trim();
      const valueName = (value.name ?? "Value").trim();
      normalizedOptions[optionName] = valueName;
      selectedOptions.push({ name: optionName, value: valueName });
    }

    const naturalGemstoneSelected = isNaturalGemstoneSelection(
      product.variant_options ?? [],
      normalizedOptions,
    );
    const selectedPriceUsd = getSelectedVariantPrice(
      product.variant_options ?? [],
      normalizedOptions,
    );
    const selectedPriceInr = getSelectedVariantPrice(
      product.variant_options ?? [],
      normalizedOptions,
      "INR",
    );
    const unitPrice =
      naturalGemstoneSelected
        ? 0
        : details.currency === "INR"
          ? selectedPriceInr || product.price_inr
          : selectedPriceUsd || product.attributes.price_usd;
    const attributes = product.attributes;
    const specifications = [
      attributes.metal_color,
      attributes.metal_type,
      attributes.gold_purity,
      attributes.metal_weight_gms
        ? `${attributes.metal_weight_gms} g`
        : undefined,
      attributes.ring_size ?? attributes.size,
      attributes.gemstone_type,
      attributes.diamond_carat
        ? `${attributes.diamond_carat} ct diamond`
        : undefined,
    ].filter(
      (specification): specification is string =>
        typeof specification === "string" && specification.length > 0,
    );
    items.push({
      name: product.name,
      productId: product.id ?? product.slug,
      sku: product.sku ?? "",
      specifications: specifications.concat(
        selectedOptions.map(({ name, value }) => `${name}: ${value}`),
      ),
      quantity: line.quantity,
      unitPrice,
      lineTotal: unitPrice * line.quantity,
      selectedOptions,
    });
  }

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return notifyCartEnquiry(
    {
      status: "Pending Enquiry",
      ...details,
      createdAt: new Date().toISOString(),
      total,
      items,
    },
  );
}

export async function submitCartEnquiryAction(
  _prevState: CartFormState | undefined,
  formData: FormData,
): Promise<CartFormState> {
  const requestId = readField(formData, "requestId");
  const name = readField(formData, "name");
  const email = readField(formData, "email").toLowerCase();
  const phoneCountryCode = readField(formData, "phoneCountryCode");
  const phoneNumber = readField(formData, "phoneNumber");
  const phone = `${phoneCountryCode}${phoneNumber.replace(/\D/g, "")}`;
  const customizationNotes = readField(formData, "customizationNotes");
  const currency = readField(formData, "currency");

  if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
    return { error: "Please reopen the form and try again." };
  }
  if (!name || name.length > 120) {
    return { error: "Please enter your name." };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { error: "Please enter a valid email address." };
  }
  if (
    !phoneCountryCodes.some(({ code }) => code === phoneCountryCode) ||
    phoneNumber.length > 20 ||
    !/^[0-9\s().-]+$/.test(phoneNumber)
  ) {
    return { error: "Please select a country code and enter a valid phone number." };
  }
  const phoneDigits = phone.replace(/\D/g, "");
  if (
    !/^\+[0-9\s().-]+$/.test(phone) ||
    phoneDigits.length < 8 ||
    phoneDigits.length > 15
  ) {
    return { error: "Please enter a phone number with a country code." };
  }
  if (customizationNotes.length > 2000) {
    return { error: "Customization notes must be 2,000 characters or fewer." };
  }
  if (currency !== "INR" && currency !== "USD") {
    return { error: "Please refresh the page and try again." };
  }

  const localCartItems = readField(formData, "localCartItems");
  if (!localCartItems) {
    return { error: "Your cart is empty. Please refresh the page." };
  }
  return submitLocalCartEnquiry(localCartItems, {
    requestId,
    name,
    email,
    phone,
    customizationNotes,
    currency,
  });
}
