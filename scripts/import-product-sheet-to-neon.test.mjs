import assert from "node:assert/strict";
import test from "node:test";
import {
  parseCsv,
  prepareProductImport,
} from "./import-product-sheet-to-neon.mjs";

function productRow(overrides = {}) {
  return {
    record_type: "product",
    product_sku: "SKU-1",
    product_id: "SKU-1",
    product_name: "Silver Ring",
    product_slug: "silver-ring",
    product_active: "true",
    product_stock_level: "2",
    product_categories_json: '["JEWELLERY > RING"]',
    product_description: "A ring",
    product_page_title: "Silver Ring",
    product_meta_description: "A silver ring",
    product_tags: "silver, ring",
    product_images_json: '["https://example.test/ring.jpg"]',
    product_list_price: "100",
    product_on_sale: "false",
    product_sale_price: "",
    product_price_rules_json: "",
    product_cost: "",
    product_purchase_options_json: "{}",
    product_options_json:
      '[{"name":"Metal","values":[{"name":"Silver","id":"value-1","price":100}]}]',
    product_custom_options_json: "",
    product_type: "physical",
    product_delivery: "shipment",
    product_tax_code: "",
    product_color: "",
    product_material: "silver",
    product_metal: "925 Silver",
    product_size: "",
    product_gross_weight: "2.5",
    product_content_updates_json: '{"style":"Classic"}',
    product_source_fields_json: '{"source_csv":{"ID":"original-product-id"}}',
    ...overrides,
  };
}

function variantRow(overrides = {}) {
  return {
    record_type: "variant",
    product_sku: "SKU-1",
    product_id: "SKU-1",
    variant_id: "SKU-1-SILVER",
    variant_sku: "SKU-1-SILVER",
    variant_name: "Silver",
    variant_active: "true",
    variant_stock_level: "1",
    variant_price_usd: "100",
    variant_price_inr: "8000",
    variant_shipment_weight: "2.5",
    variant_option_value_ids_json: '["value-1"]',
    variant_selected_options_json: '{"Metal":"Silver"}',
    variant_source_fields_json: '{"variant_csv":{"ID":"original-variant-id"}}',
    ...overrides,
  };
}

test("CSV parser preserves quoted commas, newlines, and escaped quotes", () => {
  const rows = parseCsv(
    'name,description\r\nRing,"Line one,\nLine ""two"""',
  );

  assert.deepEqual(rows, [
    { name: "Ring", description: 'Line one,\nLine "two"' },
  ]);
});

test("sheet import builds category hierarchy and retains product fields", () => {
  const plan = prepareProductImport([productRow()]);
  const [product] = plan.products;

  assert.equal(plan.categories.length, 2);
  assert.equal(product.payload.category_id, "category-jewellery-ring");
  assert.equal(product.payload.categories[0], product.payload.category_id);
  assert.deepEqual(product.payload.images, [
    { file: { url: "https://example.test/ring.jpg" } },
  ]);
  assert.equal(product.payload.content.style, "Classic");
  assert.equal(product.payload.source_data.fields.source_csv.ID, "original-product-id");
});

test("variant import keeps SKU IDs, parent links, prices, and option IDs", () => {
  const plan = prepareProductImport([productRow(), variantRow()]);
  const [variant] = plan.variants;

  assert.equal(variant.id, "SKU-1-SILVER");
  assert.equal(variant.parentId, "SKU-1");
  assert.equal(variant.payload.price, 100);
  assert.equal(variant.payload.price_inr, 8000);
  assert.deepEqual(variant.payload.option_value_ids, ["value-1"]);
  assert.equal(
    variant.payload.source_data.variant_csv.ID,
    "original-variant-id",
  );
});

test("sheet import rejects a variant whose parent ID does not match", () => {
  assert.throws(
    () =>
      prepareProductImport([
        productRow(),
        variantRow({ product_id: "wrong-parent" }),
      ]),
    /mismatched parent product ID/,
  );
});

test("sheet import rejects duplicate variant SKUs", () => {
  assert.throws(
    () =>
      prepareProductImport([
        productRow(),
        variantRow(),
        variantRow({ variant_id: "another-id" }),
      ]),
    /Duplicate variant SKU/,
  );
});
