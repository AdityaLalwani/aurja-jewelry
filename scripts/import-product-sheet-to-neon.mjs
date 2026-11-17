#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const BATCH_SIZE = 100;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
      continue;
    }

    if (character === '"' && cell.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n" || character === "\r") {
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
      if (character === "\r" && text[index + 1] === "\n") index += 1;
    } else {
      cell += character;
    }
  }

  if (quoted) throw new Error("CSV contains an unterminated quoted field.");
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value !== "")) rows.push(row);
  }
  if (rows.length < 2) throw new Error("CSV contains no data rows.");

  const headers = rows[0].map((header, index) =>
    index === 0 ? header.replace(/^\uFEFF/, "") : header,
  );
  if (new Set(headers).size !== headers.length) {
    throw new Error("CSV contains duplicate column names.");
  }

  return rows.slice(1).map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(
        `CSV record ${index + 2} has ${values.length} fields; expected ${headers.length}.`,
      );
    }
    return Object.fromEntries(headers.map((header, i) => [header, values[i]]));
  });
}

function parseJson(value, fallback, fieldName) {
  if (!value?.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`Invalid JSON in ${fieldName}.`);
  }
}

function required(value, fieldName) {
  if (!value?.trim()) throw new Error(`Missing required value: ${fieldName}.`);
  return value.trim();
}

function parseBoolean(value, fieldName) {
  const normalized = value?.trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  throw new Error(`Invalid boolean in ${fieldName}.`);
}

function parseNumber(value, fieldName, fallback) {
  if (!value?.trim()) return fallback;
  const normalized = value.trim().replace(/^default:\s*/i, "");
  const number = Number(normalized);
  if (!Number.isFinite(number)) {
    throw new Error(`Invalid number in ${fieldName}.`);
  }
  return number;
}

function slugify(value) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) throw new Error(`Cannot create a category slug from "${value}".`);
  return slug;
}

function categoryPath(value, recordIndex) {
  const paths = parseJson(value, [], `product_categories_json on record ${recordIndex}`);
  if (!Array.isArray(paths) || paths.some((entry) => typeof entry !== "string")) {
    throw new Error(`Invalid category paths on record ${recordIndex}.`);
  }
  return paths.map((entry) => {
    const segments = entry.split(">").map((segment) => segment.trim());
    if (segments.some((segment) => !segment)) {
      throw new Error(`Invalid category path "${entry}" on record ${recordIndex}.`);
    }
    return segments;
  });
}

function createCategories(products) {
  const categoriesById = new Map();
  const slugToId = new Map();
  const idsByPath = new Map();

  for (const { row, index } of products) {
    for (const segments of categoryPath(row.product_categories_json, index)) {
      let parentId = null;
      const currentSegments = [];
      for (const name of segments) {
        currentSegments.push(name);
        const pathKey = currentSegments.join(" > ");
        const id = `category-${currentSegments.map(slugify).join("-")}`;
        const slug = slugify(name);
        const conflictingId = slugToId.get(slug);
        if (conflictingId && conflictingId !== id) {
          throw new Error(
            `Category slug "${slug}" is ambiguous across category paths.`,
          );
        }

        if (!categoriesById.has(id)) {
          categoriesById.set(id, {
            id,
            name,
            slug,
            parent_id: parentId,
            active: true,
            sort: categoriesById.size + 1,
            source_path: pathKey,
          });
          slugToId.set(slug, id);
        }
        idsByPath.set(pathKey, id);
        parentId = id;
      }
    }
  }

  return { categories: [...categoriesById.values()], idsByPath };
}

function getUpdatedContent(source, contentCell) {
  const laterUpdate = source.later_product_update ?? {};
  const directFields = Object.fromEntries(
    Object.entries(laterUpdate).filter(
      ([key]) => !["active", "stock_level", "categories", "content"].includes(key),
    ),
  );
  return {
    ...directFields,
    ...(laterUpdate.content ?? {}),
    ...(contentCell ?? {}),
    ...(source.content_update_for_neon ?? {}),
  };
}

