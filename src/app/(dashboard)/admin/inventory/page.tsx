import Link from "next/link";
import { PageTitle, StatCard, StatusBadge } from "@/components/dashboard/shell";
import { StockAdjuster } from "@/components/dashboard/admin-controls";
import { requireStaff } from "@/lib/auth";
import { getInventory } from "@/server/services/analytics";
import { cn } from "@/lib/utils";

export const metadata = { title: "Inventory" };

export default async function InventoryPage({ searchParams }: { searchParams: { low?: string } }) {
  await requireStaff();
  const all = await getInventory();
  const rows = searchParams.low ? all.filter((r) => r.low) : all;
  const units = all.reduce((a, r) => a + r.stock, 0);
  return (
    <>
      <PageTitle title="Inventory" description="Stock levels with AI demand forecast and one-click restocking." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="SKUs" value={String(all.length)} />
        <StatCard label="Units on hand" value={units.toLocaleString()} />
        <StatCard label="Below reorder level" value={String(all.filter((r) => r.low).length)} tone="warn" hint="Restock suggested" />
      </div>
      <div className="mb-4 flex gap-2">
        <Link href="/admin/inventory" className={cn("rounded-full border px-3 py-1 text-xs", !searchParams.low && "border-primary bg-primary text-primary-foreground")}>All</Link>
        <Link href="/admin/inventory?low=1" className={cn("rounded-full border px-3 py-1 text-xs", searchParams.low && "border-primary bg-primary text-primary-foreground")}>Low stock</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead><tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-4">Product</th><th>SKU</th><th>Stock</th><th>Reorder at</th><th>Sold 90d</th><th>Days left</th><th>Supplier</th><th className="p-4 text-right">Adjust</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.inventoryId} className="border-b last:border-0">
                <td className="p-4"><p className="font-medium">{r.product}</p><p className="text-xs text-muted-foreground">{r.variant}</p></td>
                <td className="font-mono text-xs text-muted-foreground">{r.sku}</td>
                <td className="font-mono">{r.stock} {r.low && <StatusBadge status="low_stock" />}</td>
                <td className="font-mono">{r.reorderLevel}</td>
                <td className="font-mono">{r.sold90d}</td>
                <td>{r.daysLeft ?? "—"}</td>
                <td className="text-xs text-muted-foreground">{r.supplier}</td>
                <td className="p-4"><StockAdjuster inventoryId={r.inventoryId} suggested={r.recommendedOrder} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
