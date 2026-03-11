import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Button } from "@/components/ui/button";
import { useDbStore } from "@/store/dbStore";
import { listActiveHabits } from "@/lib/db/repositories/habitsRepo";
import type { Habit } from "@/lib/types/entities";

type LoadingState = "idle" | "loading" | "error" | "success";

const styles = StyleSheet.create({
  contentContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  separator: { height: 12 },
});

const getFrequencyLabel = (frequencyType: string, weeklyTarget?: number | null): string => {
  if (frequencyType === "weekly" && weeklyTarget) {
    return `${weeklyTarget}x/week`;
  }
  return frequencyType === "daily" ? "Daily" : "Weekly";
};

const HabitRow = React.memo(({ item, onPress }: { item: Habit; onPress: (id: string) => void }) => (
  <Pressable
    onPress={() => onPress(item.id)}
    className="flex-row items-center gap-4 rounded-xl border border-border bg-bg-card p-4 min-h-[48px]"
  >
    <Text className="text-2xl">{item.icon}</Text>
    <View className="flex-1">
      <Text className="text-base font-semibold text-text">{item.name}</Text>
      <Text className="text-sm text-text-secondary">
        {getFrequencyLabel(item.frequencyType, item.weeklyTarget)}
      </Text>
    </View>
  </Pressable>
));

HabitRow.displayName = "HabitRow";

export default function HabitsScreen() {
  const dbStore = useDbStore();
  const colorScheme = useColorScheme();
  const accentColor = colorScheme === "dark" ? "#60a5fa" : "#3b82f6";
  const [habits, setHabits] = useState<Habit[]>([]);
  const [state, setState] = useState<LoadingState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadHabits = useCallback(async () => {
    if (!dbStore.db) {
      setState("error");
      setErrorMessage("Database not initialized");
      return;
    }

    try {
      setState("loading");
      setErrorMessage("");
      // Yield to the event loop so loading state renders before the sync DB call
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      const data = listActiveHabits(dbStore.db);
      setHabits(data);
      setState("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load habits";
      setErrorMessage(message);
      setState("error");
    }
  }, [dbStore.db]);

  useEffect(() => {
    if (dbStore.status === "ready") {
      loadHabits();
    } else if (dbStore.status === "error") {
      setState("error");
      setErrorMessage(dbStore.errorMessage);
    }
  }, [dbStore.status, dbStore.db, loadHabits, dbStore.errorMessage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadHabits();
    setIsRefreshing(false);
  };

  const handleRetry = () => {
    loadHabits();
  };

  const handleNewHabit = () => {
    router.push("/(modal)/habit-editor");
  };

  const handleHabitPress = (habitId: string) => {
    router.push({ pathname: "/(modal)/habit-editor", params: { id: habitId } });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-2xl font-bold text-text">Habits</Text>
        <Button
          label="New"
          variant="secondary"
          onPress={handleNewHabit}
          className="px-4 py-2"
        />
      </View>

      {/* Loading State */}
      {state === "loading" && !isRefreshing && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-3 text-base text-text-secondary">Loading habits...</Text>
        </View>
      )}

      {/* Error State */}
      {state === "error" && (
        <View className="flex-1 items-center justify-center px-4">
          <View className="mb-6 items-center">
            <Text className="text-2xl mb-2">⚠️</Text>
            <Text className="text-base font-semibold text-text mb-2">Failed to Load</Text>
            <Text className="text-sm text-text-secondary text-center">{errorMessage}</Text>
          </View>
          <Button label="Retry" onPress={handleRetry} />
        </View>
      )}

      {/* Success State - Empty */}
      {state === "success" && habits.length === 0 && (
        <View className="flex-1 items-center justify-center px-4">
          <View className="mb-6 items-center">
            <Text className="text-4xl mb-4">📋</Text>
            <Text className="text-lg font-semibold text-text mb-2">No Habits Yet</Text>
            <Text className="text-sm text-text-secondary text-center mb-6">
              Create your first habit to start tracking
            </Text>
          </View>
          <Button label="Create Habit" onPress={handleNewHabit} />
        </View>
      )}

      {/* Success State - List */}
      {state === "success" && habits.length > 0 && (
        <FlatList
          data={habits}
          renderItem={({ item }) => <HabitRow item={item} onPress={handleHabitPress} />}
          keyExtractor={(item) => item.id}
          scrollEnabled
          contentContainerStyle={styles.contentContainer}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
