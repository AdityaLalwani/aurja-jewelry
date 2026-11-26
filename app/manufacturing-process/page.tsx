import { TradePageShell } from "@/components/b2b/TradePage";
import { getTradeMetadata } from "@/lib/trade-content";

export const metadata = getTradeMetadata("manufacturing-process");

export default function ManufacturingProcessPage() {
  return <TradePageShell slug="manufacturing-process" />;
}
