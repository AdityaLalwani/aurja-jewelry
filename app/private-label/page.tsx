import { TradePageShell } from "@/components/b2b/TradePage";
import { getTradeMetadata } from "@/lib/trade-content";

export const metadata = getTradeMetadata("private-label");

export default function PrivateLabelPage() {
  return <TradePageShell slug="private-label" />;
}
