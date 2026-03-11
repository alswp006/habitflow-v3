import type Database from "better-sqlite3";

export function migrate001(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id    TEXT PRIMARY KEY,
      name  TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS habits (
      id            TEXT    PRIMARY KEY,
      name          TEXT    NOT NULL,
      icon          TEXT    NOT NULL,
      categoryId    TEXT    REFERENCES categories(id) ON DELETE SET NULL,
      frequencyType TEXT    NOT NULL CHECK (frequencyType IN ('daily', 'weekly')),
      weeklyTarget  INTEGER,
      isArchived    INTEGER NOT NULL DEFAULT 0,
      createdAt     TEXT    NOT NULL,
      sortOrder     INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS completion_records (
      id          TEXT    PRIMARY KEY,
      habitId     TEXT    NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date        TEXT    NOT NULL,
      completed   INTEGER NOT NULL DEFAULT 0,
      completedAt TEXT,
      UNIQUE (habitId, date)
    );
  `);
}
