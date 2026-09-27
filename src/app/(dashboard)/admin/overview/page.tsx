import Link from "next/link";
import { AlertTriangle, Sparkles } from "lucide-react";
import { PageTitle, StatCard, StatusBadge } from "@/components/dashboard/shell";
import { RevenueChart, TierChart } from "@/components/charts/charts";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth";
import { getInventory, getKpis, getRevenueByMonth, getTierDistribution } from "@/server/services/analytics";
import { listOrders } from "@/server/services/store";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Owner overview" };

const pct = (v: number) => `${v >= 0 ? "▲" : "▼"} ${Math.abs(v)}% vs previous 30 days`;

export default async function OverviewPage() {
  const user = await requireStaff();
  const [k, revenue, tiers, orders, low] = await Promise.all([getKpis(), getRevenueByMonth(6), getTierDistribution(), listOrders({ limit: 6 }), getInventory({ lowOnly: true })]);
  return (
    <>
      <PageTitle title={`Good day, ${user.name.split(" ")[0]}`} description="Live snapshot across all 5 clubs and the online store." action={<Button asChild><Link href="/admin/ai"><Sparkles className="mr-2 h-4 w-4" />Ask Forge AI</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue · 30d" value={formatCurrency(Math.round(k.revenue30d))} hint={pct(k.revenueDelta)} tone={k.revenueDelta >= 0 ? "up" : "down"} />
        <StatCard label="MRR" value={formatCurrency(k.mrr)} hint={`ARR ${formatCurrency(k.arr)}`} />
        <StatCard label="Active members" value={String(k.activeMembers)} hint={`+${k.newMembers30d} new · churn ${k.churnRate}%`} tone="up" />
        <StatCard label="Orders · 30d" value={String(k.orders30d)} hint={pct(k.ordersDelta)} tone={k.ordersDelta >= 0 ? "up" : "down"} />
      </div>

      {low.length > 0 && (
        <Link href="/admin/inventory" className="mt-6 flex items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm hover:bg-warning/15">
          <AlertTriangle className="h-5 w-5 text-warning" /><span><b>{low.length} items</b> are below reorder level: {low.slice(0, 3).map((l) => `${l.product} (${l.variant})`).join(", ")}{low.length > 3 ? "…" : ""}</span>
        </Link>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-6 lg:col-span-2"><h2 className="mb-4 text-lg font-bold">Revenue · last 6 months</h2><RevenueChart data={revenue} /></section>
        <section className="rounded-xl border bg-card p-6"><h2 className="mb-4 text-lg font-bold">Active members by tier</h2><TierChart data={tiers} /></section>
      </div>

      <section className="mt-6 rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Latest orders</h2><Link href="/admin/orders" className="text-sm text-primary">Manage orders</Link></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="py-2">Order</th><th>Customer</th><th>Placed</th><th>Status</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-3 font-mono"><Link href={`/admin/orders/${o.id}`} className="hover:text-primary">#{o.number}</Link></td>
                  <td>{o.customer}</td><td className="text-muted-foreground">{formatRelativeTime(o.createdAt)}</td>
                  <td><StatusBadge status={o.status} /></td><td className="text-right font-mono">{formatCurrency(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
