import { db } from "@/db";
import { categories } from "@/db/schema";
import { publicProcedure, router } from "../trpc";

export const categoriesRouter = router({
  get: publicProcedure.query(async () => {
    const allCategories = await db.select().from(categories);
    return allCategories;
  }),
});
