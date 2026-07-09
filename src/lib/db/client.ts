import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Returns a Drizzle client, or `null` when DATABASE_URL is not configured.
 * The page degrades gracefully (renders without revenue) when there's no DB.
 */
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export type Db = NonNullable<ReturnType<typeof getDb>>;
export { schema };
