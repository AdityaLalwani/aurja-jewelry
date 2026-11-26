import { CartContent } from "@/components/CartContent";
import { StoreAvailabilityNotice } from "@/components/StoreAvailabilityNotice";
import { getIsIndiaStorefront } from "@/lib/storefront-region";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  return (await getIsIndiaStorefront()) ? (
    <CartContent contactDetails={{ name: "", email: "", phone: "" }} />
  ) : (
    <StoreAvailabilityNotice />
  );
}
