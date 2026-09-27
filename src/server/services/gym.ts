import { and, asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/server/db";
import * as s from "@/server/db/schema";
import { PLAN_FEATURES } from "@/server/db/seed/data";

export async function listPlans(cycle?: "monthly" | "annual") {
  const plans = await db.query.membershipPlans.findMany({
    where: cycle ? eq(s.membershipPlans.billingCycle, cycle) : undefined,
    orderBy: asc(s.membershipPlans.price),
  });
  return plans.map((p) => ({ ...p, price: Number(p.price), features: PLAN_FEATURES[p.tier] ?? [] }));
}

export async function getMembership(userId: string) {
  const m = await db.query.userMemberships.findFirst({
    where: and(eq(s.userMemberships.userId, userId), inArray(s.userMemberships.status, ["active", "paused", "pending"])),
    orderBy: desc(s.userMemberships.createdAt),
    with: { plan: true },
  });
  if (!m) return null;
  return { ...m, plan: { ...m.plan, price: Number(m.plan.price), features: PLAN_FEATURES[m.plan.tier] ?? [] } };
}

export async function subscribe(userId: string, planId: string, paymentMethod: "card" | "upi" | "pay_at_club" = "card") {
  const plan = await db.query.membershipPlans.findFirst({ where: eq(s.membershipPlans.id, planId) });
  if (!plan) throw new Error("Plan not found.");
  return db.transaction(async (tx) => {
    const current = await tx.query.userMemberships.findFirst({ where: and(eq(s.userMemberships.userId, userId), inArray(s.userMemberships.status, ["active", "paused", "pending"])) });
    if (current) {
      await tx.update(s.userMemberships).set({ status: "cancelled", autoRenew: false, updatedAt: new Date() }).where(eq(s.userMemberships.id, current.id));
      await tx.insert(s.membershipHistory).values({ membershipId: current.id, oldStatus: current.status, newStatus: "cancelled", changedBy: userId, notes: `Switched to ${plan.name}` });
    }
    const start = new Date();
    const days = plan.billingCycle === "annual" ? 365 : plan.billingCycle === "quarterly" ? 90 : plan.billingCycle === "semi_annual" ? 182 : 30;
    const paid = paymentMethod !== "pay_at_club";
    const [ms] = await tx.insert(s.userMemberships).values({
      userId, planId, status: paid ? "active" : "pending", startDate: start, endDate: new Date(start.getTime() + days * 86400000),
    }).returning();
    await tx.insert(s.membershipHistory).values({ membershipId: ms.id, newStatus: ms.status, changedBy: userId, notes: `Subscribed to ${plan.name}` });
    await tx.insert(s.paymentTransactions).values({
      userId, membershipId: ms.id, amount: plan.price, status: paid ? "succeeded" : "pending",
      gateway: paymentMethod === "upi" ? "razorpay" : paymentMethod === "card" ? "stripe" : "cash_pos", metadata: { method: paymentMethod, mode: "demo" },
    });
    await tx.insert(s.userNotifications).values({ userId, type: "membership_renewal", channel: "in_app", title: `Welcome to ${plan.name}`, body: paid ? "Your membership is active." : "Pay at the front desk to activate your membership.", actionUrl: "/member/membership" });
    return ms;
  });
}

export async function changeMembershipStatus(userId: string, action: "pause" | "resume" | "cancel", reason?: (typeof s.cancellationReasonEnum.enumValues)[number]) {
  const current = await getMembership(userId);
  if (!current) throw new Error("You don't have an active membership.");
  const newStatus = action === "pause" ? "paused" : action === "resume" ? "active" : "cancelled";
  await db.update(s.userMemberships).set({
    status: newStatus, autoRenew: action !== "cancel", cancellationReason: action === "cancel" ? reason ?? "other" : null, updatedAt: new Date(),
  }).where(eq(s.userMemberships.id, current.id));
  await db.insert(s.membershipHistory).values({ membershipId: current.id, oldStatus: current.status, newStatus, changedBy: userId });
  return newStatus;
}

export async function listEquipment(opts: { muscle?: string; category?: string } = {}) {
  const rows = await db.query.gymEquipment.findMany({
    with: { category: true, media: true, guides: true, facility: { columns: { name: true } } },
    orderBy: asc(s.gymEquipment.name),
  });
  return rows
    .filter((e) => !opts.muscle || e.targetMuscleGroups?.some((m) => m.toLowerCase() === opts.muscle!.toLowerCase()))
    .filter((e) => !opts.category || e.category?.name === opts.category)
    .map((e) => ({
      id: e.id, name: e.name, manufacturer: e.manufacturer, category: e.category?.name ?? "", muscles: e.targetMuscleGroups ?? [],
      difficulty: e.model ?? "Beginner", condition: e.condition, club: e.facility?.name ?? "", image: e.media[0]?.url ?? "",
      steps: (e.guides[0]?.stepByStepInstructions as string[] | null) ?? [], safety: e.guides[0]?.safetyWarnings ?? "",
      lastMaintenanceDate: e.lastMaintenanceDate,
    }));
}

export async function getMemberActivity(userId: string) {
  const since = new Date(Date.now() - 30 * 86400000);
  const checkIns = await db.select({ t: s.facilityCheckIns.checkInTime, club: s.facilities.name })
    .from(s.facilityCheckIns).innerJoin(s.facilities, eq(s.facilities.id, s.facilityCheckIns.facilityId))
    .where(and(eq(s.facilityCheckIns.userId, userId), gte(s.facilityCheckIns.checkInTime, since)))
    .orderBy(desc(s.facilityCheckIns.checkInTime));
  return { visits30d: checkIns.length, recent: checkIns.slice(0, 5) };
}

export async function checkIn(userId: string, facilityId: string) {
  const m = await getMembership(userId);
  if (!m || m.status !== "active") throw new Error("An active membership is required to check in.");
  const [row] = await db.insert(s.facilityCheckIns).values({ userId, facilityId }).returning();
  return row;
}

export async function listClubs() {
  return db.select({ id: s.facilities.id, name: s.facilities.name, city: sql<string>`${s.facilities.address}->>'city'`, capacity: s.facilities.capacity })
    .from(s.facilities).orderBy(asc(s.facilities.name));
}

export async function listNotifications(userId: string, limit = 10) {
  return db.query.userNotifications.findMany({ where: eq(s.userNotifications.userId, userId), orderBy: desc(s.userNotifications.createdAt), limit });
}
