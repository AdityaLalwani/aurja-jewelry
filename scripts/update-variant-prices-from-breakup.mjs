#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const { Client } = pg;
const EXCHANGE_RATE_URL = "https://open.er-api.com/v6/latest/INR";
const BREAKUP_FIELDS = [
  "nwsilver",
  "nw9k",
  "nw14k",
  "nw18k",
  "silverlabour",
  "goldlabour",
  "Stonecost",
];

function parseArgs(args) {
  const parsed = { apply: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--apply") {
      parsed.apply = true;
    } else if (argument === "--inr-prices") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("--inr-prices requires a JSON file path.");
      }
      if (parsed.inrPricesFile !== undefined) {
        throw new Error("--inr-prices must only be provided once.");
      }
      parsed.inrPricesFile = value;
      index += 1;
    } else if (argument === "--goldrate" || argument === "--silverrate") {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a numeric value.`);
      }
      const key = argument.slice(2);
      if (parsed[key] !== undefined) {
        throw new Error(`${argument} must only be provided once.`);
      }
      parsed[key] = value;
      index += 1;
    } else {
      throw new Error(
        `Unknown argument: ${argument}. Usage: node --env-file=.env.local scripts/update-variant-prices-from-breakup.mjs [--goldrate <rate> --silverrate <rate> | --inr-prices <file>] [--apply]`,
      );
    }
  }
  return parsed;
}

function parsePriceBreakup(value, productId) {
  let breakup = value;
  if (typeof breakup === "string") {
    try {
      breakup = JSON.parse(breakup);
    } catch {
      const values = breakup.split("|");
      if (values.length !== BREAKUP_FIELDS.length) {
        throw new Error(
          `Product ${productId} price_breakup must be a JSON object or seven pipe-separated values.`,
        );
      }
      breakup = Object.fromEntries(
        BREAKUP_FIELDS.map((field, index) => [field, values[index].trim()]),
      );
    }
  }
  if (!breakup || typeof breakup !== "object" || Array.isArray(breakup)) {
    throw new Error(`Product ${productId} has no valid attributes.price_breakup object.`);
  }
  const result = {};
  for (const field of BREAKUP_FIELDS) {
    const amount = breakup[field];
    if (
      (typeof amount !== "number" && typeof amount !== "string") ||
      String(amount).trim() === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) < 0
    ) {
      throw new Error(`Product ${productId} has an invalid price_breakup.${field}.`);
    }
    result[field] = Number(amount);
  }
  return result;
}

function getMetalKind(value) {
  const normalized = String(value).trim().toLowerCase();
  if (/925.*silver|silver.*925/.test(normalized)) return "925silver";
  if (/\b9k\b/.test(normalized)) return "9k";
  if (/\b14k\b/.test(normalized)) return "14k";
  if (/\b18k\b/.test(normalized)) return "18k";
  return undefined;
}

function getVariantMetal(variant, product) {
  const selectedOptions = variant.selected_options;
  if (
    selectedOptions &&
    typeof selectedOptions === "object" &&
    !Array.isArray(selectedOptions)
  ) {
    for (const [name, value] of Object.entries(selectedOptions)) {
      if (/metal/i.test(name) || getMetalKind(value)) {
        const kind = getMetalKind(value);
        if (kind) return kind;
      }
    }
  }

  const nameKind = getMetalKind(variant.name);
  if (nameKind) return nameKind;

  const optionIds = new Set(
    Array.isArray(variant.option_value_ids) ? variant.option_value_ids : [],
  );
  for (const option of Array.isArray(product.options) ? product.options : []) {
    if (!/metal/i.test(option?.name ?? "") || !Array.isArray(option.values)) {
      continue;
    }
    for (const value of option.values) {
      if (optionIds.has(value?.id)) {
        const kind = getMetalKind(value.name);
        if (kind) return kind;
      }
    }
  }
  throw new Error(`Variant ${variant.id} has no recognized metal selection.`);
}

function calculatePrice(kind, breakup, rates) {
  if (kind === "925silver") {
    return Math.round(
      breakup.nwsilver * (rates.silverrate + breakup.silverlabour) +
      breakup.Stonecost
    );
  }
  const weight = breakup[`nw${kind}`];
  const purity = { "9k": 0.4, "14k": 0.6, "18k": 0.76 }[kind];
  if (purity === undefined) throw new Error(`Unsupported metal type "${kind}".`);
  return Math.round(
    weight * (rates.goldrate * purity + breakup.goldlabour) +
      breakup.Stonecost,
  );
}

function convertInrToUsd(priceInr, usdPerInr) {
  if (!Number.isFinite(usdPerInr) || usdPerInr <= 0) {
    throw new Error("The live INR-to-USD exchange rate is invalid.");
  }
  return Math.round(priceInr * usdPerInr * 100) / 100;
}

export function buildPriceUpdatePlan(product, variants, rates, usdPerInr) {
  const productId = product.id ?? product.sku ?? "unknown";
  const breakup = parsePriceBreakup(
    product.attributes?.price_breakup ?? product.content?.price_breakup,
    productId,
  );
  const pricesByMetal = new Map();
  const usdPricesByMetal = new Map();
  const updatedVariants = variants.map((variant) => {
    const kind = getVariantMetal(variant, product);
    const priceInr = calculatePrice(kind, breakup, rates);
    const priceUsd = convertInrToUsd(priceInr, usdPerInr);
    pricesByMetal.set(kind, priceInr);
    usdPricesByMetal.set(kind, priceUsd);
    return { ...variant, price: priceUsd, price_inr: priceInr };
  });

  let updatedOptions;
  if (Array.isArray(product.options)) {
    updatedOptions = product.options.map((option) => {
      if (!/metal/i.test(option?.name ?? "") || !Array.isArray(option.values)) {
        return option;
      }
      return {
        ...option,
        values: option.values.map((value) => {
          const kind = getMetalKind(value.name);
          const priceInr = kind ? pricesByMetal.get(kind) : undefined;
          const priceUsd = kind ? usdPricesByMetal.get(kind) : undefined;
          return priceInr === undefined || priceUsd === undefined
            ? value
            : { ...value, price: priceUsd, price_inr: priceInr };
        }),
      };
    });
  }

  const lowestPriceInr = Math.min(...pricesByMetal.values());
  const lowestPriceUsd = Math.min(...usdPricesByMetal.values());
  return {
    product: {
      ...product,
      ...(updatedOptions ? { options: updatedOptions } : {}),
      price: lowestPriceUsd,
      price_inr: lowestPriceInr,
      attributes: {
        ...(product.attributes ?? {}),
        price_usd: lowestPriceUsd,
      },
      date_updated: new Date().toISOString(),
    },
    variants: updatedVariants.map((variant) => ({
      ...variant,
      date_updated: new Date().toISOString(),
    })),
    pricesByMetal: Object.fromEntries(pricesByMetal),
    usdPricesByMetal: Object.fromEntries(usdPricesByMetal),
  };
}

export function buildBasePriceUpdatePlan(product, usdPerInr) {
  const priceUsd = Number(product.price);
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) {
    throw new Error(
      `Product ${product.id ?? product.sku ?? "unknown"} has no positive USD price to convert to INR.`,
    );
  }
  const priceInr = Math.round(priceUsd / usdPerInr);
  return {
    product: {
      ...product,
      price_inr: priceInr,
      date_updated: new Date().toISOString(),
    },
    priceUsd,
    priceInr,
  };
}

export function validateSkuPriceMap(mapping) {
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) {
    throw new Error("INR prices must be a JSON object keyed by product SKU.");
  }
  const entries = Object.entries(mapping);
  if (!entries.length) throw new Error("INR price mapping must not be empty.");

  return Object.fromEntries(
    entries.map(([sku, priceInr]) => {
      const normalizedSku = sku.trim().toUpperCase();
      if (!normalizedSku) throw new Error("Product SKU keys must not be empty.");
      if (
        typeof priceInr !== "number" ||
        !Number.isFinite(priceInr) ||
        priceInr <= 0
      ) {
        throw new Error(`INR price for SKU ${sku} must be a positive number.`);
      }
      return [normalizedSku, priceInr];
    }),
  );
}

export function buildSkuPriceUpdatePlan(product, priceInr, usdPerInr) {
  if (!Number.isFinite(priceInr) || priceInr <= 0) {
    throw new Error("Mapped INR price must be a positive number.");
  }
  const roundedPriceInr = Math.round(priceInr);
  const priceUsd = convertInrToUsd(roundedPriceInr, usdPerInr);
  return {
    product: {
      ...product,
      price: priceUsd,
      price_inr: roundedPriceInr,
      attributes: {
        ...(product.attributes ?? {}),
        price_usd: priceUsd,
      },
      date_updated: new Date().toISOString(),
    },
    priceInr: roundedPriceInr,
    priceUsd,
  };
}

async function fetchInrToUsdRate() {
  const response = await fetch(EXCHANGE_RATE_URL, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    throw new Error(`Exchange-rate service returned HTTP ${response.status}.`);
  }
  const data = await response.json();
  const usdPerInr = Number(data?.rates?.USD);
  if (
    data?.result !== "success" ||
    data?.base_code !== "INR" ||
    !Number.isFinite(usdPerInr) ||
    usdPerInr <= 0 ||
    typeof data.time_last_update_utc !== "string"
  ) {
    throw new Error("Exchange-rate service returned an invalid INR-to-USD rate.");
  }
  return { usdPerInr, updatedAt: data.time_last_update_utc };
}

function validateRates(goldrate, silverrate) {
  const rates = { goldrate: Number(goldrate), silverrate: Number(silverrate) };
  for (const [name, value] of Object.entries(rates)) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be a non-negative number.`);
    }
  }
  return rates;
}

