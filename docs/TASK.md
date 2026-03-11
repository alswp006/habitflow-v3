# TASKS

## Epic 1. TypeScript types + interfaces (`src/lib/types/`)

### Task 1.1 Core entity types (Habit/Category/CompletionRecord/StreakState)
- **Description:** Add strict TypeScript types for all core entities exactly as specified (no runtime code).
- **DoD:**
  - `src/lib/types/entities.ts` exports `FrequencyType`, `Habit`, `Category`, `CompletionRecord`, `StreakState` matching SPEC field names/types.
  - `tsc --noEmit` passes in strict mode.
- **Covers:** [F1-AC1] (types exist for schema/repo use), [F4-AC1] (streak shape available)
- **Files:**  
  - `src/lib/types/entities.ts`
- **Depends on:** none

### Task 1.2 Derived/query result types for UI consumption
- **Description:** Define non-persisted view model types used by Today/Calendar/Stats queries (pure types only).
- **DoD:**
  - New type file exports:
    - `HabitWithCategory` (habit + optional category fields needed for grouping)
    - `TodayHabitRow` (habit + completedToday + streak placeholders)
    - `CalendarDaySummary` (`date`, `completedCount`, `totalHabits`)
    - `StatsPeriod = "weekly" | "monthly"` and `StatsSummary` (rate + totals + per-habit rows)
  - No runtime code added.
- **Covers:** [F3-AC1], [F5-AC1], [F6-AC1]
- **Files:**
  - `src/lib/types/viewModels.ts`
- **Depends on:** Task 1.1

---

## Epic 2. Data storage + repositories (`src/lib/db/`, `src/store/`)

### Task 2.1 SQLite connection helper + migration runner (init only, no CRUD)
- **Description:** Create a DB module that opens SQLite and runs migrations; no repository functions yet.
- **DoD:**
  - `openDb()` returns an opened SQLite database instance.
  - `runMigrations()` creates a `migrations` table and applies pending migrations in order.
  - Module compiles and can be imported without side effects (no init on import).
- **Covers:** [F1-AC1] (foundation for init)
- **Files:**
  - `src/lib/db/index.ts`
  - `src/lib/db/migrations/001_init.ts`
  - `src/lib/db/migrations/index.ts`
- **Depends on:** Task 1.1

### Task 2.2 Migration 001: create tables + unique constraint
- **Description:** Implement the actual schema creation in migration 001 for `habits`, `categories`, `completion_records`, including the unique `(habitId, date)` constraint.
- **DoD:**
  - Migration SQL creates:
    - `categories` table
    - `habits` table (with nullable `categoryId`)
    - `completion_records` table
    - Unique index/constraint on `(habitId, date)`
  - Foreign key fields exist (even if FK enforcement is not guaranteed on all platforms).
- **Covers:** [F1-AC1, F1-AC2]
- **Files:**
  - `src/lib/db/migrations/001_init.ts`
- **Depends on:** Task 2.1

### Task 2.3 DB init Zustand store (blocking init + retry state)
- **Description:** Add a zustand store to initialize DB on app start, exposing `status/error` + `retry()`.
- **DoD:**
  - Store state includes `status: "idle" | "loading" | "ready" | "error"`, `errorMessage?: string`.
  - `init()` runs `runMigrations()` and sets status to `ready` on success.
  - `retry()` re-runs `init()`.
  - No UI changes yet; app still compiles.
- **Covers:** [F1-AC5]
- **Files:**
  - `src/store/dbStore.ts`
- **Depends on:** Task 2.1, Task 2.2

### Task 2.4 Categories repository (CRUD)
- **Description:** Implement local-only CRUD functions for `Category`.
- **DoD:**
  - Functions (all async) exist and are exported:
    - `listCategories(): Promise<Category[]>`
    - `createCategory(input): Promise<Category>`
    - `updateCategory(id, patch): Promise<Category>`
    - `deleteCategory(id): Promise<void>`
  - Each function uses SQLite only (no network calls).
  - Errors are thrown (not swallowed).
- **Covers:** [F2-AC7], [F1-AC3]
- **Files:**
  - `src/lib/db/repositories/categoriesRepo.ts`
- **Depends on:** Task 2.1, Task 2.2, Task 1.1

