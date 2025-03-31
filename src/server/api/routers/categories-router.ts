import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { publicProcedure, router } from "../trpc";

export const categoriesRouter = router({
  get: publicProcedure.query(async () => {
    const allCategories = await db.select().from(categoryTable);
    return allCategories;
  }),
});
