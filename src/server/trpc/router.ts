import { createTRPCRouter } from "./index";
import { authRouter } from "./routers/auth";
import { membersRouter } from "./routers/members";
import { membershipsRouter } from "./routers/memberships";
import { productsRouter } from "./routers/products";
import { ordersRouter } from "./routers/orders";
import { inventoryRouter } from "./routers/inventory";
import { equipmentRouter } from "./routers/equipment";
import { paymentsRouter } from "./routers/payments";
import { chatRouter } from "./routers/chat";
import { analyticsRouter } from "./routers/analytics";
import { notificationsRouter } from "./routers/notifications";
import { aiRouter } from "./routers/ai";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  members: membersRouter,
  memberships: membershipsRouter,
  products: productsRouter,
  orders: ordersRouter,
  inventory: inventoryRouter,
  equipment: equipmentRouter,
  payments: paymentsRouter,
  chat: chatRouter,
  analytics: analyticsRouter,
  notifications: notificationsRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
