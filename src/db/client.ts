import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/** True once a Neon connection string is configured. */
export const isDbConfigured = Boolean(process.env.DATABASE_URL);

/**
 * Lazily-created Drizzle client. Throws only if used without DATABASE_URL —
 * callers should guard with `isDbConfigured` and fall back to demo data.
 */
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export { schema };
