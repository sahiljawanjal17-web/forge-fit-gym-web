import { createTRPCRouter, publicProcedure } from "../index";

const stubRouter = createTRPCRouter({
  health: publicProcedure.query(() => "OK"),
});

export const chatRouter = stubRouter;
