import type Database from "better-sqlite3";
import type { CompletionRecord } from "@/lib/types/entities";

interface CompletionRow {
  id: string;
  habitId: string;
  date: string;
  completed: number;
  completedAt: string | null;
}

function rowToRecord(row: CompletionRow): CompletionRecord {
  return {
    id: row.id,
    habitId: row.habitId,
    date: row.date,
    completed: row.completed !== 0,
    completedAt: row.completedAt,
  };
}

export function listCompletionsByDate(
  db: Database.Database,
  date: string
): CompletionRecord[] {
  try {
    const rows = db
      .prepare(
        `SELECT id, habitId, date, completed, completedAt
         FROM completion_records WHERE date = ?`
      )
      .all(date) as CompletionRow[];
    return rows.map(rowToRecord);
  } catch (err) {
    throw new Error("Failed to list completions by date: " + (err as Error).message);
  }
}

export function listAllCompletionsForHabit(
  db: Database.Database,
  habitId: string
): CompletionRecord[] {
  try {
    const rows = db
      .prepare(
        `SELECT id, habitId, date, completed, completedAt
         FROM completion_records
         WHERE habitId = ? AND completed = 1
         ORDER BY date DESC`
      )
      .all(habitId) as CompletionRow[];
    return rows.map(rowToRecord);
  } catch (err) {
    throw new Error("Failed to list completions for habit: " + (err as Error).message);
  }
}

export function setCompletion(
  db: Database.Database,
  habitId: string,
  date: string,
  completed: boolean
): CompletionRecord {
  const completedAt = completed ? new Date().toISOString() : null;
  const id = crypto.randomUUID();
  try {
    db.prepare(
      `INSERT INTO completion_records (id, habitId, date, completed, completedAt)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (habitId, date) DO UPDATE SET
         completed = excluded.completed,
         completedAt = excluded.completedAt`
    ).run(id, habitId, date, completed ? 1 : 0, completedAt);
    const row = db
      .prepare(
        `SELECT id, habitId, date, completed, completedAt
         FROM completion_records WHERE habitId = ? AND date = ?`
      )
      .get(habitId, date) as CompletionRow | undefined;
    if (!row) throw new Error("Failed to retrieve completion record after insert");
    return rowToRecord(row);
  } catch (err) {
    throw new Error("Failed to save completion: " + (err as Error).message);
  }
}
