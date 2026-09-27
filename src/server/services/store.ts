import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/server/db";
import * as s from "@/server/db/schema";

export const TAX_RATE = 0.08;
export const FREE_SHIPPING_OVER = 100;
export const SHIPPING_FEE = 8;
const TIER_DISCOUNT: Record<string, number> = { premium: 0.1, vip: 0.2 };

export type Address = { fullName: string; street: string; city: string; postalCode: string; country: string; phone?: string };

const variantPrice = sql<number>`coalesce(${s.productVariants.priceOverride}, ${s.products.basePrice})::float`;

export async function listProducts(opts: { q?: string; category?: string; limit?: number } = {}) {
  const where = [eq(s.products.isActive, true)];
  if (opts.q) where.push(or(ilike(s.products.name, `%${opts.q}%`), ilike(s.products.description, `%${opts.q}%`), ilike(s.products.brand, `%${opts.q}%`))!);
  if (opts.category) where.push(eq(s.productCategories.name, opts.category));
  return db
    .select({
      id: s.products.id, slug: s.products.slug, name: s.products.name, brand: s.products.brand, description: s.products.description,
      category: s.productCategories.name, attributes: s.products.attributes,
      price: sql<number>`min(${variantPrice})`, stock: sql<number>`coalesce(sum(${s.inventory.quantityAvailable}), 0)::int`,
      image: sql<string>`(select url from product_images pi where pi.product_id = ${s.products.id} order by display_order limit 1)`,
    })
    .from(s.products)
    .leftJoin(s.productCategories, eq(s.products.categoryId, s.productCategories.id))
    .leftJoin(s.productVariants, eq(s.productVariants.productId, s.products.id))
    .leftJoin(s.inventory, eq(s.inventory.variantId, s.productVariants.id))
    .where(and(...where))
    .groupBy(s.products.id, s.productCategories.name)
    .orderBy(asc(s.products.createdAt))
    .limit(opts.limit ?? 100);
}

export async function listCategories() {
  return db.select({ name: s.productCategories.name }).from(s.productCategories).orderBy(asc(s.productCategories.name));
}

export async function getProduct(slugOrId: string) {
  const isUuid = /^[0-9a-f-]{36}$/i.test(slugOrId);
  const product = await db.query.products.findFirst({
    where: isUuid ? eq(s.products.id, slugOrId) : eq(s.products.slug, slugOrId),
    with: { images: true, category: true },
  });
  if (!product) return null;
  const variants = await db
    .select({ id: s.productVariants.id, name: s.productVariants.name, sku: s.productVariants.sku, price: variantPrice, stock: sql<number>`coalesce(${s.inventory.quantityAvailable}, 0)` })
    .from(s.productVariants)
    .innerJoin(s.products, eq(s.products.id, s.productVariants.productId))
    .leftJoin(s.inventory, eq(s.inventory.variantId, s.productVariants.id))
    .where(eq(s.productVariants.productId, product.id))
    .orderBy(asc(s.productVariants.createdAt));
  return { ...product, variants };
}

export async function getMemberDiscount(userId: string) {
  const [row] = await db
    .select({ tier: s.membershipPlans.tier })
    .from(s.userMemberships)
    .innerJoin(s.membershipPlans, eq(s.membershipPlans.id, s.userMemberships.planId))
    .where(and(eq(s.userMemberships.userId, userId), eq(s.userMemberships.status, "active")))
    .limit(1);
  return { tier: row?.tier ?? null, rate: row ? TIER_DISCOUNT[row.tier] ?? 0 : 0 };
}

async function cartIdFor(userId: string) {
  const existing = await db.query.shoppingCarts.findFirst({ where: eq(s.shoppingCarts.userId, userId) });
  if (existing) return existing.id;
  const [cart] = await db.insert(s.shoppingCarts).values({ userId }).returning();
  return cart.id;
}

