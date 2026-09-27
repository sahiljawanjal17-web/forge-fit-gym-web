import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { BACKUP_FILE, DATA_DIR, ensureWritable } from "./paths";

const globalForDb = globalThis as unknown as { __forgePglite?: PGlite };

// A hard kill (closed terminal, crashed process) can leave the embedded Postgres folder unreadable
// ("could not locate a valid checkpoint record"). Before the app opens the DB, probe it; if it is
// broken, move it aside and restore the last backup, or let setup re-seed demo data if there is none.
export async function recoverDatabaseIfCorrupt() {
  if (globalForDb.__forgePglite) return; // already open in this process; probing would open a second instance
  ensureWritable(path.dirname(DATA_DIR));
  if (!fs.existsSync(path.join(DATA_DIR, "PG_VERSION"))) return;

  const probe = new PGlite(DATA_DIR);
  try {
    await probe.waitReady;
    await probe.query("select 1");
    await probe.close();
    return;
  } catch (error) {
    await probe.close().catch(() => {});
    console.error("[forge-fit] Database folder is damaged:", (error as Error).message);
  }

  const aside = `${DATA_DIR}-corrupt-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  fs.renameSync(DATA_DIR, aside);
  console.warn(`[forge-fit] Moved damaged database to ${aside}`);

  if (!fs.existsSync(BACKUP_FILE)) {
    console.warn("[forge-fit] No backup found; a fresh demo database will be seeded.");
    return;
  }
  const restored = new PGlite(DATA_DIR, { loadDataDir: new Blob([fs.readFileSync(BACKUP_FILE)]) });
  await restored.waitReady;
  await restored.close();
  console.log(`[forge-fit] Restored database from ${BACKUP_FILE}`);
}
