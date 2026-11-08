import type { JewelryProduct } from "@/lib/swell";

export interface LocalCartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  sku: string | null;
  image: string | null;
  attributes: JewelryProduct["attributes"] | null;
  variantSummary: string[];
  showPriceOnRequest: boolean;
  price: number;
  priceInr: number | null;
  priceUsd: number | null;
  quantity: number;
  variantKey: string;
  selectedOptions: Array<{ name: string; value: string }>;
}
