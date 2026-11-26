import { TradePageShell } from "@/components/b2b/TradePage";
import { getTradeMetadata } from "@/lib/trade-content";

export const metadata = getTradeMetadata("custom-jewellery-manufacturing");

export default function CustomJewelleryManufacturingPage() {
  return <TradePageShell slug="custom-jewellery-manufacturing" />;
}
