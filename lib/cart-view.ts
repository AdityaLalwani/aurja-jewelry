import {
  mapSwellProduct,
  type JewelryProduct,
  type SwellCart,
  type SwellCartItem,
} from "@/lib/swell";

/* ---------------------------------------------------------------------------
 * Cart view model — the shape the storefront UI renders, decoupled from the
 * raw Swell cart record. Expanded Swell products provide images, attributes,
 * and dual-currency pricing without loading the entire catalog. The stored
 * slug remains the product-link fallback. Pure view-model code.
 * ------------------------------------------------------------------------- */

export interface CartItemView {
  /** Swell cart item id — mutations reference items by this id. */
  id: string;
  productId: string;
  /** Catalog slug when the item maps to a storefront product, else null. */
  slug: string | null;
  name: string;
  image: string | null;
  attributes: JewelryProduct["attributes"] | null;
  /** Unit price from the Swell cart, in the cart's store currency. */
  price: number;
  /** Catalog unit prices, when the item maps to a storefront product. */
  priceInr: number | null;
  priceUsd: number | null;
  quantity: number;
}

export interface CartView {
  /** Swell cart id; empty string when there is no cart yet. */
  id: string;
  /** Swell store currency for the cart, e.g. "INR". */
  currency: string | null;
  /** Number of item lines. */
  itemCount: number;
  /** Total quantity across items (drives the header badge). */
  itemQuantity: number;
  /** Swell-computed subtotal, in the cart's store currency. */
  subTotal: number | null;
  items: CartItemView[];
}

export const EMPTY_CART_VIEW: CartView = {
  id: "",
  currency: null,
  itemCount: 0,
  itemQuantity: 0,
  subTotal: null,
  items: [],
};

/** Client-safe money formatter shared by the server cart page and the cart islands. */
export function formatAmount(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat(currencyCode === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

function readSlug(item: SwellCartItem): string | null {
  const slug = item.metadata?.slug;
  return typeof slug === "string" && slug ? slug : null;
}

function buildCartItemView(
  item: SwellCartItem,
): CartItemView {
  const expandedProduct = item.product
    ? mapSwellProduct(item.product)
    : undefined;
  const slug = readSlug(item) ?? expandedProduct?.slug ?? null;
  const product = expandedProduct;

  return {
    id: item.id,
    productId: item.product_id,
    slug,
    name: product?.name ?? item.product_name ?? "Piece from the collection",
    image: product?.images[0] ?? null,
    attributes: product?.attributes ?? null,
    price: item.price,
    priceInr: product ? product.price_inr : null,
    priceUsd: product ? product.attributes.price_usd : null,
    quantity: item.quantity,
  };
}

export function buildCartView(
  cart: SwellCart | null,
): CartView {
  if (!cart) {
    return EMPTY_CART_VIEW;
  }

  const items = (cart.items ?? []).map((item) =>
    buildCartItemView(item),
  );

  return {
    id: cart.id,
    currency: cart.currency ?? null,
    itemCount: items.length,
    itemQuantity: cart.item_quantity ?? items.reduce((sum, item) => sum + item.quantity, 0),
    subTotal: cart.sub_total ?? null,
    items,
  };
}
