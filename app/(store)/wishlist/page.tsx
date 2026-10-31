import { WishlistContent } from "@/components/WishlistContent";
import { getJewelryProducts } from "@/lib/swell";

export default async function WishlistPage() {
  const products = await getJewelryProducts();
  return <WishlistContent products={products} />;
}
