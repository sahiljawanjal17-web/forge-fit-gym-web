import fs from "node:fs";
import path from "node:path";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { PGlite } from "@electric-sql/pglite";
import { BACKUP_FILE } from "./paths";
import { recoverDatabaseIfCorrupt } from "./recovery";
import { users } from "./schema";

const globalForSetup = globalThis as unknown as { __forgeSetup?: Promise<void> };

const CHECKPOINT_EVERY_MS = 60_000;
const BACKUP_EVERY_MS = 10 * 60_000;

// The DB client module is imported lazily so recovery can repair the folder before it opens.
const openDb = () => import("./index");

async function run() {
  const { client, db } = await openDb();
  const { seedDatabase } = await import("./seed");
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "src", "server", "db", "migrations") });
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length === 0) {
    console.log("[forge-fit] Empty database — seeding demo data…");
    await seedDatabase(db);
    console.log("[forge-fit] Seed complete.");
  }
  await backupDatabase();
  startMaintenance(client);
}

// Snapshot of a known-good database, used by recovery.ts after a crash.
export async function backupDatabase() {
  const { client } = await openDb();
  await client.exec("CHECKPOINT");
  const dump = await client.dumpDataDir("gzip");
  fs.mkdirSync(path.dirname(BACKUP_FILE), { recursive: true });
  const tmp = `${BACKUP_FILE}.tmp`;
  fs.writeFileSync(tmp, Buffer.from(await dump.arrayBuffer()));
  fs.renameSync(tmp, BACKUP_FILE);
}

function startMaintenance(client: PGlite) {
  // Frequent checkpoints keep the on-disk state valid if the process is killed.
  setInterval(() => client.exec("CHECKPOINT").catch(() => {}), CHECKPOINT_EVERY_MS).unref();
  setInterval(() => backupDatabase().catch((e) => console.error("[forge-fit] Backup failed:", e)), BACKUP_EVERY_MS).unref();

  // Ctrl+C / stop: checkpoint and close cleanly so the next start needs no recovery.
  const shutdown = () => {
    client.exec("CHECKPOINT").catch(() => {}).then(() => client.close()).catch(() => {}).finally(() => process.exit(0));
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

export function ensureDatabase() {
  return (globalForSetup.__forgeSetup ??= (async () => {
    await recoverDatabaseIfCorrupt();
    await run();
  })());
}
