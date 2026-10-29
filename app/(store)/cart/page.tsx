import { CartContent } from "@/components/CartContent";
import { getCartIdFromCookie } from "@/lib/cart-session";
import { buildCartView } from "@/lib/cart-view";
import { getSessionAccountId } from "@/lib/session";
import {
  findSwellProductById,
  getSwellAccount,
  getSwellCart,
  mapSwellProduct,
} from "@/lib/swell";

async function getExpandedCart(cartId: string) {
  return getSwellCart(cartId, {
    include: ["items"],
    expand: ["items.product"],
  });
}

export default async function CartPage() {
  const [cartId, accountId] = await Promise.all([
    getCartIdFromCookie(),
    getSessionAccountId(),
  ]);
  const cartPromise = cartId
    ? getExpandedCart(cartId).then(
        (cart) => ({ cart, loadError: false }),
        (error: unknown) => {
          console.error("Could not load the cart page", error);
          return { cart: null, loadError: true };
        },
      )
    : Promise.resolve({ cart: null, loadError: false });
  const [cartResult, account] = await Promise.all([
    cartPromise,
    accountId ? getSwellAccount(accountId) : Promise.resolve(null),
  ]);
  const { cart, loadError: cartLoadError } = cartResult;

  const productLookup = Object.fromEntries(
    (
      await Promise.all(
        (cart?.items ?? []).map(async (item) => {
          const product = await findSwellProductById(item.product_id);
          if (!product) {
            return null;
          }
          return [item.product_id, mapSwellProduct(product)];
        }),
      )
    ).filter(
      (entry): entry is [string, ReturnType<typeof mapSwellProduct>] =>
        Boolean(entry),
    ),
  );

  const view = buildCartView(cart, productLookup);
  const contactDetails = {
    name:
      [account?.first_name, account?.last_name].filter(Boolean).join(" ") ||
      account?.name ||
      "",
    email: account?.email ?? "",
    phone: account?.phone ?? "",
  };

  return (
    <CartContent
      view={view}
      contactDetails={contactDetails}
      loadError={cartLoadError}
    />
  );
}
