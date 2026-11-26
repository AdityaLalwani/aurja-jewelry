import { TradePageShell } from "@/components/b2b/TradePage";
import { getTradeMetadata } from "@/lib/trade-content";

export const metadata = getTradeMetadata("become-a-partner");

export default function BecomeAPartnerPage() {
  return <TradePageShell slug="become-a-partner" />;
}
