"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSwellCart,
  deleteSwellCart,
  getJewelryProductBySlug,
  findSwellProductBySlug,
  getSwellCart,
  updateSwellCart,
  type SwellCart,
  type SwellCartItem,
  type SwellCartItemInput,
} from "@/lib/swell";
import { buildCartView } from "@/lib/cart-view";
import { getSessionAccountId } from "@/lib/session";
import {
  clearCartCookie,
  createCartCookie,
  getCartIdFromCookie,
} from "@/lib/cart-session";

export interface CartFormState {
  error?: string;
  success?: string;
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

interface SwellFetchError extends Error {
  status?: number;
  data?: unknown;
}

function isSwellNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "status" in error &&
    (error as SwellFetchError).status === 404
  );
}

interface ResolvedCart {
  cartId: string;
  cart: SwellCart;
}

function toCartItemInput(
  item: SwellCartItem,
  quantity = item.quantity,
): SwellCartItemInput {
  return {
    id: item.id,
    product_id: item.product_id,
    ...(item.variant_id ? { variant_id: item.variant_id } : {}),
    quantity,
    ...(item.options ? { options: item.options } : {}),
    ...(item.metadata ? { metadata: item.metadata } : {}),
  };
}

/**
 * The cart a request belongs to always comes from the signed `aurja_cart`
 * cookie — never from form data, so a crafted submission cannot act on
 * another shopper's cart. Returns null when the cookie is missing, fails
 * signature validation, or points at a cart Swell no longer returns; callers
 * then take the guest path (fresh cart on add, empty-cart page on read).
 * Non-404 lookup errors are rethrown for the caller's catch to report.
 */
async function resolveCart(expandProducts = false): Promise<ResolvedCart | null> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    return null;
  }

  try {
    const cart = await getSwellCart(
      cartId,
      expandProducts ? { expand: ["items.product"] } : undefined,
    );
    return cart ? { cartId, cart } : null;
  } catch (error) {
    if (isSwellNotFoundError(error)) {
      return null;
    }
    throw error;
  }
}

export async function addToCartAction(
  _prevState: CartFormState | undefined,
  formData: FormData,
): Promise<CartFormState> {
  const slug = readField(formData, "slug");
  const quantity = clampQuantity(Number(readField(formData, "quantity")));
  const redirectToCart = readField(formData, "redirect") === "cart";

  if (!slug) {
    return { error: "This piece is no longer available." };
  }

  try {
    // Resolve the product server-side from the slug alone — the client
    // never supplies a product id or price.
    const [product, resolved] = await Promise.all([
      findSwellProductBySlug(slug),
      resolveCart(),
    ]);
    if (!product) {
      return { error: "This piece is no longer available." };
    }
    const variantId = product.variants?.results?.find(
      (variant) => variant.active !== false,
    )?.id;
    const item = {
      product_id: product.id,
      quantity,
      metadata: { slug },
      ...(variantId ? { variant_id: variantId } : {}),
    };

    if (!resolved) {
      // No usable cart yet — first visit, stale cookie, or a cart Swell has
      // since discarded. Creating one also overwrites the stale cookie.
      const cart = await createSwellCart({
        items: [item],
      });
      await createCartCookie(cart.id);
    } else {
      const cartItems = resolved.cart.items ?? [];
      const existing = cartItems.find(
        (item) => item.product_id === product.id,
      );
      const updatedItems = cartItems.map((cartItem) =>
        existing?.id === cartItem.id
          ? toCartItemInput(
              cartItem,
              clampQuantity(cartItem.quantity + quantity),
            )
          : toCartItemInput(cartItem),
      );

      if (existing) {
        await updateSwellCart(resolved.cartId, {
          $set: { items: updatedItems },
        });
      } else {
        await updateSwellCart(resolved.cartId, {
          $set: { items: [...updatedItems, item] },
        });
      }
    }
  } catch (error) {
    console.error("Swell add to cart failed", error);
    return {
      error:
        "We could not add this piece to your cart right now. Please try again in a moment.",
    };
  }

  // Revalidate before redirect so /cart renders with the fresh cart.
  revalidatePath("/", "layout");
  if (redirectToCart) {
    redirect("/cart");
  }
  return { success: "Added" };
}

