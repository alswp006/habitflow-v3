import * as SQLite from "expo-sqlite";
import { runMigrations as _runMigrations } from "./migrations";

const DEFAULT_DB_NAME = "habitflow.db";

/**
 * Open (or create) the SQLite database with the given name.
 * Defaults to "habitflow.db". Pass ":memory:" for in-memory use in tests.
 * No migrations or writes happen here — this function has no side effects
 * beyond opening the file.
 */
export async function openDb(
  name: string = DEFAULT_DB_NAME
): Promise<SQLite.SQLiteDatabase> {
  return SQLite.openDatabaseAsync(name);
}

/**
 * Run all pending migrations against the given database instance.
 * Idempotent: already-applied migrations are skipped.
 */
export async function runMigrations(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  await _runMigrations(db);
}
