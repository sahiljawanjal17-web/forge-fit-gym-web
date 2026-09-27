import { hashPassword } from "better-auth/crypto";
import type { DB } from "../index";
import * as s from "../schema";
import { CLUBS, EQUIPMENT, FIRST_NAMES, LAST_NAMES, PLANS, PRODUCTS } from "./data";

let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);
const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const DEMO_ACCOUNTS = {
  owner: { email: "owner@forgefit.com", password: "Owner@12345", name: "Alex Morgan" },
  member: { email: "member@forgefit.com", password: "Member@12345", name: "Jordan Lee" },
};

async function createUser(db: DB, email: string, name: string, password: string, role: "owner" | "customer", createdAt = new Date()) {
  const [u] = await db.insert(s.users).values({ email, name, role, emailVerified: true, createdAt }).returning();
  await db.insert(s.authAccounts).values({
    id: crypto.randomUUID(), accountId: u.id, providerId: "credential", userId: u.id, password: await hashPassword(password),
  });
  return u;
}

export async function seedDatabase(db: DB) {
  const clubs = await db.insert(s.facilities).values(
    CLUBS.map((c) => ({ name: c.name, capacity: c.capacity, description: `${c.city}, ${c.country}`, address: { city: c.city, country: c.country } })),
  ).returning();

  const plans = await db.insert(s.membershipPlans).values(
    PLANS.flatMap((p) => [
      { name: `${p.name} Monthly`, tier: p.tier, billingCycle: "monthly" as const, price: String(p.monthly), description: p.description },
      { name: `${p.name} Annual`, tier: p.tier, billingCycle: "annual" as const, price: String(Math.round(p.monthly * 10)), description: p.description },
    ]),
  ).returning();

  const categoryNames = [...new Set(PRODUCTS.map((p) => p.category))];
  const categories = await db.insert(s.productCategories).values(categoryNames.map((name) => ({ name }))).returning();
  const [supplier] = await db.insert(s.suppliers).values({ name: "Global Sports Nutrition Ltd", contactPerson: "Hannah Wells", email: "orders@gsn-supply.com", phone: "+44 20 7946 0000" }).returning();

  const variants: { id: string; price: number; productName: string }[] = [];
  for (const p of PRODUCTS) {
    const [prod] = await db.insert(s.products).values({
      name: p.name, slug: slug(p.name), brand: p.brand, description: p.description, basePrice: String(p.price),
      categoryId: categories.find((c) => c.name === p.category)!.id, attributes: { rating: +(4 + rand()).toFixed(1), reviews: Math.floor(20 + rand() * 400) },
    }).returning();
    await db.insert(s.productImages).values({ productId: prod.id, url: `/images/products/${p.image}.jpg`, altText: p.name });
    for (const v of p.variants) {
      const price = v.price ?? p.price;
      const [variant] = await db.insert(s.productVariants).values({
        productId: prod.id, sku: `FF-${slug(p.name).slice(0, 10).toUpperCase()}-${variants.length}`, name: v.name,
        priceOverride: v.price ? String(v.price) : null,
      }).returning();
      const [inv] = await db.insert(s.inventory).values({ variantId: variant.id, quantityAvailable: v.stock, reorderLevel: 8, reorderQuantity: 40, supplierId: supplier.id }).returning();
      if (v.stock < 8) await db.insert(s.lowStockAlerts).values({ inventoryId: inv.id });
      variants.push({ id: variant.id, price, productName: p.name });
    }
  }

  const eqCats = [...new Set(EQUIPMENT.map((e) => e.category))];
  const equipmentCategories = await db.insert(s.equipmentCategories).values(eqCats.map((name) => ({ name }))).returning();
  for (const e of EQUIPMENT) {
    const [eq] = await db.insert(s.gymEquipment).values({
      name: e.name, manufacturer: e.manufacturer, categoryId: equipmentCategories.find((c) => c.name === e.category)!.id,
      facilityId: pick(clubs).id, targetMuscleGroups: e.muscles, condition: rand() > 0.85 ? "needs_maintenance" : "excellent",
      model: e.difficulty, lastMaintenanceDate: daysAgo(Math.floor(rand() * 90)),
    }).returning();
    await db.insert(s.equipmentUsageGuides).values({ equipmentId: eq.id, title: `How to use: ${e.name}`, stepByStepInstructions: e.steps, safetyWarnings: e.safety });
    await db.insert(s.equipmentMedia).values({ equipmentId: eq.id, mediaType: "image", url: `/images/equipment/${e.image}.jpg`, description: e.name });
  }

  await createUser(db, DEMO_ACCOUNTS.owner.email, DEMO_ACCOUNTS.owner.name, DEMO_ACCOUNTS.owner.password, "owner", daysAgo(400));
  const demoMember = await createUser(db, DEMO_ACCOUNTS.member.email, DEMO_ACCOUNTS.member.name, DEMO_ACCOUNTS.member.password, "customer", daysAgo(200));

  const memberPasswordHash = await hashPassword("Member@12345");
  const members = [demoMember];
  for (let i = 0; i < 48; i++) {
    const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
    const [u] = await db.insert(s.users).values({
      email: `${slug(name)}.${i}@example.com`, name, role: "customer", emailVerified: true, createdAt: daysAgo(Math.floor(rand() * 330)),
    }).returning();
    await db.insert(s.authAccounts).values({ id: crypto.randomUUID(), accountId: u.id, providerId: "credential", userId: u.id, password: memberPasswordHash });
    members.push(u);
  }

  for (const m of members) {
    const plan = m.id === demoMember.id ? plans.find((p) => p.tier === "premium" && p.billingCycle === "monthly")! : pick(plans);
    const r = rand();
    const status = m.id === demoMember.id ? "active" : r < 0.72 ? "active" : r < 0.82 ? "paused" : r < 0.92 ? "expired" : "cancelled";
    const start = m.createdAt;
    const [ms] = await db.insert(s.userMemberships).values({
      userId: m.id, planId: plan.id, status, startDate: start,
      endDate: new Date(start.getTime() + (plan.billingCycle === "annual" ? 365 : 30) * 86400000), autoRenew: status === "active",
    }).returning();
    await db.insert(s.paymentTransactions).values({
      userId: m.id, membershipId: ms.id, amount: plan.price, status: "succeeded", gateway: pick(["stripe", "razorpay", "cash_pos"] as const), createdAt: start,
    });
    const visits = status === "active" ? Math.floor(rand() * 18) + (m.id === demoMember.id ? 12 : 0) : Math.floor(rand() * 2);
    for (let v = 0; v < visits; v++) {
      const t = daysAgo(rand() * 30);
      t.setHours(6 + Math.floor(rand() * 15));
      await db.insert(s.facilityCheckIns).values({ userId: m.id, facilityId: pick(clubs).id, checkInTime: t, checkOutTime: new Date(t.getTime() + 75 * 60000) });
    }
  }

  for (let i = 0; i < 140; i++) {
    const buyer = i < 4 ? demoMember : pick(members);
    const items = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => ({ v: pick(variants), qty: 1 + Math.floor(rand() * 2) }));
    const subtotal = items.reduce((a, it) => a + it.v.price * it.qty, 0);
    const shipping = subtotal > 100 ? 0 : 8;
    const tax = +(subtotal * 0.08).toFixed(2);
    const created = daysAgo(i < 4 ? i * 9 + 1 : Math.floor(rand() * 180));
    const age = (Date.now() - created.getTime()) / 86400000;
    const status = age > 10 ? (rand() > 0.06 ? "delivered" : "cancelled") : age > 4 ? "shipped" : pick(["pending", "processing"] as const);
    const address = { fullName: buyer.name, street: "221B Baker Street", city: "London", postalCode: "NW1 6XE", country: "UK" };
    const [order] = await db.insert(s.orders).values({
      userId: buyer.id, status, paymentStatus: status === "cancelled" ? "refunded" : "paid", subtotal: subtotal.toFixed(2), tax: tax.toFixed(2),
      shippingFee: shipping.toFixed(2), total: (subtotal + tax + shipping).toFixed(2), shippingAddress: address, billingAddress: address, createdAt: created, updatedAt: created,
    }).returning();
    await db.insert(s.orderItems).values(items.map((it) => ({ orderId: order.id, variantId: it.v.id, quantity: String(it.qty), priceAtPurchase: it.v.price.toFixed(2) })));
    await db.insert(s.paymentTransactions).values({ userId: buyer.id, orderId: order.id, amount: order.total, status: "succeeded", gateway: "stripe", createdAt: created });
  }
}
