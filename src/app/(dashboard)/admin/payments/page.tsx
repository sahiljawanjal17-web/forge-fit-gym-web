import { PageTitle, StatCard, StatusBadge } from "@/components/dashboard/shell";
import { requireStaff } from "@/lib/auth";
import { listPayments } from "@/server/services/analytics";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Payments" };

export default async function PaymentsPage() {
  await requireStaff();
  const payments = await listPayments(300);
  const sum = (g: string) => payments.filter((p) => p.gateway === g && p.status === "succeeded").reduce((a, p) => a + Number(p.amount), 0);
  return (
    <>
      <PageTitle title="Payments" description="All transactions across Stripe, Razorpay (UPI/EMI) and front-desk POS." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Stripe" value={formatCurrency(Math.round(sum("stripe")))} hint="Cards, Klarna, Afterpay" />
        <StatCard label="Razorpay" value={formatCurrency(Math.round(sum("razorpay")))} hint="UPI, net banking, EMI" />
        <StatCard label="Front desk" value={formatCurrency(Math.round(sum("cash_pos")))} hint="Cash & POS" />
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[700px] text-sm">
          <thead><tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-4">Date</th><th>Customer</th><th>Purpose</th><th>Gateway</th><th>Status</th><th className="p-4 text-right">Amount</th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-4 text-muted-foreground">{formatDate(p.createdAt, "d MMM yy, HH:mm")}</td>
                <td>{p.customer ?? "—"}</td><td>{p.purpose}</td>
                <td className="capitalize">{p.gateway.replace("_", " ")}</td>
                <td><StatusBadge status={p.status} /></td>
                <td className="p-4 text-right font-mono">{formatCurrency(Number(p.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
