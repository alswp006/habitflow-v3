import BetterSqlite3 from "better-sqlite3";
import { runMigrations as _runMigrations } from "./migrations";

const DEFAULT_DB_NAME = "habitflow.db";

/**
 * Open (or create) the SQLite database with the given name.
 * Defaults to "habitflow.db". Pass ":memory:" for in-memory use in tests.
 * No migrations or writes happen here — this function has no side effects
 * beyond opening the file.
 */
export function openDb(name: string = DEFAULT_DB_NAME): BetterSqlite3.Database {
  return new BetterSqlite3(name);
}

/**
 * Run all pending migrations against the given database instance.
 * Idempotent: already-applied migrations are skipped.
 */
export function runMigrations(db: BetterSqlite3.Database): void {
  _runMigrations(db);
}
