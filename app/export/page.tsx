import { TradePageShell } from "@/components/b2b/TradePage";
import { getTradeMetadata } from "@/lib/trade-content";

export const metadata = getTradeMetadata("export");

export default function ExportPage() {
  return <TradePageShell slug="export" />;
}
