import "server-only";

import { Pool } from "pg";

const globalForNeon = globalThis as typeof globalThis & {
  neonPool?: Pool;
};

function normalizeSslMode(connectionString: string): string {
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode");
  if (
    sslMode === "prefer" ||
    sslMode === "require" ||
    sslMode === "verify-ca"
  ) {
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing Neon configuration. Set DATABASE_URL.");
  }
  return new Pool({
    connectionString: normalizeSslMode(connectionString),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export const neonPool = globalForNeon.neonPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForNeon.neonPool = neonPool;
}

export async function queryNeon<T extends Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  const result = await neonPool.query<T>(text, values);
  return result.rows;
}
