import Link from "next/link";
import { ArrowRight, Bell, MapPin, Sparkles } from "lucide-react";
import { PageTitle, StatCard, StatusBadge } from "@/components/dashboard/shell";
import { ActionButton } from "@/components/dashboard/action-button";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { checkInAction } from "@/server/actions";
import { getMembership, getMemberActivity, listClubs, listNotifications } from "@/server/services/gym";
import { getMemberDiscount, listOrders } from "@/server/services/store";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function MemberDashboard() {
  const user = await requireUser();
  const [membership, activity, orders, notifications, clubs, discount] = await Promise.all([
    getMembership(user.id), getMemberActivity(user.id), listOrders({ userId: user.id, limit: 3 }), listNotifications(user.id, 5), listClubs(), getMemberDiscount(user.id),
  ]);
  const goal = 16;

  return (
    <>
      <PageTitle title={`Hey ${user.name.split(" ")[0]} 👋`} description="Here's your training and account snapshot." action={<Button asChild><Link href="/member/ai"><Sparkles className="mr-2 h-4 w-4" />Ask Forge AI</Link></Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Membership" value={membership ? membership.plan.name.replace(/ (Monthly|Annual)/, "") : "None"} hint={membership ? `Renews ${formatDate(membership.endDate!, "d MMM yyyy")}` : "Choose a plan to start"} />
        <StatCard label="Visits · 30 days" value={String(activity.visits30d)} hint={`${Math.min(100, Math.round((activity.visits30d / goal) * 100))}% of ${goal}-visit goal`} tone={activity.visits30d >= goal ? "up" : undefined} />
        <StatCard label="Orders" value={String(orders.length)} hint={orders[0] ? `Latest: ${orders[0].status}` : "No orders yet"} />
        <StatCard label="Store discount" value={`${discount.rate * 100}%`} hint={discount.rate ? "Applied automatically" : "Upgrade to Premium for 10%"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Recent orders</h2><Link href="/member/orders" className="text-sm text-primary">View all</Link></div>
          {orders.length === 0 ? <p className="text-sm text-muted-foreground">No orders yet. <Link href="/shop" className="text-primary">Visit the store</Link></p> : (
            <ul className="divide-y">
              {orders.map((o) => (
                <li key={o.id}><Link href={`/member/orders/${o.id}`} className="flex items-center justify-between gap-4 py-3 hover:text-primary">
                  <div><p className="font-mono text-sm font-medium">#{o.number}</p><p className="text-xs text-muted-foreground">{o.items.map((i) => i.name).join(", ")}</p></div>
                  <div className="text-right"><p className="font-mono text-sm">{formatCurrency(o.total)}</p><StatusBadge status={o.status} /></div>
                </Link></li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-bold">Check in</h2>
          {membership?.status === "active" ? (
            <div className="space-y-2">
              {clubs.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <span className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" />{c.city}</span>
                  <ActionButton size="sm" variant="outline" action={checkInAction.bind(null, c.id)}>Check in</ActionButton>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">You need an active membership to check in. <Link href="/member/membership" className="text-primary">Manage membership</Link></p>
          )}
        </section>

        <section className="rounded-xl border bg-card p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold">Recent visits</h2>
          {activity.recent.length === 0 ? <p className="text-sm text-muted-foreground">No visits in the last 30 days.</p> : (
            <ul className="space-y-2 text-sm">{activity.recent.map((v, i) => <li key={i} className="flex justify-between"><span>{v.club}</span><span className="text-muted-foreground">{formatRelativeTime(v.t)}</span></li>)}</ul>
          )}
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Bell className="h-4 w-4" />Notifications</h2>
          {notifications.length === 0 ? <p className="text-sm text-muted-foreground">You're all caught up.</p> : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li key={n.id} className="text-sm">
                  <Link href={n.actionUrl ?? "#"} className="group block"><p className="font-medium group-hover:text-primary">{n.title}</p><p className="text-xs text-muted-foreground">{n.body} · {formatRelativeTime(n.createdAt)}</p></Link>
                </li>
              ))}
            </ul>
          )}
          <Link href="/shop" className="mt-5 flex items-center text-sm font-medium text-primary">Shop member deals <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </section>
      </div>
    </>
  );
}
