import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";
import * as schema from "./schema";

declare global {
  var __DB_CONNECTION: postgres.Sql | undefined;
}

const connection = globalThis.__DB_CONNECTION ?? postgres(env.DATABASE_URL);
if (process.env.NODE_ENV !== "production") {
  globalThis.__DB_CONNECTION = connection;
}

export const db = drizzle(connection, { schema });
