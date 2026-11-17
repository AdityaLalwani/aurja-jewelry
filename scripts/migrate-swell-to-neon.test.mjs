import assert from "node:assert/strict";
import test from "node:test";
import {
  sanitizeCustomerData,
  upsertPage,
} from "./migrate-swell-to-neon.mjs";

test("customer import removes credentials and card data recursively", () => {
  const source = {
    id: "customer-1",
    email: "customer@example.test",
    password: "hash",
    password_reset_url: "reset-url",
    billing: {
      address1: "Example Street",
      card: { token: "payment-token" },
    },
    cards: [{ last4: "4242" }],
  };
  const redactions = { count: 0 };

  const sanitized = sanitizeCustomerData(source, redactions);

  assert.deepEqual(sanitized, {
    id: "customer-1",
    email: "customer@example.test",
    billing: { address1: "Example Street" },
  });
  assert.equal(redactions.count, 4);
  assert.equal(source.password, "hash");
});

test("product import preserves options and full product fields", async () => {
  const queries = [];
  const product = {
    id: "product-1",
    name: "Gold Ring",
    options: [{ id: "size", name: "Size", values: [{ id: "7", name: "7" }] }],
    attributes: { metal: "gold" },
    images: [{ file: { url: "https://cdn.example.test/ring.jpg" } }],
    stock_level: 5,
    custom_field: { retained: true },
  };

  await upsertPage(
    {
      async query(sql, values) {
        queries.push({ sql, values });
      },
    },
    { name: "products", table: "swell_products" },
    [product],
  );

  assert.match(queries[0].sql, /INSERT INTO swell_products/);
  assert.equal(queries[0].values[0], product.id);
  assert.deepEqual(JSON.parse(queries[0].values[1]), product);
});

test("variant import stores the complete payload and its parent product id", async () => {
  const queries = [];
  const variant = {
    id: "variant-1",
    parent_id: "product-1",
    name: "Gold / 18 inch",
    option_value_ids: ["gold", "18-inch"],
    price: 1200,
    stock_level: 3,
    stock: [{ quantity: 3, location_id: "warehouse-1" }],
  };

  await upsertPage(
    {
      async query(sql, values) {
        queries.push({ sql, values });
      },
    },
    { name: "products:variants", table: "swell_variants", variants: true },
    [variant],
  );

  assert.match(queries[0].sql, /INSERT INTO swell_variants \(swell_id, parent_id, payload, source_updated_at\)/);
  assert.equal(queries[0].values[0], variant.id);
  assert.equal(queries[0].values[1], variant.parent_id);
  assert.deepEqual(JSON.parse(queries[0].values[2]), variant);
});

test("variant import rejects records without a parent product", async () => {
  await assert.rejects(
    upsertPage(
      { query: async () => assert.fail("Should not write invalid variants.") },
      { name: "products:variants", table: "swell_variants", variants: true },
      [{ id: "variant-1" }],
    ),
    /missing its parent id/,
  );
});
