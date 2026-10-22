import { CartSnapshotSync } from "@/components/CartSnapshotSync";
import { getCartIdFromCookie } from "@/lib/cart-session";
import { getSwellCart } from "@/lib/swell";

export async function CartSnapshot() {
  const cartId = await getCartIdFromCookie();
  if (!cartId) {
    return <CartSnapshotSync slugs={[]} count={0} />;
  }

  let cart: Awaited<ReturnType<typeof getSwellCart>>;
  try {
    cart = await getSwellCart(cartId);
  } catch (error) {
    console.error("Could not load the cart snapshot", error);
    return <CartSnapshotSync slugs={[]} count={0} />;
  }

  const slugs = (cart?.items ?? [])
    .map((item) => item.metadata?.slug)
    .filter(
      (slug): slug is string => typeof slug === "string" && slug.length > 0,
    );
  const count =
    cart?.item_quantity ??
    (cart?.items ?? []).reduce((total, item) => total + item.quantity, 0);

  return <CartSnapshotSync slugs={slugs} count={count} />;
}
