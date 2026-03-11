import "../src/styles/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#09090b" },
          headerTintColor: "#f0f0f3",
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: "#09090b" },
        }}
      >
        <Stack.Screen
          name="(modal)/habit-editor"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