export async function getCart(userId: string) {
  const cartId = await cartIdFor(userId);
  const items = await db
    .select({
      id: s.cartItems.id, quantity: s.cartItems.quantity, variantId: s.productVariants.id, variantName: s.productVariants.name,
      productName: s.products.name, slug: s.products.slug, price: variantPrice, stock: sql<number>`coalesce(${s.inventory.quantityAvailable}, 0)`,
      image: sql<string>`(select url from product_images pi where pi.product_id = ${s.products.id} order by display_order limit 1)`,
    })
    .from(s.cartItems)
    .innerJoin(s.productVariants, eq(s.productVariants.id, s.cartItems.variantId))
    .innerJoin(s.products, eq(s.products.id, s.productVariants.productId))
    .leftJoin(s.inventory, eq(s.inventory.variantId, s.productVariants.id))
    .where(eq(s.cartItems.cartId, cartId))
    .orderBy(asc(s.cartItems.createdAt));
  const discount = await getMemberDiscount(userId);
  const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
  const discountAmount = +(subtotal * discount.rate).toFixed(2);
  const afterDiscount = subtotal - discountAmount;
  const shipping = items.length === 0 || afterDiscount >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const tax = +(afterDiscount * TAX_RATE).toFixed(2);
  return {
    cartId, items, subtotal, discountRate: discount.rate, discountAmount, shipping, tax,
    total: +(afterDiscount + shipping + tax).toFixed(2), count: items.reduce((a, i) => a + i.quantity, 0),
  };
}

export async function addToCart(userId: string, variantId: string, quantity = 1) {
  const cartId = await cartIdFor(userId);
  const inv = await db.query.inventory.findFirst({ where: eq(s.inventory.variantId, variantId) });
  if (!inv) throw new Error("That product option doesn't exist.");
  const existing = await db.query.cartItems.findFirst({ where: and(eq(s.cartItems.cartId, cartId), eq(s.cartItems.variantId, variantId)) });
  const nextQty = (existing?.quantity ?? 0) + quantity;
  if (nextQty > inv.quantityAvailable) throw new Error(`Only ${inv.quantityAvailable} left in stock.`);
  if (existing) await db.update(s.cartItems).set({ quantity: nextQty, updatedAt: new Date() }).where(eq(s.cartItems.id, existing.id));
  else await db.insert(s.cartItems).values({ cartId, variantId, quantity });
  return getCart(userId);
}

export async function setCartQuantity(userId: string, itemId: string, quantity: number) {
  const cartId = await cartIdFor(userId);
  const where = and(eq(s.cartItems.id, itemId), eq(s.cartItems.cartId, cartId));
  if (quantity <= 0) await db.delete(s.cartItems).where(where);
  else await db.update(s.cartItems).set({ quantity, updatedAt: new Date() }).where(where);
  return getCart(userId);
}

export async function placeOrder(userId: string, address: Address, paymentMethod: "card" | "upi" | "pay_at_club") {
  const cart = await getCart(userId);
  if (cart.items.length === 0) throw new Error("Your cart is empty.");
  for (const i of cart.items) if (i.quantity > i.stock) throw new Error(`${i.productName} (${i.variantName}) only has ${i.stock} left.`);

  return db.transaction(async (tx) => {
    const paid = paymentMethod !== "pay_at_club";
    const [order] = await tx.insert(s.orders).values({
      userId, status: "processing", paymentStatus: paid ? "paid" : "unpaid",
      subtotal: (cart.subtotal - cart.discountAmount).toFixed(2), tax: cart.tax.toFixed(2), shippingFee: cart.shipping.toFixed(2), total: cart.total.toFixed(2),
      shippingAddress: address, billingAddress: address,
    }).returning();
    await tx.insert(s.orderItems).values(cart.items.map((i) => ({ orderId: order.id, variantId: i.variantId, quantity: String(i.quantity), priceAtPurchase: i.price.toFixed(2) })));
    for (const i of cart.items) {
      const [inv] = await tx.update(s.inventory)
        .set({ quantityAvailable: sql`${s.inventory.quantityAvailable} - ${i.quantity}`, updatedAt: new Date() })
        .where(eq(s.inventory.variantId, i.variantId)).returning();
      await tx.insert(s.stockHistory).values({ inventoryId: inv.id, transactionType: "customer_sale", quantityChange: -i.quantity, performedBy: userId, notes: `Order ${order.id.slice(0, 8)}` });
      if (inv.quantityAvailable < inv.reorderLevel) await tx.insert(s.lowStockAlerts).values({ inventoryId: inv.id });
    }
    await tx.insert(s.paymentTransactions).values({
      userId, orderId: order.id, amount: order.total, status: paid ? "succeeded" : "pending",
      gateway: paymentMethod === "upi" ? "razorpay" : paymentMethod === "card" ? "stripe" : "cash_pos", metadata: { method: paymentMethod, mode: "demo" },
    });
    await tx.delete(s.cartItems).where(eq(s.cartItems.cartId, cart.cartId));
    await tx.insert(s.userNotifications).values({ userId, type: "order_update", channel: "in_app", title: "Order confirmed", body: `Order #${order.id.slice(0, 8).toUpperCase()} is being prepared.`, actionUrl: `/member/orders/${order.id}` });
    return order;
  });
}

