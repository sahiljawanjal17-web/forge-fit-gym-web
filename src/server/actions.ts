"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff, requireUser } from "@/lib/auth";
import * as store from "@/server/services/store";
import * as gym from "@/server/services/gym";
import * as analytics from "@/server/services/analytics";
import * as chat from "@/server/services/chat";
import { db } from "@/server/db";
import * as s from "@/server/db/schema";

type Result = { ok: true; message?: string } | { ok: false; message: string };
const fail = (e: unknown): Result => ({ ok: false, message: e instanceof Error ? e.message : "Something went wrong." });

export async function addToCartAction(variantId: string, quantity = 1): Promise<Result> {
  const user = await requireUser();
  try {
    await store.addToCart(user.id, variantId, quantity);
    revalidatePath("/", "layout");
    return { ok: true, message: "Added to cart" };
  } catch (e) { return fail(e); }
}

export async function setCartQuantityAction(itemId: string, quantity: number): Promise<Result> {
  const user = await requireUser();
  try {
    await store.setCartQuantity(user.id, itemId, quantity);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) { return fail(e); }
}

const addressSchema = z.object({
  fullName: z.string().min(2), street: z.string().min(3), city: z.string().min(2), postalCode: z.string().min(2), country: z.string().min(2), phone: z.string().optional(),
  paymentMethod: z.enum(["card", "upi", "pay_at_club"]),
});

export async function placeOrderAction(_: Result | null, form: FormData): Promise<Result> {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "Please complete all address fields." };
  let orderId: string;
  try {
    const { paymentMethod, ...address } = parsed.data;
    orderId = (await store.placeOrder(user.id, address, paymentMethod)).id;
  } catch (e) { return fail(e); }
  revalidatePath("/", "layout");
  redirect(`/member/orders/${orderId}?placed=1`);
}

export async function cancelOrderAction(orderId: string): Promise<Result> {
  const user = await requireUser();
  try {
    await store.cancelOwnOrder(user.id, orderId);
    revalidatePath("/member/orders");
    return { ok: true, message: "Order cancelled" };
  } catch (e) { return fail(e); }
}

export async function subscribeAction(planId: string, paymentMethod: "card" | "upi" | "pay_at_club"): Promise<Result> {
  const user = await requireUser();
  try {
    await gym.subscribe(user.id, planId, paymentMethod);
    revalidatePath("/member", "layout");
    return { ok: true, message: "Membership updated" };
  } catch (e) { return fail(e); }
}

export async function membershipStatusAction(action: "pause" | "resume" | "cancel"): Promise<Result> {
  const user = await requireUser();
  try {
    const status = await gym.changeMembershipStatus(user.id, action);
    revalidatePath("/member", "layout");
    return { ok: true, message: `Membership ${status}` };
  } catch (e) { return fail(e); }
}

export async function checkInAction(facilityId: string): Promise<Result> {
  const user = await requireUser();
  try {
    await gym.checkIn(user.id, facilityId);
    revalidatePath("/member/dashboard");
    return { ok: true, message: "Checked in — have a great session!" };
  } catch (e) { return fail(e); }
}

export async function updateProfileAction(_: Result | null, form: FormData): Promise<Result> {
  const user = await requireUser();
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 2) return { ok: false, message: "Name is too short." };
  const { eq } = await import("drizzle-orm");
  await db.update(s.users).set({ name, updatedAt: new Date() }).where(eq(s.users.id, user.id));
  revalidatePath("/member", "layout");
  return { ok: true, message: "Profile saved" };
}

export async function sendSupportMessageAction(content: string, conversationId?: string): Promise<Result> {
  const user = await requireUser();
  try {
    const staff = user.role === "owner" || user.role === "admin";
    if (staff && !conversationId) throw new Error("Pick a conversation first.");
    const convId = staff ? conversationId! : await chat.getSupportConversation(user.id);
    await chat.sendMessage(convId, user.id, content);
    revalidatePath(staff ? "/admin/chat" : "/member/chat");
    return { ok: true };
  } catch (e) { return fail(e); }
}

export async function contactAction(_: Result | null, form: FormData): Promise<Result> {
  const data = z.object({ name: z.string().min(2), email: z.string().email(), message: z.string().min(10) }).safeParse(Object.fromEntries(form));
  if (!data.success) return { ok: false, message: "Please enter your name, a valid email and a message (10+ characters)." };
  const owners = await db.query.users.findMany({ where: (u, { inArray }) => inArray(u.role, ["owner", "admin"]) });
  if (owners.length) {
    await db.insert(s.userNotifications).values(owners.map((o) => ({
      userId: o.id, type: "system_alert" as const, channel: "in_app" as const, title: `Enquiry from ${data.data.name}`, body: `${data.data.email}: ${data.data.message}`.slice(0, 1000),
    })));
  }
  return { ok: true, message: "Thanks! Our team will get back to you within 24 hours." };
}

export async function updateOrderStatusAction(orderId: string, status: (typeof s.orderStatusEnum.enumValues)[number]): Promise<Result> {
  await requireStaff();
  try {
    await store.updateOrderStatus(orderId, status);
    revalidatePath("/admin", "layout");
    return { ok: true, message: `Order marked ${status}` };
  } catch (e) { return fail(e); }
}

export async function adjustStockAction(inventoryId: string, change: number): Promise<Result> {
  const user = await requireStaff();
  try {
    if (!Number.isInteger(change) || change === 0) throw new Error("Enter a whole number.");
    await analytics.adjustStock(inventoryId, change, user.id, change > 0 ? "Restock" : "Manual adjustment");
    revalidatePath("/admin", "layout");
    return { ok: true, message: "Stock updated" };
  } catch (e) { return fail(e); }
}
