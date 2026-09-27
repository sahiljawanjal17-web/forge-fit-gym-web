import Link from "next/link";
import { Brain, TrendingUp } from "lucide-react";
import { PageTitle, StatCard, StatusBadge } from "@/components/dashboard/shell";
import { AttendanceHeatmap, ForecastChart } from "@/components/charts/charts";
import { requireStaff } from "@/lib/auth";
import { forecastRevenue, getAttendanceHeatmap, getInventory, getRevenueByMonth, getTopProducts, listMembers } from "@/server/services/analytics";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Analytics & AI" };

export default async function AnalyticsPage() {
  await requireStaff();
  const [history, forecast, heat, inventory, members, top] = await Promise.all([
    getRevenueByMonth(6), forecastRevenue(30), getAttendanceHeatmap(), getInventory(), listMembers(), getTopProducts(5),
  ]);
  const atRisk = members.filter((m) => m.churn.level === "high" || m.churn.level === "medium").sort((a, b) => b.churn.score - a.churn.score);
  const reorder = inventory.filter((i) => i.recommendedOrder > 0).sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999));

  return (
    <>
      <PageTitle title="Analytics & AI predictions" description="Forecasts and risk scores computed from live sales, stock and attendance data." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Forecast · next 30d" value={formatCurrency(forecast.projected)} hint={`Range ${formatCurrency(forecast.low)} – ${formatCurrency(forecast.high)}`} />
        <StatCard label="Monthly trend" value={`${forecast.trendPct >= 0 ? "+" : ""}${forecast.trendPct}%`} hint="Least-squares trend on completed months" tone={forecast.trendPct >= 0 ? "up" : "down"} />
        <StatCard label="Members at risk" value={String(atRisk.filter((m) => m.churn.level === "high").length)} hint={`${atRisk.length} medium or high churn risk`} tone="warn" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><TrendingUp className="h-5 w-5 text-primary" />Revenue forecast</h2>
          <ForecastChart history={history.slice(0, -1).map((h) => ({ month: h.month, total: Math.round(h.store + h.memberships) }))} forecast={forecast} />
        </section>
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold">Peak hours · last 30 days</h2>
          <AttendanceHeatmap data={heat} />
        </section>
      </div>

      <section className="mt-6 rounded-xl border bg-card p-6">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold"><Brain className="h-5 w-5 text-primary" />Stock demand forecast</h2>
        <p className="mb-4 text-sm text-muted-foreground">Based on 90-day sales velocity, supplier lead time and reorder levels.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="py-2">Product</th><th>In stock</th><th>Sold / day</th><th>Days left</th><th>30-day demand</th><th className="text-right">Order now</th></tr></thead>
            <tbody>
              {reorder.slice(0, 10).map((i) => (
                <tr key={i.inventoryId} className="border-b last:border-0">
                  <td className="py-3"><p className="font-medium">{i.product}</p><p className="text-xs text-muted-foreground">{i.variant}</p></td>
                  <td className="font-mono">{i.stock}</td><td className="font-mono">{i.perDay}</td>
                  <td>{i.daysLeft === null ? "—" : <span className={i.daysLeft < 14 ? "font-semibold text-destructive" : ""}>{i.daysLeft}d</span>}</td>
                  <td className="font-mono">{i.forecast30d}</td><td className="text-right font-mono font-semibold text-primary">+{i.recommendedOrder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Churn risk</h2>
          <ul className="divide-y">
            {atRisk.slice(0, 8).map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div><p className="text-sm font-medium">{m.name} <span className="text-xs text-muted-foreground">· {m.plan}</span></p><p className="text-xs text-muted-foreground">{m.churn.reasons.join(" · ")}</p></div>
                <div className="flex items-center gap-3"><span className="font-mono text-sm">{Math.round(m.churn.score * 100)}%</span><StatusBadge status={m.churn.level} /></div>
              </li>
            ))}
          </ul>
          <Link href="/admin/members" className="mt-3 inline-block text-sm text-primary">All members</Link>
        </section>
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold">Top products</h2>
          <ol className="space-y-3">
            {top.map((t, i) => (
              <li key={t.name} className="flex items-center justify-between gap-2 text-sm"><span><span className="mr-2 font-mono text-muted-foreground">{i + 1}</span>{t.name}</span><span className="font-mono">{formatCurrency(Math.round(t.revenue))}</span></li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