export function prepareProductImport(rows) {
  const productRows = [];
  const variantRows = [];

  rows.forEach((row, index) => {
    if (row.record_type === "product") {
      productRows.push({ row, index: index + 2 });
    } else if (row.record_type === "variant") {
      variantRows.push({ row, index: index + 2 });
    } else {
      throw new Error(`Unknown record_type on CSV record ${index + 2}.`);
    }
  });

  if (!productRows.length) throw new Error("CSV contains no product records.");

  const productsBySku = new Map();
  const productIds = new Set();
  for (const { row, index } of productRows) {
    const sku = required(row.product_sku, `product_sku on record ${index}`);
    const id = required(row.product_id, `product_id on record ${index}`);
    if (productsBySku.has(sku)) throw new Error(`Duplicate product SKU "${sku}".`);
    if (productIds.has(id)) throw new Error(`Duplicate product ID "${id}".`);
    productsBySku.set(sku, { id, row, index });
    productIds.add(id);
  }

  const { categories, idsByPath } = createCategories(productRows);
  const products = productRows.map(({ row, index }) => {
    const id = required(row.product_id, `product_id on record ${index}`);
    const sku = required(row.product_sku, `product_sku on record ${index}`);
    const source = parseJson(
      row.product_source_fields_json,
      {},
      `product_source_fields_json on record ${index}`,
    );
    const images = parseJson(
      row.product_images_json,
      [],
      `product_images_json on record ${index}`,
    );
    if (!Array.isArray(images) || images.some((image) => typeof image !== "string")) {
      throw new Error(`Invalid product images on record ${index}.`);
    }

    const paths = categoryPath(row.product_categories_json, index);
    const categoryIds = paths.map((segments) => {
      const categoryId = idsByPath.get(segments.join(" > "));
      if (!categoryId) {
        throw new Error(`Unresolved category path on record ${index}.`);
      }
      return categoryId;
    });
    const purchaseOptions = parseJson(
      row.product_purchase_options_json,
      {},
      `product_purchase_options_json on record ${index}`,
    );
    const sourceCsv = source.source_csv ?? {};
    const attributes = Object.fromEntries(
      [
        ["color", row.product_color],
        ["material", row.product_material],
        ["metal", row.product_metal],
        ["size", row.product_size],
        ["gross_weight", row.product_gross_weight],
        ["tags", row.product_tags],
      ].filter(([, value]) => value?.trim()),
    );
    const tags = row.product_tags
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const payload = {
      id,
      sku,
      name: required(row.product_name, `product_name on record ${index}`),
      slug: required(row.product_slug, `product_slug on record ${index}`),
      active: parseBoolean(row.product_active, `product_active on record ${index}`),
      stock_level: parseNumber(
        row.product_stock_level,
        `product_stock_level on record ${index}`,
        0,
      ),
      price: parseNumber(row.product_list_price, `product_list_price on record ${index}`, 0),
      sale: parseBoolean(row.product_on_sale, `product_on_sale on record ${index}`),
      sale_price: parseNumber(
        row.product_sale_price,
        `product_sale_price on record ${index}`,
        undefined,
      ),
      description: row.product_description ?? "",
      meta_title: row.product_page_title || undefined,
      meta_description: row.product_meta_description || undefined,
      meta_keywords: row.product_tags || undefined,
      tags,
      type: row.product_type || undefined,
      delivery: row.product_delivery || undefined,
      tax_code: row.product_tax_code || undefined,
      cost: parseNumber(row.product_cost, `product_cost on record ${index}`, undefined),
      price_rules: parseJson(
        row.product_price_rules_json,
        undefined,
        `product_price_rules_json on record ${index}`,
      ),
      purchase_options: purchaseOptions,
      options: parseJson(
        row.product_options_json,
        [],
        `product_options_json on record ${index}`,
      ),
      custom_options: parseJson(
        row.product_custom_options_json,
        [],
        `product_custom_options_json on record ${index}`,
      ),
      images: images.map((url) => ({ file: { url } })),
      category_id: categoryIds[0],
      categories: categoryIds,
      category_paths: paths.map((segments) => segments.join(" > ")),
      attributes,
      content: getUpdatedContent(
        source,
        parseJson(
          row.product_content_updates_json,
          {},
          `product_content_updates_json on record ${index}`,
        ),
      ),
      source_data: {
        fields: source,
        source_csv: sourceCsv,
      },
    };

    const inrPrice =
      purchaseOptions.standard?.$currency?.INR?.price ??
      purchaseOptions.standard?.price_inr;
    if (inrPrice !== undefined) {
      payload.price_inr = parseNumber(
        String(inrPrice),
        `INR purchase price on record ${index}`,
        undefined,
      );
    }

    return { id, payload, index, sku };
  });

  const variants = [];
  const variantIds = new Set();
  const variantSkus = new Set();
  for (const { row, index } of variantRows) {
    const sku = required(row.product_sku, `product_sku on variant record ${index}`);
    const parent = productsBySku.get(sku);
    if (!parent) {
      throw new Error(`Variant record ${index} has no product row for "${sku}".`);
    }
    const parentId = required(
      row.product_id,
      `product_id on variant record ${index}`,
    );
    if (parentId !== parent.id) {
      throw new Error(`Variant record ${index} has a mismatched parent product ID.`);
    }

    const id = required(row.variant_id, `variant_id on record ${index}`);
    if (variantIds.has(id)) throw new Error(`Duplicate variant ID "${id}".`);
    variantIds.add(id);
    const variantSku = required(row.variant_sku, `variant_sku on record ${index}`);
    if (variantSkus.has(variantSku)) {
      throw new Error(`Duplicate variant SKU "${variantSku}".`);
    }
    variantSkus.add(variantSku);
    const source = parseJson(
      row.variant_source_fields_json,
      {},
      `variant_source_fields_json on record ${index}`,
    );
    const payload = {
      id,
      parent_id: parentId,
      sku: variantSku,
      name: required(row.variant_name, `variant_name on record ${index}`),
      active: parseBoolean(row.variant_active, `variant_active on record ${index}`),
      stock_level: parseNumber(
        row.variant_stock_level,
        `variant_stock_level on record ${index}`,
        0,
      ),
      price: parseNumber(
        row.variant_price_usd,
        `variant_price_usd on record ${index}`,
        0,
      ),
      price_inr: parseNumber(
        row.variant_price_inr,
        `variant_price_inr on record ${index}`,
        0,
      ),
      shipment_weight: parseNumber(
        row.variant_shipment_weight,
        `variant_shipment_weight on record ${index}`,
        undefined,
      ),
      option_value_ids: parseJson(
        row.variant_option_value_ids_json,
        [],
        `variant_option_value_ids_json on record ${index}`,
      ),
      selected_options: parseJson(
        row.variant_selected_options_json,
        {},
        `variant_selected_options_json on record ${index}`,
      ),
      source_data: source,
    };
    variants.push({ id, parentId, payload, index });
  }

  return { categories, products, variants };
}

