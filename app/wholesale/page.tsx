import { TradePageShell } from "@/components/b2b/TradePage";
import { getTradeMetadata } from "@/lib/trade-content";

export const metadata = getTradeMetadata("wholesale");

export default function WholesalePage() {
  return <TradePageShell slug="wholesale" />;
}
