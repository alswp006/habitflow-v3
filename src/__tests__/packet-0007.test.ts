import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import BetterSqlite3 from "better-sqlite3";
import { listActiveHabits } from "@/lib/db/repositories/habitsRepo";
import { insertHabit } from "@/lib/db/repositories/habitsRepo";
import { openDb, runMigrations } from "@/lib/db";
import type { Habit } from "@/lib/types/entities";

describe("Habits Screen (Packet 0007)", () => {
  let db: BetterSqlite3.Database;

  beforeEach(() => {
    db = openDb(":memory:");
    runMigrations(db);
  });

  afterEach(() => {
    try {
      db.close();
    } catch (e) {
      // Already closed
    }
  });

  it("should load active habits ordered by sortOrder then createdAt", () => {
    const habit1: Habit = {
      id: "h1",
      name: "Morning Run",
      icon: "🏃",
      categoryId: null,
      frequencyType: "daily",
      weeklyTarget: null,
      isArchived: false,
      createdAt: "2026-03-01T08:00:00Z",
      sortOrder: 1,
    };

    const habit2: Habit = {
      id: "h2",
      name: "Meditation",
      icon: "🧘",
      categoryId: null,
      frequencyType: "daily",
      weeklyTarget: null,
      isArchived: false,
      createdAt: "2026-03-02T08:00:00Z",
      sortOrder: 2,
    };

    insertHabit(db, habit1);
    insertHabit(db, habit2);

    const habits = listActiveHabits(db);

    expect(habits).toHaveLength(2);
    expect(habits[0].id).toBe("h1");
    expect(habits[1].id).toBe("h2");
  });

  it("should exclude archived habits from active list", () => {
    const habit1: Habit = {
      id: "h1",
      name: "Morning Run",
      icon: "🏃",
      categoryId: null,
      frequencyType: "daily",
      weeklyTarget: null,
      isArchived: false,
      createdAt: "2026-03-01T08:00:00Z",
      sortOrder: 1,
    };

    const habit2: Habit = {
      id: "h2",
      name: "Archived Habit",
      icon: "📦",
      categoryId: null,
      frequencyType: "daily",
      weeklyTarget: null,
      isArchived: true,
      createdAt: "2026-03-02T08:00:00Z",
      sortOrder: 2,
    };

    insertHabit(db, habit1);
    insertHabit(db, habit2);

    const habits = listActiveHabits(db);

    expect(habits).toHaveLength(1);
    expect(habits[0].id).toBe("h1");
  });

  it("should return empty list when no active habits exist", () => {
    const habits = listActiveHabits(db);
    expect(habits).toHaveLength(0);
  });

  it("should handle weekly habits with weeklyTarget", () => {
    const habit: Habit = {
      id: "h1",
      name: "Gym",
      icon: "💪",
      categoryId: null,
      frequencyType: "weekly",
      weeklyTarget: 3,
      isArchived: false,
      createdAt: "2026-03-01T08:00:00Z",
      sortOrder: 1,
    };

    insertHabit(db, habit);

    const habits = listActiveHabits(db);

    expect(habits).toHaveLength(1);
    expect(habits[0].frequencyType).toBe("weekly");
    expect(habits[0].weeklyTarget).toBe(3);
  });

  it("should preserve habit metadata including icon and category", () => {
    const habit: Habit = {
      id: "h1",
      name: "Reading",
      icon: "📚",
      categoryId: "cat-123",
      frequencyType: "daily",
      weeklyTarget: null,
      isArchived: false,
      createdAt: "2026-03-01T08:00:00Z",
      sortOrder: 1,
    };

    insertHabit(db, habit);

    const habits = listActiveHabits(db);

    expect(habits[0].icon).toBe("📚");
    expect(habits[0].categoryId).toBe("cat-123");
    expect(habits[0].name).toBe("Reading");
  });
});
