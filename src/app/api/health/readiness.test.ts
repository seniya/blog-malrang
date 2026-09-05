import assert from "node:assert/strict";
import { describe, it } from "node:test";
import Database from "better-sqlite3";

import { expectedMigrationCount, isDatabaseReady, REQUIRED_SCHEMA_TABLES } from "@/app/api/health/readiness";

function createDatabase(): Database.Database {
  const database = new Database(":memory:");
  for (const table of REQUIRED_SCHEMA_TABLES) {
    database.exec(`CREATE TABLE ${table} (id TEXT PRIMARY KEY)`);
  }
  database.exec("CREATE TABLE __drizzle_migrations (id INTEGER PRIMARY KEY, hash TEXT NOT NULL, created_at INTEGER NOT NULL)");
  for (let index = 0; index < expectedMigrationCount; index += 1) {
    database.prepare("INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)").run(`migration-${index}`, index);
  }
  return database;
}

describe("database readiness", () => {
  it("requires the complete current schema and migration ledger", () => {
    const database = createDatabase();
    assert.equal(isDatabaseReady(database), true);
    database.close();
  });

  it("rejects a database missing an application table", () => {
    const database = createDatabase();
    database.exec("DROP TABLE tags");
    assert.equal(isDatabaseReady(database), false);
    database.close();
  });

  it("rejects a database whose migration ledger is behind the bundle", () => {
    const database = createDatabase();
    database.exec("DELETE FROM __drizzle_migrations WHERE id = (SELECT MAX(id) FROM __drizzle_migrations)");
    assert.equal(isDatabaseReady(database), false);
    database.close();
  });
});
