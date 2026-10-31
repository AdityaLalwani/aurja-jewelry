#!/usr/bin/env node

const SWELL_API_URL = "https://api.swell.store";
const PAGE_SIZE = 100;
const CONTENT_FIELDS = {
  style: "collection",
  youtube_id: "youtube_id",
  metal_type: "metal_type",
  size: "size",
  stone_details: "stone_details",
  occasion: "occasion",
  price_breakup: "price_breakup",
  certificate: "certificate",
};

function parseArgs(args) {
  const mappingIndex = args.indexOf("--mapping");
  const mappingPath = mappingIndex >= 0 ? args[mappingIndex + 1] : undefined;
  if (!mappingPath || mappingPath.startsWith("--")) {
    throw new Error(
      "Usage: node --env-file=.env.local scripts/update-swell-products-by-sku.js --mapping <updates.json> [--apply]",
    );
  }
  return { mappingPath, apply: args.includes("--apply") };
}

function getCredentials() {
  const storeId = process.env.SWELL_STORE_ID;
  const secretKey = process.env.SWELL_SECRET_KEY;
  if (!storeId || !secretKey) {
    throw new Error("Set SWELL_STORE_ID and SWELL_SECRET_KEY.");
  }
  return { storeId, secretKey };
}

function validateMapping(mapping) {
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) {
    throw new Error("Updates must be a JSON object keyed by product SKU.");
  }

  const allowedFields = new Set([...Object.keys(CONTENT_FIELDS), "shipment_weight"]);
  for (const [sku, updates] of Object.entries(mapping)) {
    if (!sku.trim()) {
      throw new Error("SKU keys must not be empty.");
    }
    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      throw new Error(`Updates for SKU ${sku} must be a JSON object.`);
    }
    if (Object.keys(updates).length === 0) {
      throw new Error(`Updates for SKU ${sku} must contain at least one field.`);
    }
    for (const [field, value] of Object.entries(updates)) {
      if (!allowedFields.has(field)) {
        throw new Error(`Unsupported field "${field}" for SKU ${sku}.`);
      }
      if (field === "shipment_weight") {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
          throw new Error(
            `shipment_weight for SKU ${sku} must map metal option values to weights.`,
          );
        }
        if (Object.keys(value).length === 0) {
          throw new Error(`shipment_weight for SKU ${sku} must not be empty.`);
        }
        for (const [metalValue, weight] of Object.entries(value)) {
          if (!metalValue.trim()) {
            throw new Error(`Metal option values for SKU ${sku} must not be empty.`);
          }
          if (typeof weight !== "number" || !Number.isFinite(weight) || weight < 0) {
            throw new Error(
              `shipment_weight for "${metalValue}" on SKU ${sku} must be a non-negative number.`,
            );
          }
        }
      }
    }
  }
}

async function swellRequest(path, credentials, options = {}) {
  const authorization = Buffer.from(
    `${credentials.storeId}:${credentials.secretKey}`,
  ).toString("base64");
  const response = await fetch(`${SWELL_API_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${authorization}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Swell API returned ${response.status}: ${responseText}`);
  }
  return responseText ? JSON.parse(responseText) : null;
}

async function listRecords(path, credentials, recordName) {
  const records = [];
  for (let page = 1; ; page += 1) {
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      page: String(page),
    });
    const result = await swellRequest(`${path}?${params}`, credentials);
    if (!result || !Array.isArray(result.results)) {
      throw new Error(`Unexpected ${recordName} response from Swell.`);
    }
    records.push(...result.results);
    if (records.length >= result.count || result.results.length === 0) break;
  }
  return records;
}

function findUniqueBySku(records, sku, recordName) {
  const matches = records.filter((record) => record.sku === sku);
  if (matches.length > 1) {
    throw new Error(`SKU ${sku} matches multiple ${recordName}.`);
  }
  return matches[0];
}

