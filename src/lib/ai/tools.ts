import { tool } from "ai";
import { z } from "zod";
import * as store from "@/server/services/store";
import * as gym from "@/server/services/gym";
import * as analytics from "@/server/services/analytics";
import { orderStatusEnum } from "@/server/db/schema";

const safe = <T,>(fn: () => Promise<T>) => fn().catch((e: unknown) => ({ error: e instanceof Error ? e.message : "Action failed" }));

function sharedTools() {
  return {
    searchProducts: tool({
      description: "Search the Forge Fit store catalogue (supplements, apparel, accessories, equipment). Returns product slugs, starting price in USD and stock.",
      inputSchema: z.object({ query: z.string().optional().describe("Free-text search, e.g. 'creatine' or 'vegan protein'"), category: z.string().optional().describe("Protein, Performance, Accessories, Equipment or Apparel") }),
      execute: ({ query, category }) => safe(async () => (await store.listProducts({ q: query, category, limit: 12 })).map((p) => ({ slug: p.slug, name: p.name, brand: p.brand, category: p.category, fromPrice: p.price, inStock: p.stock }))),
    }),
    getProductDetails: tool({
      description: "Get a product's description and its purchasable variants (variantId, flavour/size, price, stock).",
      inputSchema: z.object({ slug: z.string() }),
      execute: ({ slug }) => safe(async () => {
        const p = await store.getProduct(slug);
        if (!p) throw new Error("Product not found");
        return { name: p.name, brand: p.brand, description: p.description, url: `/shop/${p.slug}`, variants: p.variants };
      }),
    }),
    getMembershipPlans: tool({
      description: "List membership plans with planId, tier, billing cycle, USD price and features.",
      inputSchema: z.object({}),
      execute: () => safe(async () => (await gym.listPlans()).map((p) => ({ planId: p.id, name: p.name, tier: p.tier, cycle: p.billingCycle, price: p.price, features: p.features }))),
    }),
    findEquipmentGuide: tool({
      description: "Find gym equipment and how-to-use guides, optionally filtered by target muscle group (Chest, Back, Legs, Arms, Shoulders, Core, Full Body).",
      inputSchema: z.object({ muscle: z.string().optional() }),
      execute: ({ muscle }) => safe(async () => (await gym.listEquipment({ muscle })).map((e) => ({ id: e.id, name: e.name, muscles: e.muscles, difficulty: e.difficulty, steps: e.steps, safety: e.safety, url: `/equipment-guide/${e.id}` }))),
    }),
    listClubs: tool({
      description: "List Forge Fit clubs worldwide.",
      inputSchema: z.object({}),
      execute: () => safe(() => gym.listClubs()),
    }),
  };
}

export function customerTools(userId: string) {
  return {
    ...sharedTools(),
    viewCart: tool({
      description: "Show the customer's cart with totals (member discount, shipping, tax).",
      inputSchema: z.object({}),
      execute: () => safe(() => store.getCart(userId)),
    }),
    addToCart: tool({
      description: "Add a product variant to the customer's cart. Get variantId from getProductDetails first.",
      inputSchema: z.object({ variantId: z.string(), quantity: z.number().int().min(1).max(10).default(1) }),
      execute: ({ variantId, quantity }) => safe(async () => {
        const cart = await store.addToCart(userId, variantId, quantity);
        return { added: true, cartItems: cart.count, cartTotal: cart.total };
      }),
    }),
    updateCartItem: tool({
      description: "Change quantity of a cart line (use the cart item id from viewCart). Quantity 0 removes it.",
      inputSchema: z.object({ itemId: z.string(), quantity: z.number().int().min(0).max(10) }),
      execute: ({ itemId, quantity }) => safe(() => store.setCartQuantity(userId, itemId, quantity)),
    }),
    placeOrder: tool({
      description: "Place an order for everything in the cart. ONLY call after the customer has explicitly confirmed the cart total, shipping address and payment method.",
      inputSchema: z.object({
        fullName: z.string(), street: z.string(), city: z.string(), postalCode: z.string(), country: z.string(),
        paymentMethod: z.enum(["card", "upi", "pay_at_club"]),
      }),
      execute: ({ paymentMethod, ...address }) => safe(async () => {
        const order = await store.placeOrder(userId, address, paymentMethod);
        return { orderId: order.id, orderNumber: order.id.slice(0, 8).toUpperCase(), total: Number(order.total), status: order.status, url: `/member/orders/${order.id}` };
      }),
    }),
    listMyOrders: tool({
      description: "List the customer's recent orders with status and items.",
      inputSchema: z.object({}),
      execute: () => safe(async () => (await store.listOrders({ userId, limit: 10 })).map((o) => ({ orderId: o.id, number: o.number, status: o.status, total: o.total, date: o.createdAt, items: o.items }))),
    }),
    cancelMyOrder: tool({
      description: "Cancel one of the customer's orders that is still pending or processing. Confirm with the customer first.",
      inputSchema: z.object({ orderId: z.string() }),
      execute: ({ orderId }) => safe(async () => { await store.cancelOwnOrder(userId, orderId); return { cancelled: true }; }),
    }),
    getMyMembership: tool({
      description: "Get the customer's current membership, status, renewal date and visits in the last 30 days.",
      inputSchema: z.object({}),
      execute: () => safe(async () => {
        const [m, activity] = await Promise.all([gym.getMembership(userId), gym.getMemberActivity(userId)]);
        return { membership: m && { plan: m.plan.name, tier: m.plan.tier, status: m.status, renews: m.endDate, autoRenew: m.autoRenew }, visitsLast30Days: activity.visits30d };
      }),
    }),
    subscribeToPlan: tool({
      description: "Subscribe or switch the customer to a membership plan. Confirm plan and price with the customer first.",
      inputSchema: z.object({ planId: z.string(), paymentMethod: z.enum(["card", "upi", "pay_at_club"]) }),
      execute: ({ planId, paymentMethod }) => safe(async () => { const m = await gym.subscribe(userId, planId, paymentMethod); return { status: m.status, endDate: m.endDate }; }),
    }),
    changeMembership: tool({
      description: "Pause, resume or cancel the customer's membership. Confirm first.",
      inputSchema: z.object({ action: z.enum(["pause", "resume", "cancel"]) }),
      execute: ({ action }) => safe(async () => ({ newStatus: await gym.changeMembershipStatus(userId, action) })),
    }),
  };
}

