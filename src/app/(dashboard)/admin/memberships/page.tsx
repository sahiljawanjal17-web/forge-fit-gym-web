import { PageTitle, StatCard } from "@/components/dashboard/shell";
import { TierChart } from "@/components/charts/charts";
import { requireStaff } from "@/lib/auth";
import { getKpis, getTierDistribution } from "@/server/services/analytics";
import { listPlans } from "@/server/services/gym";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Memberships" };

export default async function MembershipsAdminPage() {
  await requireStaff();
  const [plans, tiers, k] = await Promise.all([listPlans(), getTierDistribution(), getKpis()]);
  return (
    <>
      <PageTitle title="Memberships" description="Plans, pricing and tier mix." />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <StatCard label="Active" value={String(k.activeMembers)} />
        <StatCard label="New · 30d" value={String(k.newMembers30d)} tone="up" hint="Sign-ups" />
        <StatCard label="MRR" value={formatCurrency(k.mrr)} />
        <StatCard label="Churn rate" value={`${k.churnRate}%`} tone="warn" hint="Cancelled + expired" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="overflow-x-auto rounded-xl border bg-card lg:col-span-2">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-4">Plan</th><th>Tier</th><th>Billing</th><th>Price</th><th className="p-4">Active members</th></tr></thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-4 font-medium">{p.name}</td><td className="capitalize">{p.tier}</td><td className="capitalize">{p.billingCycle}</td>
                  <td className="font-mono">{formatCurrency(p.price)}</td>
                  <td className="p-4 font-mono">{p.billingCycle === "monthly" ? tiers.find((t) => t.tier === p.tier)?.count ?? 0 : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-4 text-xs text-muted-foreground">Active member counts are shown per tier (monthly + annual combined).</p>
        </section>
        <section className="rounded-xl border bg-card p-6"><h2 className="mb-4 text-lg font-bold">Tier mix</h2><TierChart data={tiers} /></section>
      </div>
    </>
  );
}
