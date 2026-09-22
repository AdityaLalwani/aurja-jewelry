import { CartContent } from "@/components/CartContent";
import { getCartIdFromCookie } from "@/lib/cart-session";
import { buildCartView } from "@/lib/cart-view";
import { getJewelryProducts, getSwellCart, type SwellCart } from "@/lib/swell";

export default async function CartPage() {
  let cart: SwellCart | null = null;
  const cartId = await getCartIdFromCookie();

  if (cartId) {
    try {
      cart = await getSwellCart(cartId);
    } catch {
      // A missing or expired cart is rendered as an empty cart.
    }
  }

  const products = await getJewelryProducts();
  const view = buildCartView(cart, products);

  return <CartContent view={view} />;
}