export function ownerTools(ownerId: string) {
  return {
    ...sharedTools(),
    getBusinessKpis: tool({
      description: "Revenue (30d, total), MRR/ARR, active members, churn rate, orders and low-stock count.",
      inputSchema: z.object({}),
      execute: () => safe(() => analytics.getKpis()),
    }),
    getRevenueTrend: tool({
      description: "Monthly revenue split into store sales and memberships.",
      inputSchema: z.object({ months: z.number().int().min(2).max(12).default(6) }),
      execute: ({ months }) => safe(() => analytics.getRevenueByMonth(months)),
    }),
    forecastRevenue: tool({
      description: "Forecast revenue for the next N days with a low/high band.",
      inputSchema: z.object({ daysAhead: z.number().int().min(7).max(90).default(30) }),
      execute: ({ daysAhead }) => safe(() => analytics.forecastRevenue(daysAhead)),
    }),
    getInventoryStatus: tool({
      description: "Stock levels with sales velocity, days of stock left, 30-day demand forecast and recommended reorder quantity.",
      inputSchema: z.object({ lowOnly: z.boolean().default(false), query: z.string().optional() }),
      execute: ({ lowOnly, query }) => safe(() => analytics.getInventory({ lowOnly, q: query })),
    }),
    restockItem: tool({
      description: "Add (positive) or remove (negative) units for an inventory item by inventoryId. Confirm with the owner first.",
      inputSchema: z.object({ inventoryId: z.string(), change: z.number().int() }),
      execute: ({ inventoryId, change }) => safe(async () => { const inv = await analytics.adjustStock(inventoryId, change, ownerId, "Adjusted by AI assistant"); return { newStock: inv.quantityAvailable }; }),
    }),
    listOrders: tool({
      description: "List store orders, optionally by status.",
      inputSchema: z.object({ status: z.enum(orderStatusEnum.enumValues).optional(), limit: z.number().int().max(50).default(15) }),
      execute: ({ status, limit }) => safe(async () => (await store.listOrders({ status, limit })).map((o) => ({ orderId: o.id, number: o.number, customer: o.customer, status: o.status, payment: o.paymentStatus, total: o.total, date: o.createdAt, items: o.items.length }))),
    }),
    updateOrderStatus: tool({
      description: "Move an order to a new status (processing, shipped, delivered, cancelled, returned). Confirm first.",
      inputSchema: z.object({ orderId: z.string(), status: z.enum(orderStatusEnum.enumValues) }),
      execute: ({ orderId, status }) => safe(async () => { const o = await store.updateOrderStatus(orderId, status); return { orderId: o.id, status: o.status }; }),
    }),
    findMembers: tool({
      description: "Search members by name/email. Includes plan, visits in 30 days, lifetime spend and churn-risk score with reasons.",
      inputSchema: z.object({ query: z.string().optional(), highChurnRiskOnly: z.boolean().default(false) }),
      execute: ({ query, highChurnRiskOnly }) => safe(async () => {
        const rows = await analytics.listMembers({ q: query });
        return rows.filter((m) => !highChurnRiskOnly || m.churn.level === "high").slice(0, 25)
          .map((m) => ({ id: m.id, name: m.name, email: m.email, plan: m.plan, status: m.membershipStatus, visits30d: m.visits30, spend: m.spend, churn: m.churn }));
      }),
    }),
    getTopProducts: tool({
      description: "Best-selling products by revenue.",
      inputSchema: z.object({ limit: z.number().int().max(15).default(5) }),
      execute: ({ limit }) => safe(() => analytics.getTopProducts(limit)),
    }),
  };
}
