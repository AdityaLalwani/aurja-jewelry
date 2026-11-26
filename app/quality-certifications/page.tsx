import { TradePageShell } from "@/components/b2b/TradePage";
import { getTradeMetadata } from "@/lib/trade-content";

export const metadata = getTradeMetadata("quality-certifications");

export default function QualityCertificationsPage() {
  return <TradePageShell slug="quality-certifications" />;
}
