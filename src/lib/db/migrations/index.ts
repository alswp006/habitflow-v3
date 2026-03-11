import type Database from "better-sqlite3";
import { migrate001 } from "./001_init";

const MIGRATIONS: Array<{ name: string; run: (db: Database.Database) => void }> = [
  { name: "001_init", run: migrate001 },
];

export function runMigrations(db: Database.Database): void {
  // Bootstrap: ensure the migrations tracking table exists before querying it
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL UNIQUE,
      appliedAt TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  for (const migration of MIGRATIONS) {
    const applied = db
      .prepare("SELECT 1 FROM migrations WHERE name = ?")
      .get(migration.name);

    if (!applied) {
      migration.run(db);
      db.prepare("INSERT INTO migrations (name) VALUES (?)").run(migration.name);
    }
  }
}
