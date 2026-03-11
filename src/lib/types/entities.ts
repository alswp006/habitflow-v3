export type FrequencyType = "daily" | "weekly";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  categoryId: string | null;
  frequencyType: FrequencyType;
  weeklyTarget: number | null;
  isArchived: boolean;
  createdAt: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface CompletionRecord {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string | null;
}

export interface StreakState {
  habitId: string;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
}
