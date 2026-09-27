import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";
import { DATA_DIR, ensureWritable } from "./paths";

export { DATA_DIR } from "./paths";

fs.mkdirSync(path.dirname(DATA_DIR), { recursive: true });

const globalForDb = globalThis as unknown as { __forgePglite?: PGlite };

// Next.js dev re-evaluates modules; two PGlite instances on one directory would corrupt it.
export const client = globalForDb.__forgePglite ?? createClient();

function createClient() {
  ensureWritable(path.dirname(DATA_DIR));
  const pg = new PGlite(DATA_DIR);
  globalForDb.__forgePglite = pg;
  return pg;
}

export const db = drizzle(client, { schema });
export type DB = typeof db;
