import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useDbStore } from "@/store/dbStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  insertHabit,
  getHabitById,
  updateHabit,
} from "@/lib/db/repositories/habitsRepo";
import { listCategories } from "@/lib/db/repositories/categoriesRepo";
import {
  validateHabitForm,
  MAX_ICON_LENGTH,
} from "@/lib/habitValidation";
import type { Category, FrequencyType } from "@/lib/types/entities";

const QUICK_ICONS = ["💪", "🏃", "📚", "💧", "🥗", "🧘", "😴", "✍️", "🎯", "🌟"];

function FrequencyPicker({
  value,
  onChange,
}: {
  value: FrequencyType;
  onChange: (v: FrequencyType) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {(["daily", "weekly"] as FrequencyType[]).map((type) => {
        const isSelected = value === type;
        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            className={`flex-1 items-center justify-center rounded-xl border min-h-[48px] ${
              isSelected
                ? "border-accent bg-accent/10"
                : "border-border bg-bg-input"
            }`}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
          >
            <Text
              className={`text-sm font-semibold capitalize ${
                isSelected ? "text-accent" : "text-text-secondary"
              }`}
            >
              {type}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function HabitEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const dbStore = useDbStore();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💪");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("daily");
  const [weeklyTargetText, setWeeklyTargetText] = useState("3");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nameError, setNameError] = useState("");
  const [weeklyTargetError, setWeeklyTargetError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (dbStore.status !== "ready" || !dbStore.db) return;
    const db = dbStore.db;
    void listCategories(db).then(setCategories);
    if (isEdit && id) {
      const habit = getHabitById(db, id);
      if (habit) {
        setName(habit.name);
        setIcon(habit.icon);
        setFrequencyType(habit.frequencyType);
        setWeeklyTargetText(habit.weeklyTarget?.toString() ?? "3");
        setCategoryId(habit.categoryId);
      }
    }
  }, [dbStore.status, dbStore.db, id, isEdit]);

  const handleSave = useCallback(() => {
    if (!dbStore.db) return;
    const result = validateHabitForm({ name, icon, frequencyType, weeklyTargetText });
    setNameError(result.errors.name ?? "");
    setWeeklyTargetError(result.errors.weeklyTarget ?? "");
    if (!result.valid) return;

    setIsSaving(true);
    try {
      if (isEdit && id) {
        updateHabit(dbStore.db, id, {
          name: name.trim(),
          icon: icon.slice(0, MAX_ICON_LENGTH),
          frequencyType,
          weeklyTarget: result.weeklyTarget,
          categoryId,
        });
      } else {
        insertHabit(dbStore.db, {
          id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: name.trim(),
          icon: icon.slice(0, MAX_ICON_LENGTH),
          categoryId,
          frequencyType,
          weeklyTarget: result.weeklyTarget,
          isArchived: false,
          createdAt: new Date().toISOString(),
          sortOrder: Date.now(),
        });
      }
      router.back();
    } finally {
      setIsSaving(false);
    }
  }, [dbStore.db, name, icon, frequencyType, weeklyTargetText, categoryId, isEdit, id]);

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Text className="text-xl font-bold text-text">
            {isEdit ? "Edit Habit" : "New Habit"}
          </Text>
          <Button
            label="Cancel"
            variant="ghost"
            onPress={() => router.back()}
            className="px-3"
          />
        </View>

        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <Text className="mb-2 text-sm font-medium text-text-secondary">Name</Text>
          <Input
            value={name}
            onChangeText={(t) => { setName(t); if (nameError) setNameError(""); }}
            placeholder="e.g. Morning Run"
            error={Boolean(nameError)}
          />
          {nameError ? (
            <Text className="mt-1 text-xs text-danger">{nameError}</Text>
          ) : null}

          {/* Icon */}
          <Text className="mt-5 mb-2 text-sm font-medium text-text-secondary">Icon</Text>
          <Input
            value={icon}
            onChangeText={setIcon}
            placeholder="💪"
            maxLength={MAX_ICON_LENGTH}
          />
          <View className="mt-2 flex-row flex-wrap gap-2">
            {QUICK_ICONS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => setIcon(emoji)}
                className={`items-center justify-center rounded-lg border min-h-[48px] w-[44px] ${
                  icon === emoji ? "border-accent bg-accent/10" : "border-border bg-bg-input"
                }`}
                accessibilityLabel={`Set icon to ${emoji}`}
              >
                <Text className="text-2xl">{emoji}</Text>
              </Pressable>
            ))}
          </View>

          {/* Frequency */}
          <Text className="mt-5 mb-2 text-sm font-medium text-text-secondary">Frequency</Text>
          <FrequencyPicker value={frequencyType} onChange={setFrequencyType} />

          {/* Weekly Target */}
          {frequencyType === "weekly" && (
            <View className="mt-4">
              <Text className="mb-2 text-sm font-medium text-text-secondary">
                Times per week (1–7)
              </Text>
              <Input
                value={weeklyTargetText}
                onChangeText={(t) => {
                  setWeeklyTargetText(t);
                  if (weeklyTargetError) setWeeklyTargetError("");
                }}
                keyboardType="number-pad"
                placeholder="3"
                error={Boolean(weeklyTargetError)}
              />
              {weeklyTargetError ? (
                <Text className="mt-1 text-xs text-danger">{weeklyTargetError}</Text>
              ) : null}
            </View>
          )}

          {/* Category */}
          {categories.length > 0 && (
            <View className="mt-5">
              <Text className="mb-2 text-sm font-medium text-text-secondary">
                Category (optional)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <Pressable
                  onPress={() => setCategoryId(null)}
                  className={`rounded-xl border px-4 py-2.5 min-h-[48px] items-center justify-center ${
                    categoryId === null
                      ? "border-accent bg-accent/10"
                      : "border-border bg-bg-input"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      categoryId === null
                        ? "text-accent font-semibold"
                        : "text-text-secondary"
                    }`}
                  >
                    None
                  </Text>
                </Pressable>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    className={`rounded-xl border px-4 py-2.5 min-h-[48px] items-center justify-center ${
                      categoryId === cat.id
                        ? "border-accent bg-accent/10"
                        : "border-border bg-bg-input"
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        categoryId === cat.id
                          ? "text-accent font-semibold"
                          : "text-text-secondary"
                      }`}
                    >
                      {cat.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Save */}
        <View className="px-4 pt-3 pb-4 border-t border-border">
          <Button
            label={isEdit ? "Save Changes" : "Create Habit"}
            onPress={handleSave}
            loading={isSaving}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
