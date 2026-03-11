import type Database from "better-sqlite3";
import type { Habit } from "@/lib/types/entities";

interface HabitRow {
  id: string;
  name: string;
  icon: string;
  categoryId: string | null;
  frequencyType: string;
  weeklyTarget: number | null;
  isArchived: number;
  createdAt: string;
  sortOrder: number;
}

function rowToHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    categoryId: row.categoryId,
    frequencyType: row.frequencyType as Habit["frequencyType"],
    weeklyTarget: row.weeklyTarget,
    isArchived: row.isArchived !== 0,
    createdAt: row.createdAt,
    sortOrder: row.sortOrder,
  };
}

export function listActiveHabits(
  db: Database.Database
): Habit[] {
  const rows = db
    .prepare(
      `SELECT id, name, icon, categoryId, frequencyType, weeklyTarget,
              isArchived, createdAt, sortOrder
       FROM habits
       WHERE isArchived = 0
       ORDER BY sortOrder ASC, createdAt ASC`
    )
    .all() as HabitRow[];
  return rows.map(rowToHabit);
}

export function listAllHabits(
  db: Database.Database
): Habit[] {
  const rows = db
    .prepare(
      `SELECT id, name, icon, categoryId, frequencyType, weeklyTarget,
              isArchived, createdAt, sortOrder
       FROM habits
       ORDER BY sortOrder ASC, createdAt ASC`
    )
    .all() as HabitRow[];
  return rows.map(rowToHabit);
}

export function insertHabit(
  db: Database.Database,
  habit: Habit
): Habit {
  db.prepare(
    `INSERT INTO habits
       (id, name, icon, categoryId, frequencyType, weeklyTarget, isArchived, createdAt, sortOrder)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    habit.id,
    habit.name,
    habit.icon,
    habit.categoryId,
    habit.frequencyType,
    habit.weeklyTarget,
    habit.isArchived ? 1 : 0,
    habit.createdAt,
    habit.sortOrder
  );
  return habit;
}

export function getHabitById(
  db: Database.Database,
  id: string
): Habit | null {
  const row = db
    .prepare(
      `SELECT id, name, icon, categoryId, frequencyType, weeklyTarget,
              isArchived, createdAt, sortOrder
       FROM habits WHERE id = ?`
    )
    .get(id) as HabitRow | undefined;
  return row ? rowToHabit(row) : null;
}