export async function updateCartItemQuantityAction(
  _prevState: CartFormState | undefined,
  formData: FormData,
): Promise<CartFormState> {
  const itemId = readField(formData, "itemId");
  const quantity = clampQuantity(Number(readField(formData, "quantity")));

  if (!itemId) {
    return { error: "This item is no longer in your cart." };
  }

  try {
    const resolved = await resolveCart();
    if (!resolved) {
      return { error: "Your cart has expired." };
    }

    const cartItems = resolved.cart.items ?? [];
    // Membership check: the item id must belong to this cart, not just any cart.
    if (!cartItems.some((item) => item.id === itemId)) {
      return { error: "This item is no longer in your cart." };
    }

    const updatedItems = cartItems.map((item) =>
      item.id === itemId
        ? toCartItemInput(item, quantity)
        : toCartItemInput(item),
    );
    await updateSwellCart(resolved.cartId, {
      $set: { items: updatedItems },
    });
  } catch (error) {
    console.error("Swell cart quantity update failed", error);
    return {
      error: "We could not update your cart right now. Please try again in a moment.",
    };
  }

  revalidatePath("/", "layout");
  return {};
}

export async function removeCartItemAction(
  _prevState: CartFormState | undefined,
  formData: FormData,
): Promise<CartFormState> {
  const itemId = readField(formData, "itemId");

  if (!itemId) {
    return { error: "This item is no longer in your cart." };
  }

  try {
    const resolved = await resolveCart();
    if (!resolved) {
      return { error: "Your cart has expired." };
    }

    const items = resolved.cart.items ?? [];
    if (!items.some((item) => item.id === itemId)) {
      return { error: "This item is no longer in your cart." };
    }

    // Re-echo the surviving lines in full: $set replaces the items array
    // wholesale, so every field the line carries must be sent back.
    const kept = items
      .filter((item) => item.id !== itemId)
      .map((item) => toCartItemInput(item));

    if (kept.length === 0) {
      // Removing the last line empties the cart — delete the Swell record
      // so it does not linger as an empty cart, then clear the cookie. The
      // record may already be gone; a 404 is fine.
      try {
        await deleteSwellCart(resolved.cartId);
      } catch (deleteError) {
        if (!isSwellNotFoundError(deleteError)) {
          throw deleteError;
        }
      }
      await clearCartCookie();
    } else {
      await updateSwellCart(resolved.cartId, { $set: { items: kept } });
    }
  } catch (error) {
    console.error("Swell cart update failed", error);
    return {
      error: "We could not update your cart right now. Please try again in a moment.",
    };
  }

  revalidatePath("/", "layout");
  return {};
}

