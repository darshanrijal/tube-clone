import { getUserByClerkId } from "@/db/queries";
import { auth } from "@clerk/nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { ZodError } from "zod";

export const createTRPCContext = cache(async (opts: { headers: Headers }) => {
  const { userId: clerkId } = await auth();
  return {
    clerkId,
    ...opts,
  };
});

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const router = t.router;

export const publicProcedure = t.procedure;

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const { clerkId } = ctx;

  if (!clerkId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }

  const user = await getUserByClerkId(clerkId);
  return next({ ctx: { user } });
});

export const protectedProcedure = t.procedure.use(authMiddleware);
