import { WishlistContent } from "@/components/WishlistContent";
import { StoreAvailabilityNotice } from "@/components/StoreAvailabilityNotice";
import { getIsIndiaStorefront } from "@/lib/storefront-region";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
  robots: { index: false, follow: false },
};

export default async function WishlistPage() {
  return (await getIsIndiaStorefront()) ? (
    <WishlistContent />
  ) : (
    <StoreAvailabilityNotice />
  );
}
