# SPEC

## Common Principles
- **Offline-first:** All habit, category, and completion data is stored locally and must be fully usable in airplane mode. No cloud sync in MVP.
- **Local date standard:** All completion records use local-device date strings in `YYYY-MM-DD`.
- **UI responsiveness:** Any write action (toggle completion, create/edit habit) updates UI immediately after local persistence succeeds; failures show an error message and keep prior UI state.
- **Navigation:** Use `expo-router` routes; tabs already exist in the template and are extended with app-specific screens.
- **Safe areas:** Every screen root uses `SafeAreaView` (or `SafeAreaView` + `ScrollView`) to avoid notches/home indicators on iOS and status bar overlap on Android.
- **Pull-to-refresh:** Every screen that renders a list/grid of data provides pull-to-refresh via `RefreshControl` and triggers a full local reload + recomputation.
- **Forms:** Every form screen uses `KeyboardAvoidingView` and ensures the primary CTA remains tappable with the keyboard open (iOS and Android).
- **Touch targets:** All tappable row items, buttons, icon pickers, and toggles have a minimum hit area of **44x44 points**.
- **Images/placeholders:** If preset icons are rendered as `Image`, show a placeholder view while the asset is loading (emoji icons do not require placeholders).
- **Errors:** SQLite/IO failures surface a visible error state with a retry action; no silent failures.

---

## Data Models

### Habit — fields, types, constraints
```ts
export type FrequencyType = "daily" | "weekly";

export interface Habit {
  id: string;                // uuid
  name: string;              // 1..50 chars
  icon: string;              // emoji or preset key, 1..20 chars
  categoryId: string | null; // nullable FK
  frequencyType: FrequencyType;
  weeklyTarget: number | null; // required if frequencyType==="weekly", 1..7
  isArchived: boolean;
  createdAt: string;         // ISO datetime string
  sortOrder: number;         // integer >= 0
}
```
- **Storage method:** Local SQLite (expo-sqlite).
- **Sync strategy:** None (local-only).

### Category — fields, types, constraints
```ts
export interface Category {
  id: string;       // uuid
  name: string;     // 1..30 chars
  color: string;    // hex like "#RRGGBB"
}
```
- **Storage method:** Local SQLite.
- **Sync strategy:** None.

### CompletionRecord — fields, types, constraints
```ts
export interface CompletionRecord {
  id: string;           // uuid
  habitId: string;      // FK -> Habit.id
  date: string;         // "YYYY-MM-DD" local
  completed: boolean;
  completedAt: string | null; // ISO datetime, required if completed=true
}
```
- **Storage method:** Local SQLite.
- **Sync strategy:** None.
- **Constraint:** Unique `(habitId, date)`.

### StreakState (derived) — fields, types, constraints
```ts
export interface StreakState {
  habitId: string;
  currentStreak: number;       // integer >= 0
  bestStreak: number;          // integer >= 0
  lastCompletedDate: string | null; // "YYYY-MM-DD" or null
}
```
- **Storage method:** Derived in-memory from SQLite queries (not persisted in MVP).
- **Sync strategy:** N/A.

---

## Feature List

### F1. Local SQLite Schema + Repositories (Offline-First Data Layer)
- **Description:** Define and initialize the SQLite schema for habits, categories, and completion records. Provide typed repository functions for CRUD operations and common queries used by the Today, Calendar, and Stats screens.
- **Data:** `Habit`, `Category`, `CompletionRecord`
- **API:** None (local-only SQLite). Errors: `SQLiteError`, validation errors.
- **Requirements:**
- **AC-1:** Given the app is launched on a fresh install, When the data layer initializes, Then SQLite tables `habits`, `categories`, and `completion_records` exist and app screens can query them without throwing.
- **AC-2:** Given a `CompletionRecord` exists for `(habitId, date)`, When the app attempts to insert another record with the same `(habitId, date)`, Then the operation results in a deterministic failure (unique constraint error) and the UI caller receives an error object.
- **AC-3 (offline):** Given the device is in airplane mode, When the app creates/updates/deletes a habit or toggles completion, Then the operation succeeds without any network calls.
- **AC-4 (loading):** Given a repository query takes longer than 150ms, When a screen requests that query, Then the screen can render a loading state until the promise resolves or rejects.
- **AC-5 (edge/failure):** Given SQLite returns an error during schema init, When initialization fails, Then the app shows a blocking error view with a “Retry” action that re-attempts initialization.

