import { Check } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/shell";
import type { getOrder } from "@/server/services/store";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const STEPS = ["pending", "processing", "shipped", "delivered"];

export function OrderDetail({ order }: { order: NonNullable<Awaited<ReturnType<typeof getOrder>>> }) {
  const reached = STEPS.indexOf(order.status);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {reached >= 0 && (
          <section className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => (
                <div key={s} className="flex flex-1 flex-col items-center gap-2 text-center">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs", i <= reached ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground")}>{i <= reached ? <Check className="h-4 w-4" /> : i + 1}</span>
                  <span className="text-xs capitalize">{s}</span>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className="rounded-xl border bg-card">
          <ul className="divide-y">
            {order.items.map((i, k) => (
              <li key={k} className="flex justify-between gap-4 p-4 text-sm">
                <div><p className="font-medium">{i.name}</p><p className="text-xs text-muted-foreground">{i.variant} · Qty {i.quantity} × {formatCurrency(i.price)}</p></div>
                <span className="font-mono">{formatCurrency(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <aside className="space-y-4">
        <section className="space-y-2 rounded-xl border bg-card p-6 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={order.status} /></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><StatusBadge status={order.paymentStatus} /></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Placed</span><span>{formatDate(order.createdAt, "d MMM yyyy, HH:mm")}</span></div>
          <div className="flex justify-between border-t pt-2"><span className="text-muted-foreground">Items (after discount)</span><span className="font-mono">{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-mono">{order.shipping ? formatCurrency(order.shipping) : "Free"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="font-mono">{formatCurrency(order.tax)}</span></div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><span className="font-mono">{formatCurrency(order.total)}</span></div>
        </section>
        <section className="rounded-xl border bg-card p-6 text-sm">
          <h3 className="mb-2 font-sans text-sm font-semibold tracking-normal">Ship to</h3>
          <p className="text-muted-foreground">{order.address.fullName}<br />{order.address.street}<br />{order.address.city} {order.address.postalCode}<br />{order.address.country}</p>
          <p className="mt-3 text-xs text-muted-foreground">{order.customer} · {order.email}</p>
        </section>
      </aside>
    </div>
  );
}
