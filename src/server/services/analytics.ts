import { and, desc, eq, gte, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "@/server/db";
import * as s from "@/server/db/schema";

const n = (v: unknown) => Number(v ?? 0);

export async function getKpis() {
  const month = new Date(Date.now() - 30 * 86400000);
  const prev = new Date(Date.now() - 60 * 86400000);
  const [rev] = await db.select({
    cur: sql`coalesce(sum(case when ${s.paymentTransactions.createdAt} >= ${month} then ${s.paymentTransactions.amount} end),0)`,
    prev: sql`coalesce(sum(case when ${s.paymentTransactions.createdAt} >= ${prev} and ${s.paymentTransactions.createdAt} < ${month} then ${s.paymentTransactions.amount} end),0)`,
    total: sql`coalesce(sum(${s.paymentTransactions.amount}),0)`,
  }).from(s.paymentTransactions).where(eq(s.paymentTransactions.status, "succeeded"));
  const [members] = await db.select({
    active: sql`count(*) filter (where ${s.userMemberships.status} = 'active')`,
    newThisMonth: sql`count(*) filter (where ${s.userMemberships.createdAt} >= ${month})`,
    churned: sql`count(*) filter (where ${s.userMemberships.status} in ('cancelled','expired'))`,
    total: sql`count(*)`,
  }).from(s.userMemberships);
  const [orders] = await db.select({
    cur: sql`count(*) filter (where ${s.orders.createdAt} >= ${month})`,
    prev: sql`count(*) filter (where ${s.orders.createdAt} >= ${prev} and ${s.orders.createdAt} < ${month})`,
    open: sql`count(*) filter (where ${s.orders.status} in ('pending','processing'))`,
  }).from(s.orders);
  const [mrr] = await db.select({
    v: sql`coalesce(sum(case when ${s.membershipPlans.billingCycle} = 'annual' then ${s.membershipPlans.price} / 12 else ${s.membershipPlans.price} end),0)`,
  }).from(s.userMemberships).innerJoin(s.membershipPlans, eq(s.membershipPlans.id, s.userMemberships.planId)).where(eq(s.userMemberships.status, "active"));
  const [lowStock] = await db.select({ c: sql`count(*)` }).from(s.inventory).where(sql`${s.inventory.quantityAvailable} < ${s.inventory.reorderLevel}`);
  const delta = (a: number, b: number) => (b === 0 ? 0 : +(((a - b) / b) * 100).toFixed(1));
  return {
    revenue30d: n(rev.cur), revenueDelta: delta(n(rev.cur), n(rev.prev)), revenueTotal: n(rev.total),
    activeMembers: n(members.active), newMembers30d: n(members.newThisMonth),
    churnRate: n(members.total) ? +((n(members.churned) / n(members.total)) * 100).toFixed(1) : 0,
    orders30d: n(orders.cur), ordersDelta: delta(n(orders.cur), n(orders.prev)), openOrders: n(orders.open),
    mrr: Math.round(n(mrr.v)), arr: Math.round(n(mrr.v) * 12), lowStockCount: n(lowStock.c),
  };
}

export async function getRevenueByMonth(months = 6) {
  const rows = await db.execute<{ month: string; store: number; memberships: number }>(sql`
    select to_char(date_trunc('month', created_at), 'Mon YY') as month,
      coalesce(sum(amount) filter (where order_id is not null), 0)::float as store,
      coalesce(sum(amount) filter (where membership_id is not null), 0)::float as memberships
    from payment_transactions
    where status = 'succeeded' and created_at >= date_trunc('month', now()) - (${months - 1} || ' months')::interval
    group by date_trunc('month', created_at) order by date_trunc('month', created_at)`);
  return rows.rows;
}

export async function getTierDistribution() {
  return db.select({ tier: s.membershipPlans.tier, count: sql<number>`count(*)::int` })
    .from(s.userMemberships).innerJoin(s.membershipPlans, eq(s.membershipPlans.id, s.userMemberships.planId))
    .where(eq(s.userMemberships.status, "active")).groupBy(s.membershipPlans.tier);
}

export async function getAttendanceHeatmap() {
  const rows = await db.execute<{ dow: number; hour: number; c: number }>(sql`
    select extract(dow from check_in_time)::int as dow, extract(hour from check_in_time)::int as hour, count(*)::int as c
    from facility_check_ins where check_in_time >= now() - interval '30 days' group by 1, 2`);
  return rows.rows;
}

export async function getInventory(opts: { lowOnly?: boolean; q?: string } = {}) {
  const sold = db.$with("sold").as(
    db.select({ variantId: s.orderItems.variantId, qty: sql<number>`sum(${s.orderItems.quantity})::float`.as("qty") })
      .from(s.orderItems).innerJoin(s.orders, eq(s.orders.id, s.orderItems.orderId))
      .where(and(gte(s.orders.createdAt, new Date(Date.now() - 90 * 86400000)), ne(s.orders.status, "cancelled")))
      .groupBy(s.orderItems.variantId),
  );
  const rows = await db.with(sold).select({
    inventoryId: s.inventory.id, variantId: s.productVariants.id, sku: s.productVariants.sku, variant: s.productVariants.name, product: s.products.name,
    stock: s.inventory.quantityAvailable, reorderLevel: s.inventory.reorderLevel, reorderQuantity: s.inventory.reorderQuantity,
    sold90d: sql<number>`coalesce(${sold.qty}, 0)`, supplier: s.suppliers.name,
  })
    .from(s.inventory)
    .innerJoin(s.productVariants, eq(s.productVariants.id, s.inventory.variantId))
    .innerJoin(s.products, eq(s.products.id, s.productVariants.productId))
    .leftJoin(s.suppliers, eq(s.suppliers.id, s.inventory.supplierId))
    .leftJoin(sold, eq(sold.variantId, s.inventory.variantId))
    .where(and(opts.lowOnly ? sql`${s.inventory.quantityAvailable} < ${s.inventory.reorderLevel}` : undefined, opts.q ? ilike(s.products.name, `%${opts.q}%`) : undefined))
    .orderBy(s.inventory.quantityAvailable);
  // Demand forecast: 90-day sales velocity projected over supplier lead time + 30 days of cover.
  return rows.map((r) => {
    const perDay = n(r.sold90d) / 90;
    const daysLeft = perDay > 0 ? Math.floor(r.stock / perDay) : null;
    const forecast30d = Math.ceil(perDay * 30);
    const recommendedOrder = Math.max(0, Math.ceil(perDay * 44) + r.reorderLevel - r.stock);
    return { ...r, sold90d: n(r.sold90d), perDay: +perDay.toFixed(2), daysLeft, forecast30d, recommendedOrder, low: r.stock < r.reorderLevel };
  });
}

export async function adjustStock(inventoryId: string, change: number, performedBy: string, note?: string) {
  const [inv] = await db.update(s.inventory)
    .set({ quantityAvailable: sql`greatest(${s.inventory.quantityAvailable} + ${change}, 0)`, updatedAt: new Date() })
    .where(eq(s.inventory.id, inventoryId)).returning();
  if (!inv) throw new Error("Inventory item not found.");
  await db.insert(s.stockHistory).values({ inventoryId, transactionType: change > 0 ? "purchase_order" : "manual_adjustment", quantityChange: change, performedBy, notes: note });
  if (inv.quantityAvailable >= inv.reorderLevel) {
    await db.update(s.lowStockAlerts).set({ isResolved: true, updatedAt: new Date() }).where(eq(s.lowStockAlerts.inventoryId, inventoryId));
  }
  return inv;
}

export async function listMembers(opts: { q?: string; limit?: number } = {}) {
  const lastVisit = sql<Date | null>`(select max(check_in_time) from facility_check_ins c where c.user_id = ${s.users.id})`;
  const visits30 = sql<number>`(select count(*)::int from facility_check_ins c where c.user_id = ${s.users.id} and c.check_in_time >= now() - interval '30 days')`;
  const rows = await db.select({
    id: s.users.id, name: s.users.name, email: s.users.email, role: s.users.role, status: s.users.status, joined: s.users.createdAt,
    plan: s.membershipPlans.name, tier: s.membershipPlans.tier, membershipStatus: s.userMemberships.status, autoRenew: s.userMemberships.autoRenew,
    endDate: s.userMemberships.endDate, lastVisit, visits30,
    spend: sql<number>`(select coalesce(sum(amount),0)::float from payment_transactions p where p.user_id = ${s.users.id} and p.status = 'succeeded')`,
  })
    .from(s.users)
    .leftJoin(s.userMemberships, and(eq(s.userMemberships.userId, s.users.id), sql`${s.userMemberships.id} = (select id from user_memberships um where um.user_id = ${s.users.id} order by created_at desc limit 1)`))
    .leftJoin(s.membershipPlans, eq(s.membershipPlans.id, s.userMemberships.planId))
    .where(and(eq(s.users.role, "customer"), opts.q ? or(ilike(s.users.name, `%${opts.q}%`), ilike(s.users.email, `%${opts.q}%`)) : undefined))
    .orderBy(desc(s.users.createdAt))
    .limit(opts.limit ?? 200);
  return rows.map((r) => ({ ...r, churn: churnScore(r) }));
}

// Rule-based churn model: weights visit frequency, recency, renewal intent and membership state.
function churnScore(m: { membershipStatus: string | null; visits30: number; lastVisit: Date | string | null; autoRenew: boolean | null }) {
  if (!m.membershipStatus || m.membershipStatus === "cancelled" || m.membershipStatus === "expired") return { score: 1, level: "churned" as const, reasons: ["Membership inactive"] };
  const reasons: string[] = [];
  let score = 0.05;
  const days = m.lastVisit ? (Date.now() - new Date(m.lastVisit).getTime()) / 86400000 : 99;
  if (m.visits30 < 4) { score += 0.3; reasons.push(`Only ${m.visits30} visits in 30 days`); }
  if (days > 10) { score += 0.3; reasons.push(`No visit for ${Math.floor(days)} days`); }
  if (!m.autoRenew) { score += 0.2; reasons.push("Auto-renew turned off"); }
  if (m.membershipStatus === "paused") { score += 0.15; reasons.push("Membership paused"); }
  score = Math.min(0.99, +score.toFixed(2));
  return { score, level: score >= 0.6 ? ("high" as const) : score >= 0.35 ? ("medium" as const) : ("low" as const), reasons };
}

export async function listPayments(limit = 100) {
  return db.select({
    id: s.paymentTransactions.id, amount: s.paymentTransactions.amount, currency: s.paymentTransactions.currency, status: s.paymentTransactions.status,
    gateway: s.paymentTransactions.gateway, createdAt: s.paymentTransactions.createdAt, customer: s.users.name,
    purpose: sql<string>`case when ${s.paymentTransactions.orderId} is not null then 'Store order' else 'Membership' end`,
  }).from(s.paymentTransactions).leftJoin(s.users, eq(s.users.id, s.paymentTransactions.userId))
    .orderBy(desc(s.paymentTransactions.createdAt)).limit(limit);
}

export async function getTopProducts(limit = 5) {
  return db.select({ name: s.products.name, units: sql<number>`sum(${s.orderItems.quantity})::int`, revenue: sql<number>`sum(${s.orderItems.quantity} * ${s.orderItems.priceAtPurchase})::float` })
    .from(s.orderItems).innerJoin(s.productVariants, eq(s.productVariants.id, s.orderItems.variantId)).innerJoin(s.products, eq(s.products.id, s.productVariants.productId))
    .groupBy(s.products.name).orderBy(desc(sql`sum(${s.orderItems.quantity} * ${s.orderItems.priceAtPurchase})`)).limit(limit);
}

export async function forecastRevenue(daysAhead = 30) {
  const hist = await getRevenueByMonth(6);
  const totals = hist.map((h) => h.store + h.memberships);
  const full = totals.slice(0, -1);
  if (full.length < 2) return { daysAhead, projected: totals.at(-1) ?? 0, low: 0, high: 0, trendPct: 0 };
  // Least-squares trend over completed months.
  const xs = full.map((_, i) => i);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = full.reduce((a, b) => a + b, 0) / full.length;
  const slope = xs.reduce((a, x, i) => a + (x - mx) * (full[i] - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  const next = Math.max(0, my + slope * (full.length - mx));
  const projected = Math.round((next * daysAhead) / 30);
  const sd = Math.sqrt(full.reduce((a, v) => a + (v - my) ** 2, 0) / full.length);
  return { daysAhead, projected, low: Math.max(0, Math.round(projected - sd)), high: Math.round(projected + sd), trendPct: my ? +((slope / my) * 100).toFixed(1) : 0 };
}
