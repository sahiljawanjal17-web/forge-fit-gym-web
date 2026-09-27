import { sql } from "drizzle-orm";
import { ensureDatabase } from "../src/server/db/setup";

async function main() {
  await ensureDatabase();
  const { db } = await import("../src/server/db");
  for (const t of ["users", "products", "product_variants", "orders", "user_memberships", "facility_check_ins", "gym_equipment", "low_stock_alerts"]) {
    const r = await db.execute<{ c: number }>(sql.raw(`select count(*)::int as c from ${t}`));
    console.log(t.padEnd(22), r.rows[0].c);
  }
}

main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
