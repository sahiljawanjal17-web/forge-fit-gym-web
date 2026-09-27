import { createTRPCRouter, adminProcedure } from "../index";
import * as analytics from "@/server/services/analytics";
import { z } from "zod";

// Legacy tRPC surface: thin wrappers around the analytics service (the UI uses server components/actions).
export const analyticsRouter = createTRPCRouter({
  getDashboardKPIs: adminProcedure.query(() => analytics.getKpis()),

  getRevenueChart: adminProcedure
    .input(z.object({ months: z.number().int().min(1).max(24).default(6) }))
    .query(({ input }) => analytics.getRevenueByMonth(input.months)),

  getTierDistribution: adminProcedure.query(() => analytics.getTierDistribution()),

  getTopProducts: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(5) }))
    .query(({ input }) => analytics.getTopProducts(input.limit)),

  forecastRevenue: adminProcedure
    .input(z.object({ daysAhead: z.number().int().min(1).max(365).default(30) }))
    .query(({ input }) => analytics.forecastRevenue(input.daysAhead)),
});
