# CLAUDE.md — Project Rules

## CRITICAL: STANDALONE React Native / Expo app
- INDEPENDENT app, NOT monorepo. Only import from node_modules, app/, or src/
- No @ai-factory/*, drizzle-orm, @libsql/client, better-sqlite3. Check package.json first
- DB: use expo-sqlite (structured data) or expo-secure-store / AsyncStorage (key-value)
- ALWAYS check existing code before creating new files — avoid duplicates
- If you add new native modules, list them in dependencies so the pipeline can rebuild them

## CRITICAL: Expo Router File-Based Routing
- Route files live in app/ directory — Expo Router maps file paths to routes
- Route params: use `const { id } = useLocalSearchParams()` (synchronous, already typed)
- Global params: use `const { q } = useGlobalSearchParams()`
- Navigation: use `useRouter()` hook — `router.push("/path")`, `router.replace("/path")`, `router.back()`
- Link component: `import { Link } from "expo-router"` for declarative navigation
- Auth guards: implement in app/_layout.tsx using `useSegments()` + `useRouter()` redirect logic

## CRITICAL: Auth Pattern (SecureStore + Bearer Token)
- Auth store at src/store/auth.ts — use `useAuthStore()` — DO NOT recreate
- Storage wrapper at src/lib/storage.ts — handles SecureStore on native, localStorage on web
- API client at src/lib/api.ts — pass `token` param for authenticated requests
- For protected screens: check `useAuthStore(s => s.isAuthenticated)` in _layout.tsx
- Token is stored under key "auth_token" via storage wrapper — NEVER change this key
- Auth flow: `login(token)` stores token + sets isAuthenticated, `logout()` removes token
- Route protection example in _layout.tsx:
  ```tsx
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/(auth)/login");
  }, [isAuthenticated, isLoading]);
  ```

## CRITICAL: All Components Run on Device (No Server Components)
- ALL components in React Native are "client" components — hooks work everywhere
- useState, useEffect, useRef, useCallback are all available in every component
- Platform-specific code: use `Platform.OS === "ios" | "android" | "web"` checks
- Async operations: always use useEffect + useState (no server-side data fetching)
- Navigation must use expo-router's Link or useRouter() — no web <a> tags

## Commands
- `pnpm install --ignore-workspace` — install deps
- `pnpm dev` → `expo start` — start dev server
- `pnpm build` → `expo export` — export for web
- `pnpm build:ios` → `eas build --platform ios`
- `pnpm build:android` → `eas build --platform android`
- `pnpm typecheck` → `tsc --noEmit` — fix ALL errors before finishing
- `pnpm test` → `vitest run`
- IMPORTANT: Always use --ignore-workspace with pnpm to avoid monorepo interference

## Testing
- Write tests in src/__tests__/packet-{id}.test.ts alongside your implementation
- Use vitest: import {describe,it,expect,beforeEach,afterEach} from "vitest"
- Use @/ alias for imports (vitest resolves @/ → src/)
- Run pnpm test + pnpm typecheck before finishing

### Test Best Practices (CRITICAL — follow these to avoid failures)
- Test isolation: Each test must create its own test data — never depend on data from other tests
- Test isolation: Tests run in PARALLEL — use unique identifiers per test file to avoid collisions
- Unique data: Use unique keys per test FILE (e.g., `test-p0001-${Date.now()}`) to avoid conflicts
- Storage tests: mock expo-secure-store and Platform at module level — don't call native APIs in tests
- Async: storage and API calls are ASYNC — always await them in tests
- Error cases: test both success and error/rejection paths

## Code Style
- TypeScript strict, Expo Router (app/ dir), source in src/, all files typed
- NativeWind for styling (className prop with Tailwind classes) — no StyleSheet.create unless needed
- No inline styles unless dynamic values are required
- All imports must resolve — verify with pnpm typecheck

## Code Quality (CRITICAL — your code will be reviewed by AI)
- Single Responsibility: Each file/component should do ONE thing. If a component exceeds ~150 lines, extract sub-components.
- DRY: Before creating new helpers, check existing code in src/lib/ and src/components/. Import and reuse.
- Error Handling: Every API call must have try/catch. Show loading states (ActivityIndicator) during async ops. Show user-friendly error messages.
- TypeScript: Use explicit return types for exported functions. NEVER use `any` — use `unknown` and narrow with type guards.
- Naming: Descriptive names (getUserById not getData). Constants in UPPER_SNAKE_CASE. Components in PascalCase.
- No Magic Numbers: Extract into named constants (MAX_ITEMS = 10, DEBOUNCE_MS = 300).
- Accessibility: accessibilityLabel on icon-only Pressables. accessibilityRole on interactive elements. Minimum touch target: 48×48dp.
- Performance: Avoid unnecessary re-renders (useCallback/useMemo where appropriate). Use FlatList for scrollable lists — never ScrollView + .map() for long lists.
- Pattern Consistency: Match existing codebase patterns. Don't introduce new patterns when existing ones work.

## Common Build Error Prevention
- KeyboardAvoidingView: wrap forms with behavior="padding" on iOS, "height" on Android
- SafeAreaView: always use from react-native-safe-area-context (not react-native)
- Images: use `<Image source={{ uri: url }} style={{ width, height }} />` from react-native
- FlatList vs ScrollView: FlatList for dynamic lists (virtualized), ScrollView for fixed content
- useWindowDimensions(): use for responsive layouts instead of hardcoded pixel values
- Platform checks: `Platform.OS === "web"` for web-specific fallbacks

## Design System — NativeWind + "Linear meets Notion" aesthetic

### Component Library (ALWAYS use — never raw View/Text/Pressable for interactive elements)
```tsx
import { Button } from "@/components/ui/button"    // variant: default|secondary|ghost|destructive|outline
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"                    // NativeWind class merging
```
- Button always sets accessibilityRole="button" and min-h-[48px] touch target
- For nav links: `<Link href="/path" asChild><Button label="Go" variant="ghost" /></Link>`

### Layout Rules
- Root screen wrapper: `<SafeAreaView className="flex-1 bg-bg">`
- Scrollable content: `<ScrollView contentContainerClassName="px-4 py-6 gap-4">`
- Section padding: `px-4` (16dp) horizontal, `py-6` (24dp) vertical
- Responsive: use `useWindowDimensions()` for width-based breakpoints on web/tablet
- Lists: always `<FlatList>` with `ItemSeparatorComponent` — never ScrollView + .map()
- Forms: wrap in `<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>`

### Colors (NativeWind Tailwind classes — defined in tailwind.config.js)
- Backgrounds: `bg-bg`, `bg-bg-elevated`, `bg-bg-card`, `bg-bg-input`
- Text: `text-text`, `text-text-secondary`, `text-text-muted`
- Accent: `bg-accent`, `bg-accent-soft`, `text-accent`
- Borders: `border-border`, `border-border-hover` (use with `border` class)
- Semantic: `bg-success-soft`, `bg-danger-soft`, `bg-warning-soft`
- Never hardcode hex values in className — use the token names above

### Icons
- Use lucide-react-native: `import { IconName } from "lucide-react-native"`
- Always pass size and color props: `<Heart size={20} color="#f0f0f3" />`
- Wrap icon-only Pressables with accessibilityLabel

### Anti-patterns
- ScrollView with .map() for long lists — use FlatList
- Hardcoded pixel dimensions — use dp units and useWindowDimensions()
- Missing touch targets — every Pressable needs min 48×48dp
- No loading states — always show ActivityIndicator during async ops
- Raw Pressable/Text for buttons/inputs — use components from @/components/ui/

## Navigation
- Every screen reachable from tab bar or stack navigation
- Tab layout at app/(tabs)/_layout.tsx — add new tabs here
- Root layout at app/_layout.tsx — UPDATE it, don't recreate
- Auth screens in app/(auth)/ — protected screens in app/(tabs)/ or app/(app)/

## Final Checklist (run before finishing)
1. pnpm typecheck — zero errors
2. pnpm test — all tests pass
3. No unresolved imports
4. All Pressables have accessibilityLabel and min 48×48dp
5. Async operations have loading + error states

## Pre-built Auth (DO NOT RECREATE)
- Auth store at src/store/auth.ts — useAuthStore() with login/logout/loadToken
- Storage wrapper at src/lib/storage.ts — SecureStore on native, localStorage on web
- API client at src/lib/api.ts — apiFetch() with optional Bearer token
- Login screen at app/(auth)/login.tsx — email + password form
- For protected screens: check isAuthenticated in _layout.tsx with useSegments() redirect
