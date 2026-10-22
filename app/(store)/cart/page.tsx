import { CartContent } from "@/components/CartContent";
import { getCartIdFromCookie } from "@/lib/cart-session";
import { buildCartView } from "@/lib/cart-view";
import { getSessionAccountId } from "@/lib/session";
import {
  getSwellAccount,
  getSwellCart,
} from "@/lib/swell";

async function getExpandedCart(cartId: string) {
  try {
    return await getSwellCart(cartId, { expand: ["items.product"] });
  } catch (error) {
    console.error("Could not load the cart page", error);
    return null;
  }
}

export default async function CartPage() {
  const [cartId, accountId] = await Promise.all([
    getCartIdFromCookie(),
    getSessionAccountId(),
  ]);
  const [cart, account] = await Promise.all([
    cartId ? getExpandedCart(cartId) : Promise.resolve(null),
    accountId ? getSwellAccount(accountId) : Promise.resolve(null),
  ]);
  const view = buildCartView(cart);
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
