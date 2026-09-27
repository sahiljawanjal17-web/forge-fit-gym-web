import { createTRPCRouter, publicProcedure, protectedProcedure } from "../index";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure.query(({ ctx }) => {
    return {
      session: ctx.session,
      user: ctx.user,
    };
  }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const userProfile = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
    });
    return userProfile;
  }),
});
