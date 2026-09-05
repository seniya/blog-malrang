import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { createDb } from "@/db/client";

const database = createDb();
migrate(database, { migrationsFolder: "src/db/migrations" });
console.log(`Applied migrations to ${process.env.DATABASE_URL ?? "./data/blog.db"}`);
