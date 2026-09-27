import { createTRPCRouter, publicProcedure } from "../index";
import * as store from "@/server/services/store";
import { z } from "zod";

// Legacy tRPC surface: thin wrappers around the store service. Product CRUD is not implemented yet.
export const productsRouter = createTRPCRouter({
  listPublic: publicProcedure
    .input(z.object({ search: z.string().optional(), category: z.string().optional(), limit: z.number().int().min(1).max(100).default(100) }))
    .query(({ input }) => store.listProducts({ q: input.search, category: input.category, limit: input.limit })),

  listCategories: publicProcedure.query(() => store.listCategories()),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => store.getProduct(input.slug)),
});