function updateMetalOptionValues(product, shipmentWeights) {
  const options = product.options;
  if (!Array.isArray(options)) {
    throw new Error(`Product SKU ${product.sku} has no options in the Swell response.`);
  }

  const metalOptions = options
    .map((option, index) => ({ option, index }))
    .filter(({ option }) => /metal/i.test(option.name ?? ""));
  if (metalOptions.length !== 1) {
    throw new Error(
      `Product SKU ${product.sku} must have exactly one Metal option; found ${metalOptions.length}.`,
    );
  }

  const { option: metalOption, index: metalOptionIndex } = metalOptions[0];
  if (!Array.isArray(metalOption.values)) {
    throw new Error(`Metal option for product SKU ${product.sku} has no values.`);
  }

  const requestedWeights = new Map(
    Object.entries(shipmentWeights).map(([name, weight]) => [
      name.trim().toLowerCase(),
      { name, weight },
    ]),
  );
  const matchedWeights = new Set();
  const updatedOptions = options.map((option, optionIndex) => {
    if (optionIndex !== metalOptionIndex) return option;
    return {
      ...option,
      values: option.values.map((value) => {
        const requested = requestedWeights.get(
          (value.name ?? "").trim().toLowerCase(),
        );
        if (!requested) return value;
        matchedWeights.add(requested.name);
        return { ...value, shipment_weight: requested.weight };
      }),
    };
  });

  const missingValues = [...requestedWeights.values()]
    .filter(({ name }) => !matchedWeights.has(name))
    .map(({ name }) => name);
  if (missingValues.length > 0) {
    throw new Error(
      `Metal option value(s) not found for product SKU ${product.sku}: ${missingValues.join(", ")}.`,
    );
  }

  return updatedOptions;
}

function createUpdatePlan(mapping, products) {
  const productUpdates = new Map();
  const missing = [];

  for (const [sku, updates] of Object.entries(mapping)) {
    const product = findUniqueBySku(products, sku, "products");
    if (!product) {
      missing.push(`product SKU ${sku}`);
      continue;
    }

    const contentUpdates = Object.fromEntries(
      Object.entries(updates)
        .filter(([field]) => field in CONTENT_FIELDS)
        .map(([field, value]) => [CONTENT_FIELDS[field], value]),
    );
    const productUpdate = { product, contentUpdates };
    if ("shipment_weight" in updates) {
      productUpdate.shipmentWeights = updates.shipment_weight;
      productUpdate.options = updateMetalOptionValues(
        product,
        updates.shipment_weight,
      );
    }
    productUpdates.set(product.id, productUpdate);
  }

  return { productUpdates, missing };
}

async function main() {
  const { mappingPath, apply } = parseArgs(process.argv.slice(2));
  const credentials = getCredentials();
  const { readFile } = await import("node:fs/promises");
  const mapping = JSON.parse(await readFile(mappingPath, "utf8"));
  validateMapping(mapping);

  const products = await listRecords("/products", credentials, "products");
  const { productUpdates, missing } = createUpdatePlan(mapping, products);

  for (const [
    id,
    { product, contentUpdates, shipmentWeights },
  ] of productUpdates) {
    console.log(
      `Product SKU: ${product.sku} | ID: ${id} | Content updates: ${JSON.stringify(contentUpdates)}${shipmentWeights ? ` | Metal shipment weights: ${JSON.stringify(shipmentWeights)}` : ""}`,
    );
  }
  for (const item of missing) {
    console.error(`No matching ${item}.`);
  }

  if (apply && missing.length > 0) {
    throw new Error("Apply stopped because one or more SKUs could not be matched.");
  }

  if (apply) {
    for (const { product, contentUpdates, options } of productUpdates.values()) {
      await swellRequest(
        `/products/${encodeURIComponent(product.id)}`,
        credentials,
        {
          method: "PUT",
          body: JSON.stringify({
            ...(Object.keys(contentUpdates).length > 0
              ? { content: { ...(product.content ?? {}), ...contentUpdates } }
              : {}),
            ...(options ? { options } : {}),
          }),
        },
      );
      console.log(`Applied updates for product SKU ${product.sku}.`);
    }
  }

  console.log(
    `${apply ? "Apply" : "Dry run"} complete: ${productUpdates.size} product(s) planned. ${apply ? "Swell records were updated." : "No Swell records were changed."}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
