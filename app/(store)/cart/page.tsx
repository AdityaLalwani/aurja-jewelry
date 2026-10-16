import { CartContent } from "@/components/CartContent";
import { getCartIdFromCookie } from "@/lib/cart-session";
import { buildCartView } from "@/lib/cart-view";
import { getSessionAccountId } from "@/lib/session";
import {
  getJewelryProducts,
  getSwellAccount,
  getSwellCart,
  type SwellCart,
} from "@/lib/swell";

export default async function CartPage() {
  const [cartId, accountId] = await Promise.all([
    getCartIdFromCookie(),
    getSessionAccountId(),
  ]);
  let cart: SwellCart | null = null;

  if (cartId) {
    try {
      cart = await getSwellCart(cartId);
    } catch {
      // A missing or expired cart is rendered as an empty cart.
    }
  }

  const [products, account] = await Promise.all([
    getJewelryProducts(),
    accountId ? getSwellAccount(accountId) : Promise.resolve(null),
  ]);
  const view = buildCartView(cart, products);
  const contactDetails = {
    name:
      [account?.first_name, account?.last_name].filter(Boolean).join(" ") ||
      account?.name ||
      "",
    email: account?.email ?? "",
    phone: account?.phone ?? "",
  };

  return <CartContent view={view} contactDetails={contactDetails} />;
}
