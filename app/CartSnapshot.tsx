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
    cart = await getSwellCart(cartId, { expand: ["items.product"] });
  } catch (error) {
    console.error("Could not load the cart snapshot", error);
    return <CartSnapshotSync slugs={[]} count={0} />;
  }

  const cartItems = cart?.items ?? [];
  const slugs = cartItems
    .map((item) => {
      const metadataSlug = item.metadata?.slug;
      const productSlug = item.product?.slug;
      return typeof metadataSlug === "string" && metadataSlug.length > 0
        ? metadataSlug
        : typeof productSlug === "string" && productSlug.length > 0
          ? productSlug
          : null;
    })
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);
  const variantKeys = cartItems
    .map((item) => {
      const slug =
        typeof item.metadata?.slug === "string" && item.metadata.slug.length > 0
          ? item.metadata.slug
          : typeof item.product?.slug === "string" && item.product.slug.length > 0
            ? item.product.slug
            : null;
      const explicitKey =
        typeof item.metadata?.variant_key === "string" && item.metadata.variant_key
          ? item.metadata.variant_key
          : Array.isArray(item.options) && item.options.length > 0
            ? item.options
                .filter((option) => option.name && option.value)
                .map((option) => `${String(option.name).trim()}:${String(option.value).trim()}`)
                .sort()
                .join("|")
            : "default";
      return slug ? `${slug}::${explicitKey}` : null;
    })
    .filter((key): key is string => Boolean(key));
  const count =
    cart?.item_quantity ??
    cartItems.reduce((total, item) => total + item.quantity, 0);

  return <CartSnapshotSync slugs={slugs} count={count} variantKeys={variantKeys} />;
}