---

### F2. Habit & Category Management (Create/Edit/Archive/Delete + Sorting)
- **Description:** Users can create and edit habits with name, icon, frequency (daily or weekly target), and optional category. Users can manage categories (create/edit) and can archive or delete habits from the management list.
- **Data:** `Habit`, `Category`
- **API:** None (local-only SQLite). Errors: validation errors, `SQLiteError`.
- **Requirements:**
- **AC-1:** Given the user is on the New Habit screen, When they enter a name (1–50 chars), select an icon, choose `daily`, and tap “Save”, Then a new `Habit` row is created with `frequencyType="daily"`, `weeklyTarget=null`, `isArchived=false`, and it appears in the Habit List without restarting the app.
- **AC-2:** Given the user selects `weekly` frequency, When they set `weeklyTarget` to an integer between 1 and 7 and tap “Save”, Then the habit is saved with `frequencyType="weekly"` and `weeklyTarget` equal to that integer.
- **AC-3:** Given `weeklyTarget` is empty or outside 1–7, When the user taps “Save”, Then the save is blocked and an inline error message is shown and no SQLite write occurs.
- **AC-4 (gesture):** Given the user is on the Habit List, When they swipe left on a habit row and confirm “Archive”, Then that habit is updated to `isArchived=true` and is removed from the active list immediately.
- **AC-5 (gesture + failure/edge):** Given the user swipes left on a habit and selects “Delete”, When they cancel the confirmation dialog, Then no delete occurs and the row remains visible.
- **AC-6 (loading):** Given the Habit List screen is opened, When habits are being loaded from SQLite, Then a loading indicator is shown until the list is ready, and the screen does not render stale rows from a previous session state.
- **AC-7 (offline):** Given the device is offline, When the user creates/edits/archives/deletes a habit or category, Then the operation completes and persists locally.
- **AC-8 (mobile):** Given any habit list row is rendered, When the user taps within the row’s main tap area, Then the tappable hit area is at least 44x44 points.

---

### F3. Today Checklist (Grouped List + Toggle Completion + Pull-to-Refresh)
- **Description:** The Today screen shows the list of “due” habits for today, grouped by category, allowing a one-tap completion toggle. The screen reflects changes instantly and supports pull-to-refresh to recompute derived values (e.g., streak, daily totals).
- **Data:** `Habit`, `Category`, `CompletionRecord`, derived `StreakState`
- **API:** None (local-only). Errors: `SQLiteError`.
- **Requirements:**
- **AC-1:** Given at least one non-archived habit exists, When the user opens the Today screen, Then a list of non-archived habits is displayed grouped by category name (and a “No Category” group for null categoryId).
- **AC-2:** Given a habit row is shown on Today, When the user taps the row checkbox/toggle, Then a `CompletionRecord` for today is created or updated and the row shows completed state within 300ms after persistence resolves.
- **AC-3 (edge/failure):** Given SQLite fails to write the completion toggle, When the user taps to toggle completion, Then the UI reverts to the previous state and an error message with a “Retry” action is shown.
- **AC-4 (pull-to-refresh):** Given the Today list is visible, When the user performs pull-to-refresh, Then the app reloads habits/categories/completions from SQLite and recomputes derived streak values, and the refresh spinner stops within 2 seconds or shows an error state.
- **AC-5 (loading):** Given Today data is being queried, When the screen first mounts, Then a loading state is shown and no empty-state message is shown until the query completes.
- **AC-6 (empty):** Given there are zero non-archived habits, When the Today screen loads successfully, Then an empty state is shown with a CTA that navigates to “New Habit”.
- **AC-7 (offline):** Given the device is offline, When the user toggles a habit completion on Today, Then the toggle persists and remains after app restart.
- **AC-8 (mobile):** Given the Today list is scrollable, When the user scrolls and taps items, Then each tappable completion control has a minimum 44x44 hit area.

---

