import type Database from "better-sqlite3";

import migrationJournal from "@/db/migrations/meta/_journal.json";

export const REQUIRED_SCHEMA_TABLES = [
  "users",
  "posts",
  "categories",
  "tags",
  "post_categories",
  "post_tags",
] as const;

const EXPECTED_MIGRATION_COUNT = migrationJournal.entries.length;

type SqliteDatabase = Pick<Database.Database, "prepare">;

export function isDatabaseReady(sqlite: SqliteDatabase): boolean {
  sqlite.prepare("SELECT 1").get();

  const tables = sqlite
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (?, ?, ?, ?, ?, ?)",
    )
    .all(...REQUIRED_SCHEMA_TABLES) as Array<{ name: string }>;

  if (new Set(tables.map(({ name }) => name)).size !== REQUIRED_SCHEMA_TABLES.length) {
    return false;
  }

  const migrationTable = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = '__drizzle_migrations'")
    .get() as { name?: string } | undefined;

  if (!migrationTable?.name) {
    return false;
  }

  const migrationState = sqlite
    .prepare("SELECT COUNT(*) AS count FROM __drizzle_migrations")
    .get() as { count: number };

  return migrationState.count === EXPECTED_MIGRATION_COUNT;
}

export const expectedMigrationCount = EXPECTED_MIGRATION_COUNT;
