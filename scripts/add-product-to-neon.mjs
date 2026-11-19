#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

function parseArgs(args) {
  const fileIndex = args.indexOf("--file");
  if (fileIndex < 0 || !args[fileIndex + 1] || args[fileIndex + 1].startsWith("--")) {
    throw new Error(
      'Usage: node --env-file=.env.local scripts/add-product-to-neon.mjs --file "scripts/product-example.json" [--apply]',
    );
  }
  const unknown = args.filter(
    (argument, index) =>
      argument !== "--file" &&
      argument !== "--apply" &&
      index !== fileIndex + 1,
  );
  if (unknown.length) throw new Error(`Unknown argument: ${unknown[0]}`);
  return { filePath: args[fileIndex + 1], apply: args.includes("--apply") };
}

function requireText(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} must be a non-empty string.`);
  }
  return value.trim();
}

export function validateProductInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("The product file must contain a JSON object.");
  }
  const product = input.product;
  const variants = input.variants ?? [];
  if (!product || typeof product !== "object" || Array.isArray(product)) {
    throw new Error('The product file must contain a "product" object.');
  }
  if (!Array.isArray(variants)) {
    throw new Error('"variants" must be an array.');
  }

  const productId = requireText(product.id, "product.id");
  requireText(product.name, "product.name");
  requireText(product.slug, "product.slug");
  if (product.options !== undefined && !Array.isArray(product.options)) {
    throw new Error("product.options must be an array.");
  }

  const variantIds = new Set();
  for (const [index, variant] of variants.entries()) {
    const label = `variants[${index}]`;
    if (!variant || typeof variant !== "object" || Array.isArray(variant)) {
      throw new Error(`${label} must be an object.`);
    }
    const id = requireText(variant.id, `${label}.id`);
    if (variantIds.has(id)) throw new Error(`Duplicate variant id "${id}".`);
    variantIds.add(id);
    if (requireText(variant.parent_id, `${label}.parent_id`) !== productId) {
      throw new Error(`${label}.parent_id must match product.id.`);
    }
  }

  return { product, variants };
}

async function main() {
  const { filePath, apply } = parseArgs(process.argv.slice(2));
  const input = JSON.parse(await readFile(path.resolve(filePath), "utf8"));
  const { product, variants } = validateProductInput(input);
  console.log(
    `Validated product ${product.id} (${product.slug}) and ${variants.length} variant(s).`,
  );

  if (!apply) {
    console.log("Dry run complete. No Neon records were changed.");
    return;
  }

  const databaseUrl = process.env.DATABASE_URL_UNPOOLED;
  if (!databaseUrl) {
    throw new Error("Set DATABASE_URL_UNPOOLED to the Neon direct connection string.");
  }

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    await client.query("BEGIN");
    try {
      const duplicateSlug = await client.query(
        "SELECT swell_id FROM swell_products WHERE payload ->> 'slug' = $1 LIMIT 1",
        [product.slug],
      );
      if (duplicateSlug.rowCount) {
        throw new Error(`Product slug "${product.slug}" already exists.`);
      }

      await client.query(
        `INSERT INTO swell_products (swell_id, payload, source_updated_at)
         VALUES ($1, $2::jsonb, now())`,
        [product.id, JSON.stringify(product)],
      );
      for (const variant of variants) {
        await client.query(
          `INSERT INTO swell_variants (swell_id, parent_id, payload, source_updated_at)
           VALUES ($1, $2, $3::jsonb, now())`,
          [variant.id, product.id, JSON.stringify(variant)],
        );
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } finally {
    await client.end();
  }

  console.log(
    `Added product ${product.id} and ${variants.length} variant(s) to Neon.`,
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Product import failed.");
    process.exitCode = 1;
  });
}
