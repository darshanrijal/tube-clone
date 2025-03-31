import "server-only";
import { tryCatch } from "@/lib/try-catch";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from ".";
import { userTable } from "./schema";

export const getUserByClerkId = cache(async (clerkId: string) => {
  const getUserPromise = db
    .select()
    .from(userTable)
    .where(eq(userTable.clerkId, clerkId));

  const { data, error } = await tryCatch(getUserPromise);
  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
  const user = data[0];
  if (!user) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }

  return user;
});
