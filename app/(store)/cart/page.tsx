import { CartContent } from "@/components/CartContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartContent contactDetails={{ name: "", email: "", phone: "" }} />;
}
