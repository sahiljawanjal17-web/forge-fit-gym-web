import Link from "next/link";
import { PageTitle, StatusBadge } from "@/components/dashboard/shell";
import { OrderStatusSelect } from "@/components/dashboard/admin-controls";
import { requireStaff } from "@/lib/auth";
import { listOrders } from "@/server/services/store";
import { orderStatusEnum } from "@/server/db/schema";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Orders" };

type Status = (typeof orderStatusEnum.enumValues)[number];

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: Status } }) {
  await requireStaff();
  const status = orderStatusEnum.enumValues.includes(searchParams.status as Status) ? searchParams.status : undefined;
  const orders = await listOrders({ status, limit: 200 });
  return (
    <>
      <PageTitle title="Orders" description="Fulfil, ship and refund store orders." />
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...orderStatusEnum.enumValues].map((s) => (
          <Link key={s} href={s === "all" ? "/admin/orders" : `/admin/orders?status=${s}`} className={cn("rounded-full border px-3 py-1 text-xs capitalize", (s === "all" ? !status : status === s) ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50")}>{s}</Link>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="p-4">Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Payment</th><th>Status</th><th className="p-4 text-right">Total</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="p-4 font-mono"><Link href={`/admin/orders/${o.id}`} className="hover:text-primary">#{o.number}</Link></td>
                <td><p>{o.customer}</p><p className="text-xs text-muted-foreground">{o.email}</p></td>
                <td className="text-muted-foreground">{formatDate(o.createdAt, "d MMM yy")}</td>
                <td>{o.items.reduce((a, i) => a + i.quantity, 0)}</td>
                <td><StatusBadge status={o.paymentStatus} /></td>
                <td><OrderStatusSelect orderId={o.id} status={o.status} /></td>
                <td className="p-4 text-right font-mono">{formatCurrency(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-10 text-center text-muted-foreground">No orders.</p>}
      </div>
    </>
  );
}
