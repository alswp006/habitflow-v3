import type { Habit, Category, StreakState } from "./entities";

export interface HabitWithCategory extends Habit {
  category: Category | null;
}

export interface TodayHabitRow extends HabitWithCategory {
  completed: boolean;
  completedAt: string | null;
  streak: StreakState;
}

export interface CalendarDaySummary {
  date: string;
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
}

export type StatsPeriod = "week" | "month" | "year";

export interface StatsSummary {
  period: StatsPeriod;
  startDate: string;
  endDate: string;
  totalCompletions: number;
  totalPossible: number;
  completionRate: number;
  bestStreak: number;
  currentStreak: number;
}