### Task 2.5 Habits repository (CRUD + archive + ordering)
- **Description:** Implement local-only CRUD for `Habit`, including archive and list-active queries.
- **DoD:**
  - Exported functions (async):
    - `listActiveHabits(): Promise<Habit[]>` (where `isArchived=0`, ordered by `sortOrder ASC, createdAt ASC`)
    - `listAllHabits(): Promise<Habit[]>`
    - `createHabit(input): Promise<Habit>` (sets defaults: `isArchived=false`, `sortOrder>=0`)
    - `updateHabit(id, patch): Promise<Habit>`
    - `archiveHabit(id): Promise<void>` (sets `isArchived=true`)
    - `deleteHabit(id): Promise<void>`
  - All writes are SQLite-only.
- **Covers:** [F2-AC1, F2-AC4, F2-AC7], [F1-AC3]
- **Files:**
  - `src/lib/db/repositories/habitsRepo.ts`
- **Depends on:** Task 2.1, Task 2.2, Task 1.1

### Task 2.6 Completion records repository (upsert + unique constraint error surfaced)
- **Description:** Implement completion toggle persistence with deterministic unique constraint behavior.
- **DoD:**
  - Exported functions (async):
    - `getCompletion(habitId, date): Promise<CompletionRecord | null>`
    - `setCompletion(habitId, date, completed): Promise<CompletionRecord>` (creates or updates; sets `completedAt` when `completed=true`, null when false)
    - `insertCompletion(record): Promise<CompletionRecord>` that will **throw** on unique `(habitId,date)` conflict
  - When `insertCompletion` hits a uniqueness violation, the thrown error includes a stable marker (e.g. `name === "UniqueConstraintError"` or `code === "SQLITE_CONSTRAINT_UNIQUE"`).
- **Covers:** [F1-AC2], [F3-AC2]
- **Files:**
  - `src/lib/db/repositories/completionsRepo.ts`
- **Depends on:** Task 2.1, Task 2.2, Task 1.1

### Task 2.7 Local date utilities (`YYYY-MM-DD`) + week/month boundaries
- **Description:** Add small, reusable date helpers for local date string formatting and period boundaries.
- **DoD:**
  - `toLocalDateString(date?: Date): string` returns `YYYY-MM-DD` using local device time.
  - `getWeekRange(date: Date): { start: string; end: string }` (inclusive, local)
  - `getMonthRange(date: Date): { start: string; end: string }` (inclusive, local)
  - No external dependencies required.
- **Covers:** [Common: Local date standard], [F4-AC4], [F6-AC1]
- **Files:**
  - `src/lib/date/localDate.ts`
- **Depends on:** none

### Task 2.8 Streak computation service (derived, in-memory)
- **Description:** Implement streak calculation for daily and weekly habits from completion history.
- **DoD:**
  - Export `computeStreakState(habit: Habit, completions: CompletionRecord[], today: string): StreakState`
  - Daily rules:
    - If no completions => `{currentStreak:0,bestStreak:0,lastCompletedDate:null}`
    - Current streak counts consecutive completed days ending at `today`.
    - Best streak is max consecutive run.
  - Weekly rules:
    - Requires `weeklyTarget` when `frequencyType==="weekly"`; if missing treat as 0-achievable with streak 0.
    - A week is “achieved” if completed days in that week >= target.
    - Current streak counts consecutive achieved weeks including current week.
  - Pure logic (no SQLite calls).
- **Covers:** [F4-AC1, F4-AC2, F4-AC3, F4-AC4, F4-AC5]
- **Files:**
  - `src/lib/streaks/computeStreak.ts`
- **Depends on:** Task 1.1, Task 2.7

### Task 2.9 Query: Today dataset loader (habits + categories + today completions)
- **Description:** Create a single data function that loads what Today needs from SQLite in one call.
- **DoD:**
  - Export `loadTodayData(today: string)` returning:
    - active habits
    - categories
    - today completion records
  - Function throws on SQLite errors (caller can show error state).
- **Covers:** [F3-AC1, F3-AC5]
- **Files:**
  - `src/lib/db/queries/todayQueries.ts`
- **Depends on:** Task 2.4, Task 2.5, Task 2.6, Task 2.7

