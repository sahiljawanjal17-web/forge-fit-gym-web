import fs from "node:fs";
import path from "node:path";

// All persistent data lives in <project>/data so it can be backed up or moved as one folder.
// This module has no side effects on import, so recovery can run before the DB client opens.
export const DATA_DIR = process.env.FORGE_DATA_DIR ?? path.join(process.cwd(), "data", "pglite");
export const BACKUP_FILE = path.join(path.dirname(DATA_DIR), "backup", "pglite-latest.tar.gz");

// Windows/OneDrive can mark folders Read-only when copied; Node then reports mode 444 and
// PGlite's virtual FS refuses to create postmaster.pid ("PGlite failed to initialize properly").
export function ensureWritable(target: string) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (!(stat.mode & 0o200)) fs.chmodSync(target, stat.isDirectory() ? 0o755 : 0o644);
  if (stat.isDirectory()) for (const entry of fs.readdirSync(target)) ensureWritable(path.join(target, entry));
}