export async function submitProductEnquiryAction(
  _prevState: CartFormState | undefined,
  formData: FormData,
): Promise<CartFormState> {
  const requestId = readField(formData, "requestId");
  const slug = readField(formData, "slug");
  const name = readField(formData, "name");
  const email = readField(formData, "email").toLowerCase();
  const phone = readField(formData, "phone");
  const currency = readField(formData, "currency");

  if (!/^[0-9a-f-]{36}$/i.test(requestId)) {
    return { error: "Please reopen the form and try again." };
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
  const phoneDigits = phone.replace(/\D/g, "");
  if (
    !/^\+[0-9\s().-]+$/.test(phone) ||
    phoneDigits.length < 8 ||
    phoneDigits.length > 15 ||
    phone.length > 24
  ) {
    return {
      error: "Please enter a phone number with country code, such as +91 98765 43210.",
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

    const specifications = [
      product.attributes.metal_type,
      product.attributes.metal_color,
      product.attributes.gold_purity,
      product.attributes.metal_weight_gms
        ? `${product.attributes.metal_weight_gms} g`
        : undefined,
      product.attributes.ring_size ?? product.attributes.size,
      product.attributes.gemstone_type,
      product.attributes.diamond_carat
        ? `${product.attributes.diamond_carat} ct diamond`
        : undefined,
      product.attributes.diamond_clarity,
    ].filter(
      (value): value is string =>
        typeof value === "string" && value.length > 0 && value !== "N/A",
    );
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
          price: currency === "INR"
            ? product.price_inr
            : product.attributes.price_usd,
          currency,
          image: product.images[0] ?? "",
          specifications,
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

export async function submitCartEnquiryAction(
  _prevState: CartFormState | undefined,
  formData: FormData,
): Promise<CartFormState> {
  const requestId = readField(formData, "requestId");
  const name = readField(formData, "name");
  const email = readField(formData, "email").toLowerCase();
  const phone = readField(formData, "phone");
  const address1 = readField(formData, "address1");
  const address2 = readField(formData, "address2");
  const city = readField(formData, "city");
  const state = readField(formData, "state");
  const postalCode = readField(formData, "postalCode");
  const country = readField(formData, "country");
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
  const phoneDigits = phone.replace(/\D/g, "");
  if (
    !/^\+[0-9\s().-]+$/.test(phone) ||
    phoneDigits.length < 8 ||
    phoneDigits.length > 15
  ) {
    return { error: "Please enter a phone number with a country code." };
  }
  if (
    !address1 ||
    address1.length > 200 ||
    address2.length > 200 ||
    !city ||
    city.length > 100 ||
    !state ||
    state.length > 100 ||
    !postalCode ||
    postalCode.length > 20 ||
    !country ||
    country.length > 100
  ) {
    return { error: "Please complete all shipping address fields." };
  }
  if (customizationNotes.length > 2000) {
    return { error: "Customization notes must be 2,000 characters or fewer." };
  }
  if (currency !== "INR" && currency !== "USD") {
    return { error: "Please refresh the page and try again." };
  }

  try {
    const resolved = await resolveCart(true);
    if (!resolved) {
      return { error: "Your cart has expired." };
    }
    const cartItems = resolved.cart.items ?? [];
    if (cartItems.length === 0) {
      return { error: "Your cart is empty." };
    }

    const cartView = buildCartView(resolved.cart);
    const items = cartView.items.map((viewItem) => {
      const cartItem = cartItems.find((item) => item.id === viewItem.id);
      if (!cartItem) {
        throw new Error("Cart item details could not be matched.");
      }
      const unitPrice =
        currency === "INR"
          ? viewItem.priceInr ?? viewItem.price * 83
          : viewItem.priceUsd ?? viewItem.price;
      const attributes = viewItem.attributes;
      const specifications = [
        attributes?.metal_color,
        attributes?.metal_type,
        attributes?.gold_purity,
        attributes?.metal_weight_gms
          ? `${attributes.metal_weight_gms} g`
          : undefined,
        attributes?.ring_size ?? attributes?.size,
        attributes?.gemstone_type,
        attributes?.diamond_carat
          ? `${attributes.diamond_carat} ct diamond`
          : undefined,
      ]
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .concat(
          (cartItem.options ?? []).map((option) =>
            option.name ? `${option.name}: ${option.value}` : option.value,
          ),
        );

      return {
        name: viewItem.name,
        productId: viewItem.productId,
        ...(cartItem.variant_id ? { variantId: cartItem.variant_id } : {}),
        specifications,
        quantity: viewItem.quantity,
        unitPrice,
        lineTotal: unitPrice * viewItem.quantity,
        options: (cartItem.options ?? []).map((option) => ({
          name: option.name ?? "",
          value: option.value,
        })),
      };
    });
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingAddress = {
      name,
      phone,
      address1,
      ...(address2 ? { address2 } : {}),
      city,
      state,
      zip: postalCode,
      country,
    };
    const lead = {
      status: "Pending Enquiry",
      requestId,
      createdAt: new Date().toISOString(),
      name,
      email,
      phone,
      shippingAddress,
      customizationNotes,
      currency,
      total,
      items,
    };

    const accountId = await getSessionAccountId();
    try {
      await updateSwellCart(resolved.cartId, {
        shipping: shippingAddress,
        ...(accountId ? { account_id: accountId } : {}),
        metadata: {
          ...resolved.cart.metadata,
          lead,
        },
      });
    } catch (error) {
      console.error("Order enquiry save failed", error);
      return {
        error:
          "We could not save your order request. Please try again, or contact the Aurja atelier if the problem continues.",
      };
    }

    const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    const webhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
    if (!webhookUrl || !webhookSecret) {
      console.error("Order enquiry notifications are not configured.");
      return {
        error:
          "Your request was saved, but our team notification service is not configured. Please contact the Aurja atelier to confirm your request.",
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
          error: `Your request was saved, but the confirmation emails could not be sent (${detail}). Please verify that the Apps Script web app is redeployed and that AURJA_SALES_EMAIL is configured, then contact the Aurja atelier to confirm your request.`,
        };
      }
    } catch (error) {
      console.error("Order enquiry notification request failed", error);
      return {
        error:
          "Your request was saved, but we could not reach the notification service. Please verify the Apps Script deployment and contact the Aurja atelier to confirm your request.",
      };
    }
  } catch (error) {
    console.error("Order enquiry submission failed", error);
    return {
      error:
        "We could not prepare your order request. Please try again, or contact the Aurja atelier if the problem continues.",
    };
  }

  revalidatePath("/", "layout");
  return {
    success:
      "Thank you — your order request has been received. An Aurja atelier specialist will reach out within 24 hours.",
  };
}
