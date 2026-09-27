import { createTRPCRouter, adminProcedure } from "../index";
import * as analytics from "@/server/services/analytics";
import { users } from "@/server/db/schema";
import { userStatusEnum } from "@/server/db/schema/enums";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Legacy tRPC surface: thin wrappers around the analytics service (members + churn score).
export const membersRouter = createTRPCRouter({
  list: adminProcedure
    .input(z.object({ search: z.string().optional(), limit: z.number().int().min(1).max(500).default(200) }))
    .query(({ input }) => analytics.listMembers({ q: input.search, limit: input.limit })),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => ctx.db.query.users.findFirst({ where: eq(users.id, input.id) })),

  updateStatus: adminProcedure
    .input(z.object({ id: z.string(), status: z.enum(userStatusEnum.enumValues) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(users).set({ status: input.status, updatedAt: new Date() }).where(eq(users.id, input.id));
      return { success: true };
    }),
});
