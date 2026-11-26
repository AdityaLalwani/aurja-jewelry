import { TradePageShell, TradeProductGrid } from "@/components/b2b/TradePage";
import { getTradeCatalogueProducts } from "@/lib/trade-catalogue";
import { getTradeMetadata } from "@/lib/trade-content";

export const metadata = getTradeMetadata("trade-catalogue");

export default async function TradeCataloguePage() {
  const products = await getTradeCatalogueProducts();

  return (
    <TradePageShell slug="trade-catalogue">
      <section className="mt-12 border-t border-stone-200 pt-10">
        <h2 className="font-display text-2xl font-medium text-stone-900 sm:text-3xl">
          Browse by published SKU
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">
          The catalogue is assembled from currently published products with
          AURJA trade SKU prefixes. Product specifications and available
          customisation are confirmed for each enquiry.
        </p>
        <TradeProductGrid products={products} />
      </section>
    </TradePageShell>
  );
}
