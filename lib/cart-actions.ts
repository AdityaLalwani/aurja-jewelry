"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createSwellCart,
  deleteSwellCart,
  findSwellProductBySlug,
  getSwellCart,
  updateSwellCart,
  type SwellCart,
} from "@/lib/swell";
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

/**
 * The cart a request belongs to always comes from the signed `aurja_cart`
 * cookie — never from form data, so a crafted submission cannot act on
 * another shopper's cart. Returns null when the cookie is missing, fails
 * signature validation, or points at a cart Swell no longer returns; callers
 * then take the guest path (fresh cart on add, empty-cart page on read).
 * Non-404 lookup errors are rethrown for the caller's catch to report.
 */
async function resolveCart(): Promise<ResolvedCart | null> {
  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    return null;
  }

  try {
    const cart = await getSwellCart(cartId);
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
    const product = await findSwellProductBySlug(slug);
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

    const resolved = await resolveCart();
    if (!resolved) {
      // No usable cart yet — first visit, stale cookie, or a cart Swell has
      // since discarded. Creating one also overwrites the stale cookie.
      const cart = await createSwellCart({
        items: [item],
      });
      await createCartCookie(cart.id);
    } else {
      const existing = resolved.cart.items?.find(
        (item) => item.product_id === product.id,
      );
      if (existing) {
        // Items already in the cart are referenced by their cart-item id; a
        // product_id-only input would append a duplicate line instead.
        await updateSwellCart(resolved.cartId, {
          items: [
            {
              id: existing.id,
              quantity: clampQuantity(existing.quantity + quantity),
            },
          ],
        });
      } else {
        // Without $set, a PUT merges the items array — this appends the new
        // line while keeping the existing ones.
        await updateSwellCart(resolved.cartId, {
          items: [item],
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

    // Membership check: the item id must belong to this cart, not just any cart.
    if (!resolved.cart.items?.some((item) => item.id === itemId)) {
      return { error: "This item is no longer in your cart." };
    }

    await updateSwellCart(resolved.cartId, {
      items: [{ id: itemId, quantity }],
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
      .map((item) => ({
        id: item.id,
        product_id: item.product_id,
        ...(item.variant_id ? { variant_id: item.variant_id } : {}),
        quantity: item.quantity,
        ...(item.options ? { options: item.options } : {}),
        ...(item.metadata ? { metadata: item.metadata } : {}),
      }));

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

export async function submitCartEnquiryAction(
  _prevState: CartFormState | undefined,
  formData: FormData,
): Promise<CartFormState> {
  const name = readField(formData, "name");
  const email = readField(formData, "email").toLowerCase();
  const phone = readField(formData, "phone");
  const message = readField(formData, "message");

  if (!name) {
    return { error: "Please enter your name." };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const resolved = await resolveCart();
    if (!resolved) {
      return { error: "Your cart has expired." };
    }

    // The cart is the lead: contact details are stored on the cart's
    // metadata so the enquiry lands in Swell BM with the items attached.
    // The cart and cookie are kept — follow-up happens in the BM.
    await updateSwellCart(resolved.cartId, {
      metadata: {
        lead: {
          name,
          email,
          ...(phone ? { phone } : {}),
          ...(message ? { message } : {}),
          date: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Swell enquiry save failed", error);
    return {
      error: "We could not send your enquiry right now. Please try again in a moment.",
    };
  }

  revalidatePath("/", "layout");
  return { success: "Thank you — our atelier will be in touch shortly." };
}
