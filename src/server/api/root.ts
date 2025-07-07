import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { authRouter } from "~/server/api/routers/auth";
import { dogsRouter } from "~/server/api/routers/dogs";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  auth: authRouter,
  dogs: dogsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