async function upsertRecords(client, table, records, variants = false) {
  const columns = variants
    ? "(swell_id, parent_id, payload, source_updated_at)"
    : "(swell_id, payload, source_updated_at)";
  const rowSize = variants ? 4 : 3;

  for (let offset = 0; offset < records.length; offset += BATCH_SIZE) {
    const batch = records.slice(offset, offset + BATCH_SIZE);
    const values = [];
    const placeholders = batch.map((record, index) => {
      const parameter = index * rowSize;
      if (variants) {
        values.push(
          record.id,
          record.parentId,
          JSON.stringify(record.payload),
          null,
        );
        return `($${parameter + 1}, $${parameter + 2}, $${parameter + 3}::jsonb, $${parameter + 4})`;
      }
      values.push(record.id, JSON.stringify(record.payload), null);
      return `($${parameter + 1}, $${parameter + 2}::jsonb, $${parameter + 3})`;
    });

    await client.query(
      `INSERT INTO ${table} ${columns}
       VALUES ${placeholders.join(", ")}
       ON CONFLICT (swell_id) DO UPDATE SET
         ${variants ? "parent_id = EXCLUDED.parent_id," : ""}
         payload = EXCLUDED.payload,
         source_updated_at = COALESCE(EXCLUDED.source_updated_at, ${table}.source_updated_at),
         imported_at = now()`,
      values,
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf("--file");
  if (fileIndex < 0 || !args[fileIndex + 1]) {
    throw new Error(
      'Provide the sheet path with --file "C:\\path\\to\\products.csv".',
    );
  }
  const unknownArgs = args.filter(
    (argument, index) =>
      argument !== "--apply" &&
      argument !== "--file" &&
      index !== fileIndex + 1,
  );
  if (unknownArgs.length) {
    throw new Error(`Unknown argument: ${unknownArgs[0]}`);
  }

  const csv = await readFile(path.resolve(args[fileIndex + 1]), "utf8");
  const plan = prepareProductImport(parseCsv(csv));
  console.log(
    `Sheet validated: ${plan.products.length} product(s), ${plan.variants.length} variant(s), ${plan.categories.length} derived category record(s).`,
  );

  if (!args.includes("--apply")) {
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
      await upsertRecords(
        client,
        "swell_categories",
        plan.categories.map((category) => ({
          id: category.id,
          payload: category,
        })),
      );
      await upsertRecords(client, "swell_products", plan.products);
      await upsertRecords(client, "swell_variants", plan.variants, true);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } finally {
    await client.end();
  }

  console.log(
    "Import complete. Records were upserted; no existing records were deleted.",
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Import failed.");
    process.exitCode = 1;
  });
}

export { parseCsv };