### Task 2.10 Query: Calendar month summaries + date detail loader
- **Description:** Add SQLite query helpers for Calendar month grid and selected-day details.
- **DoD:**
  - Export `getMonthSummaries(monthStart: string, monthEnd: string): Promise<CalendarDaySummary[]>`
  - Export `getDayDetails(date: string): Promise<{ habits: Habit[]; completions: CompletionRecord[] }>`
  - Total habits uses **non-archived** habits only.
- **Covers:** [F5-AC1, F5-AC2, F5-AC7]
- **Files:**
  - `src/lib/db/queries/calendarQueries.ts`
- **Depends on:** Task 2.5, Task 2.6, Task 1.2

### Task 2.11 Query: Stats weekly/monthly aggregates + per-habit summary
- **Description:** Implement SQLite-only aggregate queries for Stats.
- **DoD:**
  - Export `getStatsSummary(period: "weekly" | "monthly", anchorDate: Date): Promise<StatsSummary>`
  - Uses non-archived habits only.
  - Returns:
    - overall completion rate (%) for the period
    - total completed count
    - per-habit completed counts for the period
  - Throws on SQLite errors.
- **Covers:** [F6-AC1, F6-AC2]
- **Files:**
  - `src/lib/db/queries/statsQueries.ts`
- **Depends on:** Task 1.2, Task 2.5, Task 2.6, Task 2.7

---

## Epic 3. API integration (`src/lib/api/`)
> SPEC says **no cloud sync in MVP**. This epic is intentionally minimal to prevent accidental network usage.

### Task 3.1 Add “local-only” API guard module (documentation + lintable import)
- **Description:** Add a small module to make “no API calls” explicit and easy to reference from code reviews.
- **DoD:**
  - `src/lib/api/localOnly.ts` exports `assertNoNetworkUsed(featureName: string): void` which is a no-op in production, and can `console.warn` in dev.
  - No existing API client behavior is changed.
- **Covers:** [F1-AC3], [F2-AC7], [F3-AC7], [F5-AC7]
- **Files:**
  - `src/lib/api/localOnly.ts`
- **Depends on:** none

---

## Epic 4. Core screens (`app/(tabs)/`, `app/(modal)/`)

### Task 4.1 DB blocking error screen component (Retry)
- **Description:** Create a reusable blocking error UI for DB init failures (no navigation wiring yet).
- **DoD:**
  - Component renders:
    - title + error message text
    - “Retry” button calling provided callback
  - Uses `SafeAreaView`.
- **Covers:** [F1-AC5]
- **Files:**
  - `src/components/DbBlockingError.tsx`
- **Depends on:** Task 2.3

### Task 4.2 Habits list screen (read-only list + loading/error + pull-to-refresh)
- **Description:** Add a Habits screen that lists active habits with loading, error + retry, and pull-to-refresh.
- **DoD:**
  - Screen uses `SafeAreaView`.
  - On mount: shows loading indicator until `listActiveHabits()` resolves/rejects.
  - Pull-to-refresh triggers a full reload; refresh ends within 2s or shows error view.
  - Does not render stale rows while loading (i.e., clears list when starting a reload).
- **Covers:** [F2-AC6]
- **Files:**
  - `app/(tabs)/habits.tsx`
- **Depends on:** Task 2.5

### Task 4.3 Habits list row swipe actions (Archive/Delete with confirm)
- **Description:** Add swipe-left actions on habit rows for Archive and Delete, with confirmation dialogs.
- **DoD:**
  - Swiping exposes two actions: “Archive” and “Delete”.
  - Archive action:
    - shows confirm dialog
    - on confirm calls `archiveHabit(id)` and removes row from list without app restart
  - Delete action:
    - shows confirm dialog
    - on cancel: no delete occurs and row remains visible
- **Covers:** [F2-AC4, F2-AC5]
- **Files:**
  - `app/(tabs)/habits.tsx`
  - (if needed) `src/components/HabitRowSwipeable.tsx`
- **Depends on:** Task 4.2, Task 2.5

### Task 4.4 New/Edit Habit modal screen scaffold (form shell + keyboard avoiding)
- **Description:** Add a modal screen for creating/editing habits with proper mobile form behaviors (no validation rules yet).
- **DoD:**
  - Screen uses `KeyboardAvoidingView` and keeps primary CTA tappable with keyboard open (iOS + Android).
  - Inputs present for: name, icon, frequency type,