### F4. Streak Calculation & Display (Daily + Weekly Targets)
- **Description:** The app displays current streak and best streak per habit in relevant UI surfaces (Today rows and habit detail/edit header). Streaks are derived from completion history using a defined rule for daily habits and weekly-target habits.
- **Data:** `CompletionRecord`, `Habit`, derived `StreakState`
- **API:** None (local-only). Errors: query errors.
- **Requirements:**
- **AC-1:** Given a `daily` habit has completion records for consecutive dates ending today, When the Today screen renders that habit, Then `currentStreak` equals the count of consecutive days ending today with `completed=true`.
- **AC-2:** Given a `daily` habit’s longest consecutive completion run in history is N days, When streak is computed, Then `bestStreak` equals N.
- **AC-3:** Given a habit has no completion records, When streak is computed, Then `currentStreak=0`, `bestStreak=0`, and `lastCompletedDate=null`.
- **AC-4 (weekly rule):** Given a `weekly` habit with `weeklyTarget=T`, When the user has at least T completed days within the current local week, Then the habit is considered “week achieved” for streak computation for that week.
- **AC-5 (weekly streak):** Given a `weekly` habit achieved its target in K consecutive local weeks including the current week, When streak is computed, Then `currentStreak=K`.
- **AC-6 (loading):** Given streak depends on completion queries, When the dependent queries are still in-flight, Then the UI shows a placeholder (e.g., “—”) for streak values rather than rendering 0.
- **AC-7 (edge/failure):** Given completion history cannot be queried (SQLite error), When streak computation is requested, Then the UI shows an error indicator for streak (not a numeric value) and provides a retry action.

---

### F5. Calendar View (Monthly Grid + Date Detail + Pull-to-Refresh)
- **Description:** The Calendar screen shows a month grid with per-day completion summary and allows selecting a date to view that day’s habit completion details. Users can pull-to-refresh to reload month markings and selected-date details.
- **Data:** `Habit`, `CompletionRecord`
- **API:** None (local-only). Errors: `SQLiteError`.
- **Requirements:**
- **AC-1:** Given the user opens the Calendar screen, When the month grid renders, Then each day cell shows a summary value `completedCount/totalHabits` for that date (based on non-archived habits).
- **AC-2:** Given the user taps a day cell, When the day is selected, Then the details panel shows a list of habits with their completed/uncompleted state for that date.
- **AC-3 (pull-to-refresh):** Given the Calendar screen is visible, When the user performs pull-to-refresh, Then the month grid summaries and currently selected date detail are reloaded from SQLite, and the refresh spinner stops within 2 seconds or shows an error.
- **AC-4 (loading):** Given month summary data is loading, When the Calendar screen mounts, Then a loading indicator is shown and the grid is not interactive until loading completes.
- **AC-5 (edge):** Given the selected date has zero habits (because all habits are archived or none exist), When the user selects that date, Then the details panel shows an empty state message and a CTA to create a habit.
- **AC-6 (failure):** Given SQLite fails to query month summaries, When the Calendar screen requests data, Then an error state is shown with a retry button that re-attempts the same query.
- **AC-7 (offline):** Given the device is offline, When the user navigates across months and selects dates, Then month summaries and day details load from local data without network calls.

---

### F6. Stats Dashboard (Weekly/Monthly Achievement + Per-Habit Summary + Pull-to-Refresh)
- **Description:** The Stats screen provides a weekly and monthly view of achievement rate (%) and total completions, plus a per-habit summary list for the selected period. The user can toggle between Weekly and Monthly, and pull-to-refresh to recompute aggregates.
- **Data:** `Habit`, `CompletionRecord`
- **API:** None (local-only). Errors: `SQLiteError`.
- **Requirements:**
- **AC-1:** Given the Stats screen is opened, When the default period is “Weekly”, Then the screen shows (1) overall completion rate percentage and (2) total completed count for the current local week.
- **AC-2:** Given the user switches the period toggle to “Monthly”, When the toggle is changed, Then the screen recomputes and displays the same metrics for the current local month.
- **AC-3 (list + pull-to-refresh):** Given the per-habit summary list is visible, When the user performs pull-to-refresh, Then the aggregates and the per-habit list are recomputed from SQLite and the refresh indicator stops within 2 seconds or shows an error.
- **AC-4 (empty):** Given there are no non-archived habits, When Stats loads successfully, Then an empty state is shown with a CTA to create a habit and no percentages are displayed.
- **AC-5 (loading):** Given aggregate queries are in-flight, When Stats mounts, Then a loading indicator is shown and no stale aggregates are displayed.
- **AC-6 (failure/edge):** Given SQLite returns an error for aggregate queries, When the