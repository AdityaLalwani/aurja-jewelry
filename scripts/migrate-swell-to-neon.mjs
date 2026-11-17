#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SWELL_API_URL = "https://api.swell.store";
const PAGE_SIZE = 100;
const RESOURCES = [
  { name: "products", table: "swell_products" },
  { name: "products:variants", table: "swell_variants", variants: true },
  { name: "categories", table: "swell_categories" },
  { name: "accounts", table: "swell_customers", customerData: true },
  { name: "orders", table: "swell_orders", customerData: true },
  { name: "coupons", table: "swell_discounts" },
];
const SENSITIVE_CUSTOMER_FIELD =
  /password|token|secret|card|payment|session|credential|reset/i;

function getCredentials() {
  const { SWELL_STORE_ID: storeId, SWELL_SECRET_KEY: secretKey } = process.env;
  if (!storeId || !secretKey) {
    throw new Error("Set SWELL_STORE_ID and SWELL_SECRET_KEY.");
  }
  return { storeId, secretKey };
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL_UNPOOLED;
  if (!databaseUrl) {
    throw new Error("Set DATABASE_URL_UNPOOLED to the Neon direct connection string.");
  }
  return databaseUrl;
}

async function fetchPage(resource, page, credentials) {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    page: String(page),
  });
  if (resource === "accounts") params.set("expand", "addresses");
  if (resource === "products" || resource === "products:variants") {
    params.set("expand", "stock:1000");
  }
  const authorization = Buffer.from(
    `${credentials.storeId}:${credentials.secretKey}`,
  ).toString("base64");
  const response = await fetch(
    `${SWELL_API_URL}/${resource}?${params.toString()}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${authorization}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Swell ${resource} request failed with status ${response.status}.`);
  }

  const result = await response.json();
  if (
    !result ||
    !Array.isArray(result.results) ||
    !Number.isInteger(result.count) ||
    result.count < 0
  ) {
    throw new Error(`Unexpected paginated response from Swell ${resource}.`);
  }
  return result;
}

export function sanitizeCustomerData(value, redactions) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeCustomerData(item, redactions));
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, child]) => {
      if (SENSITIVE_CUSTOMER_FIELD.test(key)) {
        redactions.count += 1;
        return [];
      }
      return [[key, sanitizeCustomerData(child, redactions)]];
    }),
  );
}

function getSourceUpdatedAt(record) {
  const value = record.date_updated ?? record.updated_at;
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function upsertPage(client, resource, records) {
  if (records.length === 0) return;

  const values = [];
  const placeholders = records.map((record, index) => {
    if (typeof record.id !== "string" || record.id.length === 0) {
      throw new Error(`Swell ${resource.table} record is missing a valid id.`);
    }
    if (resource.variants && typeof record.parent_id !== "string") {
      throw new Error(`Swell variant ${record.id} is missing its parent id.`);
    }
    const offset = index * (resource.variants ? 4 : 3);
    if (resource.variants) {
      values.push(
        record.id,
        record.parent_id,
        JSON.stringify(record),
        getSourceUpdatedAt(record),
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}::jsonb, $${offset + 4})`;
    }
    values.push(
      record.id,
      JSON.stringify(record),
      getSourceUpdatedAt(record),
    );
    return `($${offset + 1}, $${offset + 2}::jsonb, $${offset + 3})`;
  });

  await client.query(
    resource.variants
      ? `INSERT INTO ${resource.table} (swell_id, parent_id, payload, source_updated_at)
     VALUES ${placeholders.join(", ")}
     ON CONFLICT (swell_id) DO UPDATE SET
       parent_id = EXCLUDED.parent_id,
       payload = EXCLUDED.payload,
       source_updated_at = EXCLUDED.source_updated_at,
       imported_at = now()`
      : `INSERT INTO ${resource.table} (swell_id, payload, source_updated_at)
     VALUES ${placeholders.join(", ")}
     ON CONFLICT (swell_id) DO UPDATE SET
       payload = EXCLUDED.payload,
       source_updated_at = EXCLUDED.source_updated_at,
       imported_at = now()`,
    values,
  );
}

async function importResource(resource, firstPage, credentials, client) {
  let page = 1;
  let total = null;
  let imported = 0;
  const redactions = { count: 0 };

  while (total === null || imported < total) {
    const result =
      page === 1
        ? firstPage
        : await fetchPage(resource.name, page, credentials);
    if (total === null) total = result.count;

    if (result.results.length === 0) break;
    const records = resource.customerData
      ? result.results.map((record) =>
          sanitizeCustomerData(record, redactions),
        )
      : result.results;

    if (client) {
      await client.query("BEGIN");
      try {
        await upsertPage(client, resource, records);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    imported += result.results.length;
    page += 1;
  }

  if (total !== null && imported < total) {
    throw new Error(
      `Swell ${resource.name} pagination stopped at ${imported} of ${total} records.`,
    );
  }

  return { imported, redactedFields: redactions.count };
}

async function applySchema(client) {
  for (const migration of [
    "0001_swell_import.sql",
    "0002_swell_variants.sql",
  ]) {
    const schema = await readFile(
      path.join(__dirname, "..", "db", "migrations", migration),
      "utf8",
    );
    await client.query(schema);
  }
}

async function main() {
  if (process.argv.includes("--schema-only")) {
    if (process.argv.includes("--apply")) {
      throw new Error("Use either --schema-only or --apply, not both.");
    }
    const client = new Client({ connectionString: getDatabaseUrl() });
    try {
      await client.connect();
      await applySchema(client);
      console.log("Neon schema is up to date. No Swell data was requested.");
    } finally {
      await client.end();
    }
    return;
  }

  const apply = process.argv.includes("--apply");
  const credentials = getCredentials();
  const firstPages = Object.fromEntries(
    await Promise.all(
      RESOURCES.map(async (resource) => [
        resource.name,
        await fetchPage(resource.name, 1, credentials),
      ]),
    ),
  );
  const client = apply
    ? new Client({ connectionString: getDatabaseUrl() })
    : null;

  try {
    if (client) {
      await client.connect();
      await applySchema(client);
    }

    const summary = {};
    for (const resource of RESOURCES) {
      summary[resource.name] = await importResource(
        resource,
        firstPages[resource.name],
        credentials,
        client,
      );
    }

    for (const [name, result] of Object.entries(summary)) {
      console.log(`${name}: ${result.imported} record(s) ${apply ? "imported" : "ready"}`);
    }

    const sensitiveFieldsOmitted =
      summary.accounts.redactedFields + summary.orders.redactedFields;
    if (sensitiveFieldsOmitted > 0) {
      console.log(
        `Customer/order sensitive fields omitted: ${sensitiveFieldsOmitted} field(s).`,
      );
    }

    console.log(
      apply
        ? "Migration complete. Existing records were upserted; no source records were deleted."
        : "Dry run complete. No Neon records were changed. Re-run with --apply to import.",
    );
  } finally {
    if (client) await client.end();
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Migration failed.");
    process.exitCode = 1;
  });
}
