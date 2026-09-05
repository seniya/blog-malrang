import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { env } from "@/lib/env";
import * as schema from "@/db/schema";

export type Db = ReturnType<typeof createDb>;

function databasePath(url: string): string {
  if (url === ":memory:" || url.startsWith("file:")) return url;
  const path = resolve(url);
  mkdirSync(dirname(path), { recursive: true });
  return url;
}

export function createDb(url = env.DATABASE_URL) {
  const sqlite = new Database(databasePath(url));
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

const globalForDb = globalThis as typeof globalThis & {
  blogDb?: Db;
};

export const db = globalForDb.blogDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.blogDb = db;
}
