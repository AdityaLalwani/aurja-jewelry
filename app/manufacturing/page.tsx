import { TradePageShell } from "@/components/b2b/TradePage";
import { getTradeMetadata } from "@/lib/trade-content";

export const metadata = getTradeMetadata("manufacturing");

export default function ManufacturingPage() {
  return <TradePageShell slug="manufacturing" />;
}
