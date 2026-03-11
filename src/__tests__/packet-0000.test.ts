import { describe, it, expect } from "vitest";
import type {
  FrequencyType,
  Habit,
  Category,
  CompletionRecord,
  StreakState,
} from "@/lib/types/entities";
import type {
  HabitWithCategory,
  TodayHabitRow,
  CalendarDaySummary,
  StatsPeriod,
  StatsSummary,
} from "@/lib/types/viewModels";

describe("Entity types", () => {
  it("Habit accepts valid daily habit shape", () => {
    const habit: Habit = {
      id: "h1",
      name: "Exercise",
      icon: "🏃",
      categoryId: "cat1",
      frequencyType: "daily",
      weeklyTarget: null,
      isArchived: false,
      createdAt: "2026-01-01T00:00:00Z",
      sortOrder: 0,
    };
    expect(habit.frequencyType).toBe("daily");
    expect(habit.weeklyTarget).toBeNull();
  });

  it("Habit accepts valid weekly habit shape", () => {
    const habit: Habit = {
      id: "h2",
      name: "Long run",
      icon: "🏋️",
      categoryId: null,
      frequencyType: "weekly",
      weeklyTarget: 3,
      isArchived: false,
      createdAt: "2026-01-01T00:00:00Z",
      sortOrder: 1,
    };
    expect(habit.frequencyType).toBe("weekly");
    expect(habit.weeklyTarget).toBe(3);
  });

  it("CompletionRecord accepts completed and incomplete states", () => {
    const done: CompletionRecord = {
      id: "c1",
      habitId: "h1",
      date: "2026-03-11",
      completed: true,
      completedAt: "2026-03-11T08:00:00Z",
    };
    const skipped: CompletionRecord = {
      id: "c2",
      habitId: "h1",
      date: "2026-03-10",
      completed: false,
      completedAt: null,
    };
    expect(done.completed).toBe(true);
    expect(skipped.completedAt).toBeNull();
  });

  it("StreakState holds streak counters", () => {
    const streak: StreakState = {
      habitId: "h1",
      currentStreak: 5,
      bestStreak: 14,
      lastCompletedDate: "2026-03-11",
    };
    expect(streak.currentStreak).toBe(5);
    expect(streak.bestStreak).toBe(14);
  });
});

describe("View model types", () => {
  it("TodayHabitRow composes Habit, Category, and streak", () => {
    const category: Category = { id: "cat1", name: "Health", color: "#00FF00" };
    const streak: StreakState = {
      habitId: "h1",
      currentStreak: 3,
      bestStreak: 7,
      lastCompletedDate: "2026-03-10",
    };
    const row: TodayHabitRow = {
      id: "h1",
      name: "Exercise",
      icon: "🏃",
      categoryId: "cat1",
      frequencyType: "daily",
      weeklyTarget: null,
      isArchived: false,
      createdAt: "2026-01-01T00:00:00Z",
      sortOrder: 0,
      category,
      completed: false,
      completedAt: null,
      streak,
    };
    expect(row.category?.name).toBe("Health");
    expect(row.streak.currentStreak).toBe(3);
  });

  it("CalendarDaySummary holds completion rate", () => {
    const summary: CalendarDaySummary = {
      date: "2026-03-11",
      totalHabits: 5,
      completedHabits: 4,
      completionRate: 0.8,
    };
    expect(summary.completionRate).toBe(0.8);
  });

  it("StatsSummary accepts valid period and aggregates", () => {
    const period: StatsPeriod = "week";
    const stats: StatsSummary = {
      period,
      startDate: "2026-03-05",
      endDate: "2026-03-11",
      totalCompletions: 28,
      totalPossible: 35,
      completionRate: 0.8,
      bestStreak: 7,
      currentStreak: 4,
    };
    expect(stats.period).toBe("week");
    expect(stats.completionRate).toBeCloseTo(0.8);
  });
});