const orderWith = {
  user: { columns: { name: true, email: true } },
  items: { with: { variant: { with: { product: { columns: { name: true, slug: true } } } } } },
} as const;

async function queryOrders(where: ReturnType<typeof and>, limit: number) {
  const rows = await db.query.orders.findMany({ where, orderBy: desc(s.orders.createdAt), limit, with: orderWith });
  return rows.map((o) => ({
    id: o.id, number: o.id.slice(0, 8).toUpperCase(), status: o.status, paymentStatus: o.paymentStatus, total: Number(o.total), createdAt: o.createdAt,
    subtotal: Number(o.subtotal), tax: Number(o.tax), shipping: Number(o.shippingFee), address: o.shippingAddress as Address,
    customer: o.user?.name ?? "Guest", email: o.user?.email ?? "", userId: o.userId,
    items: o.items.map((i) => ({ name: i.variant.product.name, slug: i.variant.product.slug, variant: i.variant.name, quantity: Number(i.quantity), price: Number(i.priceAtPurchase) })),
  }));
}

export async function listOrders(opts: { userId?: string; status?: (typeof s.orderStatusEnum.enumValues)[number]; limit?: number } = {}) {
  return queryOrders(and(opts.userId ? eq(s.orders.userId, opts.userId) : undefined, opts.status ? eq(s.orders.status, opts.status) : undefined), opts.limit ?? 50);
}

export async function getOrder(orderId: string, userId?: string) {
  const [order] = await queryOrders(and(eq(s.orders.id, orderId), userId ? eq(s.orders.userId, userId) : undefined), 1);
  return order ?? null;
}

export async function updateOrderStatus(orderId: string, status: (typeof s.orderStatusEnum.enumValues)[number]) {
  const [order] = await db.update(s.orders).set({ status, updatedAt: new Date() }).where(eq(s.orders.id, orderId)).returning();
  if (!order) throw new Error("Order not found.");
  if (order.userId) {
    await db.insert(s.userNotifications).values({ userId: order.userId, type: "order_update", channel: "in_app", title: `Order ${status}`, body: `Order #${order.id.slice(0, 8).toUpperCase()} is now ${status}.`, actionUrl: `/member/orders/${order.id}` });
  }
  return order;
}

export async function cancelOwnOrder(userId: string, orderId: string) {
  const order = await db.query.orders.findFirst({ where: and(eq(s.orders.id, orderId), eq(s.orders.userId, userId)), with: { items: true } });
  if (!order) throw new Error("Order not found.");
  if (!["pending", "processing"].includes(order.status)) throw new Error(`Orders that are already ${order.status} can't be cancelled.`);
  await db.transaction(async (tx) => {
    await tx.update(s.orders).set({ status: "cancelled", paymentStatus: order.paymentStatus === "paid" ? "refunded" : order.paymentStatus, updatedAt: new Date() }).where(eq(s.orders.id, orderId));
    for (const i of order.items) {
      const [inv] = await tx.update(s.inventory).set({ quantityAvailable: sql`${s.inventory.quantityAvailable} + ${Number(i.quantity)}` }).where(eq(s.inventory.variantId, i.variantId)).returning();
      await tx.insert(s.stockHistory).values({ inventoryId: inv.id, transactionType: "sale_return", quantityChange: Number(i.quantity), performedBy: userId, notes: `Cancelled order ${orderId.slice(0, 8)}` });
    }
  });
}
