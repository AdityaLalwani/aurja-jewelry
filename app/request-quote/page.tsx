import { TradePageShell } from "@/components/b2b/TradePage";
import { RequestQuoteForm } from "./RequestQuoteForm";
import { getTradeMetadata } from "@/lib/trade-content";

export const metadata = getTradeMetadata("request-quote");

export default function RequestQuotePage() {
  return (
    <TradePageShell slug="request-quote">
      <section className="mt-12 border-t border-stone-200 pt-10">
        <h2 className="font-display text-2xl font-medium text-stone-900 sm:text-3xl">
          Share your trade requirement
        </h2>
        <RequestQuoteForm />
      </section>
    </TradePageShell>
  );
}
