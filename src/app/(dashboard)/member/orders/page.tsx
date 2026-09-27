import Link from "next/link";
import { PageTitle, StatusBadge } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { listOrders } from "@/server/services/store";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function MemberOrdersPage() {
  const user = await requireUser();
  const orders = await listOrders({ userId: user.id });
  return (
    <>
      <PageTitle title="Orders" description="Track deliveries and view past purchases." action={<Button asChild variant="outline"><Link href="/shop">Continue shopping</Link></Button>} />
      {orders.length === 0 ? <p className="rounded-xl border bg-card p-10 text-center text-muted-foreground">No orders yet.</p> : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/member/orders/${o.id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5 transition hover:border-primary/40">
              <div>
                <p className="font-mono font-semibold">#{o.number}</p>
                <p className="text-xs text-muted-foreground">{formatDate(o.createdAt, "d MMM yyyy")} · {o.items.reduce((a, i) => a + i.quantity, 0)} items</p>
                <p className="mt-1 max-w-md truncate text-sm text-muted-foreground">{o.items.map((i) => `${i.name} (${i.variant})`).join(", ")}</p>
              </div>
              <div className="flex items-center gap-4"><StatusBadge status={o.status} /><span className="font-mono font-semibold">{formatCurrency(o.total)}</span></div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
