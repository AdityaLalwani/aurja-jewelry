import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBasePriceUpdatePlan,
  buildPriceUpdatePlan,
  buildSkuPriceUpdatePlan,
  calculatePrice,
  convertInrToUsd,
  parsePriceBreakup,
  validateSkuPriceMap,
} from "./update-variant-prices-from-breakup.mjs";

const breakup = {
  nwsilver: 2.4,
  nw9k: 2.1,
  nw14k: 2.35,
  nw18k: 2.5,
  silverlabour: 180,
  goldlabour: 250,
  Stonecost: 1200,
};

test("price formulas apply purity, labour, and stone costs", () => {
  assert.equal(calculatePrice("925silver", breakup, { silverrate: 100, goldrate: 6000 }), 1872);
  assert.equal(calculatePrice("9k", breakup, { silverrate: 100, goldrate: 6000 }), 6765);
  assert.equal(calculatePrice("14k", breakup, { silverrate: 100, goldrate: 6000 }), 10248);
  assert.equal(calculatePrice("18k", breakup, { silverrate: 100, goldrate: 6000 }), 13225);
});

test("INR prices convert to USD and standalone USD products get INR prices", () => {
  assert.equal(convertInrToUsd(1872, 0.01), 18.72);
  const plan = buildBasePriceUpdatePlan(
    { id: "standalone", price: 29.06 },
    0.01,
  );
  assert.equal(plan.product.price, 29.06);
  assert.equal(plan.product.price_inr, 2906);
});

test("SKU price mapping validates values and updates USD from the supplied INR", () => {
  const prices = validateSkuPriceMap({ "asj001": 19623.96 });
  assert.deepEqual(prices, { ASJ001: 19623.96 });
  const plan = buildSkuPriceUpdatePlan(
    { id: "product-1", sku: "ASJ001", price: 0, attributes: { color: "gold" } },
    prices.ASJ001,
    0.01,
  );
  assert.equal(plan.product.price_inr, 19624);
  assert.equal(plan.product.price, 196.24);
  assert.equal(plan.product.attributes.price_usd, 196.24);
  assert.equal(plan.product.attributes.color, "gold");
  assert.throws(() => validateSkuPriceMap({ ASJ001: 0 }), /positive number/);
});

test("breakup accepts JSON text and rejects missing or invalid values", () => {
  assert.deepEqual(parsePriceBreakup(JSON.stringify(breakup), "ring"), breakup);
  assert.deepEqual(
    parsePriceBreakup("2.4|2.1|2.35|2.5|180|250|1200", "ring"),
    breakup,
  );
  assert.throws(
    () => parsePriceBreakup({ ...breakup, nw14k: "bad" }, "ring"),
    /price_breakup\.nw14k/,
  );
});

test("variant pricing updates INR variant and metal option prices, retaining other fields", () => {
  const product = {
    id: "ring",
    price_inr: 0,
    attributes: { price_breakup: breakup },
    options: [
      {
        id: "metal",
        name: "Metal",
        values: [
          { id: "silver", name: "925 Silver", price_inr: 0 },
          { id: "gold", name: "18K Gold", price_inr: 0 },
        ],
      },
    ],
  };
  const variants = [
    {
      id: "silver-variant",
      selected_options: { Metal: "925 Silver" },
      price: 99,
    },
    {
      id: "gold-variant",
      name: "18K Gold",
    },
  ];

  const plan = buildPriceUpdatePlan(product, variants, {
    silverrate: 100,
    goldrate: 6000,
  }, 0.01);

  assert.equal(plan.product.price_inr, 1872);
  assert.equal(plan.product.price, 18.72);
  assert.equal(plan.product.attributes.price_usd, 18.72);
  assert.equal(plan.product.options[0].values[0].price, 18.72);
  assert.equal(plan.product.options[0].values[0].price_inr, 1872);
  assert.equal(plan.product.options[0].values[1].price_inr, 13225);
  assert.equal(plan.variants[0].price_inr, 1872);
  assert.equal(plan.variants[0].price, 18.72);
  assert.equal(plan.variants[1].price_inr, 13225);
  assert.equal(plan.variants[1].price, 132.25);
  assert.throws(
    () =>
      buildPriceUpdatePlan(
        product,
        [{ id: "unmapped" }],
        { silverrate: 100, goldrate: 6000 },
        0.01,
      ),
    /no recognized metal selection/,
  );
});
