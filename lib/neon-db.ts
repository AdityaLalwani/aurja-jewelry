import "server-only";

import { Pool } from "pg";

const globalForNeon = globalThis as typeof globalThis & {
  neonPool?: Pool;
};

function normalizeSslMode(connectionString: string): string {
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error(
      "Invalid Neon configuration. DATABASE_URL must be a PostgreSQL connection URL.",
    );
  }

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

function getPool(): Pool {
  if (globalForNeon.neonPool) {
    return globalForNeon.neonPool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing Neon configuration. Set DATABASE_URL.");
  }

  const pool = new Pool({
    connectionString: normalizeSslMode(connectionString),
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForNeon.neonPool = pool;
  }
  return pool;
}

export async function queryNeon<T extends Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, values);
  return result.rows;
}
