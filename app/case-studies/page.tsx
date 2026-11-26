import { TradePageShell } from "@/components/b2b/TradePage";
import { getTradeMetadata } from "@/lib/trade-content";

export const metadata = getTradeMetadata("case-studies");

export default function CaseStudiesPage() {
  return <TradePageShell slug="case-studies" />;
}