async function updateMappedSkuPrices(client, inrPrices, usdPerInr, apply) {
  const skus = Object.keys(inrPrices);
  const { rows } = await client.query(
    `SELECT p.swell_id, p.payload,
            COALESCE(
              p.payload->>'sku',
              p.payload->'attributes'->>'sku',
              p.payload->'attributes'->>'product_sku'
            ) AS sku,
            (SELECT count(*)::int
               FROM swell_variants v
              WHERE v.parent_id = p.swell_id) AS variant_count
       FROM swell_products p
      WHERE upper(COALESCE(
        p.payload->>'sku',
        p.payload->'attributes'->>'sku',
        p.payload->'attributes'->>'product_sku'
      )) = ANY($1::text[])`,
    [skus],
  );
  const rowsBySku = new Map();
  for (const row of rows) {
    const sku = row.sku?.trim().toUpperCase();
    const matches = rowsBySku.get(sku) ?? [];
    matches.push(row);
    rowsBySku.set(sku, matches);
  }

  const plans = [];
  for (const [sku, priceInr] of Object.entries(inrPrices)) {
    const matches = rowsBySku.get(sku) ?? [];
    if (matches.length !== 1) {
      throw new Error(
        `SKU ${sku} matched ${matches.length} products; expected exactly one.`,
      );
    }
    const [row] = matches;
    if (Number(row.variant_count) !== 0) {
      throw new Error(`SKU ${sku} has variants; this mapping is for base products only.`);
    }
    plans.push({
      productId: row.swell_id,
      sku,
      ...buildSkuPriceUpdatePlan(row.payload, priceInr, usdPerInr),
    });
  }

  for (const plan of plans) {
    console.log(
      `${plan.sku}: INR ${plan.priceInr} -> USD ${plan.priceUsd}`,
    );
  }
  if (!apply) {
    console.log(
      `Dry run complete: ${plans.length} mapped product(s). No Neon records were changed.`,
    );
    return;
  }

  await client.query("BEGIN");
  try {
    for (const plan of plans) {
      await client.query(
        `UPDATE swell_products
         SET payload = $1::jsonb, imported_at = now()
         WHERE swell_id = $2`,
        [JSON.stringify(plan.product), plan.productId],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
  console.log(`Price update complete: ${plans.length} mapped product(s) updated.`);
}

async function main() {
  const { apply, goldrate, silverrate, inrPricesFile } = parseArgs(
    process.argv.slice(2),
  );
  const rates = inrPricesFile
    ? undefined
    : validateRates(
        goldrate ?? process.env.GOLDRATE,
        silverrate ?? process.env.SILVERRATE,
      );
  if (inrPricesFile && (goldrate !== undefined || silverrate !== undefined)) {
    throw new Error("--inr-prices cannot be combined with gold or silver rates.");
  }
  const inrPrices = inrPricesFile
    ? validateSkuPriceMap(
        JSON.parse(await readFile(path.resolve(inrPricesFile), "utf8")),
      )
    : undefined;
  const { usdPerInr, updatedAt } = await fetchInrToUsdRate();
  console.log(
    `Live INR-to-USD rate: ${usdPerInr} (updated ${updatedAt}; USD prices rounded to cents).`,
  );
  const databaseUrl = process.env.DATABASE_URL_UNPOOLED;
  if (!databaseUrl) {
    throw new Error("Set DATABASE_URL_UNPOOLED to the Neon direct connection string.");
  }

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    if (inrPrices) {
      await updateMappedSkuPrices(client, inrPrices, usdPerInr, apply);
      return;
    }
    const { rows } = await client.query(
      `SELECT p.swell_id AS product_id, p.payload AS product_payload,
              v.swell_id AS variant_id, v.payload AS variant_payload
       FROM swell_products p
       LEFT JOIN swell_variants v ON v.parent_id = p.swell_id
       ORDER BY p.swell_id, v.swell_id`,
    );
    const byProduct = new Map();
    for (const row of rows) {
      const group = byProduct.get(row.product_id) ?? {
        product: row.product_payload,
        variants: [],
      };
      if (row.variant_id) group.variants.push(row.variant_payload);
      byProduct.set(row.product_id, group);
    }

    const plans = [...byProduct.entries()].map(([productId, { product, variants }]) =>
      variants.length
        ? {
            productId,
            variants,
            ...buildPriceUpdatePlan(product, variants, rates, usdPerInr),
          }
        : {
            productId,
            variants: [],
            ...buildBasePriceUpdatePlan(product, usdPerInr),
          },
    );
    for (const plan of plans) {
      if (plan.pricesByMetal) {
        console.log(
          `Product ${plan.productId}: ${JSON.stringify(plan.pricesByMetal)} INR / ${JSON.stringify(plan.usdPricesByMetal)} USD (${plan.variants.length} variant(s))`,
        );
      } else {
        console.log(
          `Product ${plan.productId}: $${plan.priceUsd} -> INR ${plan.priceInr} (no variants)`,
        );
      }
    }

    if (!apply) {
      const variantCount = plans.reduce(
        (total, plan) => total + plan.variants.length,
        0,
      );
      console.log(
        `Dry run complete: ${plans.length} product(s), ${variantCount} variant(s). No Neon records were changed.`,
      );
      return;
    }

    await client.query("BEGIN");
    try {
      for (const plan of plans) {
        await client.query(
          `UPDATE swell_products
           SET payload = $1::jsonb, imported_at = now()
           WHERE swell_id = $2`,
          [JSON.stringify(plan.product), plan.product.id],
        );
        for (const variant of plan.variants) {
          await client.query(
            `UPDATE swell_variants
             SET payload = $1::jsonb, imported_at = now()
             WHERE swell_id = $2`,
            [JSON.stringify(variant), variant.id],
          );
        }
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
    console.log(`Price update complete: ${plans.length} product(s) updated.`);
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.endsWith("update-variant-prices-from-breakup.mjs")) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Price update failed.");
    process.exitCode = 1;
  });
}

export {
  calculatePrice,
  convertInrToUsd,
  fetchInrToUsdRate,
  getMetalKind,
  parsePriceBreakup,
};
