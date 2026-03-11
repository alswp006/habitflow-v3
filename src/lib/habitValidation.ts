import type { FrequencyType } from "@/lib/types/entities";

export const MAX_NAME_LENGTH = 50;
export const MAX_ICON_LENGTH = 20;
export const MIN_WEEKLY_TARGET = 1;
export const MAX_WEEKLY_TARGET = 7;

export interface HabitFormValues {
  name: string;
  icon: string;
  frequencyType: FrequencyType;
  weeklyTargetText: string;
}

export interface HabitFormErrors {
  name?: string;
  weeklyTarget?: string;
}

export interface HabitFormResult {
  valid: boolean;
  errors: HabitFormErrors;
  weeklyTarget: number | null;
}

export function validateHabitForm(values: HabitFormValues): HabitFormResult {
  const errors: HabitFormErrors = {};

  const trimmedName = values.name.trim();
  if (trimmedName.length < 1 || trimmedName.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be 1–${MAX_NAME_LENGTH} characters`;
  }

  let weeklyTarget: number | null = null;
  if (values.frequencyType === "weekly") {
    const parsed = parseInt(values.weeklyTargetText, 10);
    if (
      isNaN(parsed) ||
      parsed < MIN_WEEKLY_TARGET ||
      parsed > MAX_WEEKLY_TARGET
    ) {
      errors.weeklyTarget = `Weekly target must be ${MIN_WEEKLY_TARGET}–${MAX_WEEKLY_TARGET}`;
    } else {
      weeklyTarget = parsed;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    weeklyTarget,
  };
}
