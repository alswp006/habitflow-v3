/**
 * Local-only MVP guard module
 *
 * This module enforces the MVP constraint of no network usage for habit data.
 * Any attempt to use cloud sync or network features will fail fast with a clear error.
 *
 * Import throwIfApiCalled(feature) in any code that would require cloud connectivity.
 * This ensures the MVP stays local-only until cloud features are explicitly enabled.
 */

export const LOCAL_ONLY_MVP = true;

/**
 * Throws a LocalOnlyMvpError if called, preventing accidental API usage during MVP phase.
 *
 * @param feature - The feature name that was attempted (e.g., "cloud-sync", "user-profile")
 * @throws {Error} LocalOnlyMvpError with the feature name in the message
 *
 * @example
 * if (shouldSyncToCloud) {
 *   throwIfApiCalled("cloud-sync"); // Will never return
 * }
 */
export function throwIfApiCalled(feature: string): never {
  const error = new Error(
    `Feature "${feature}" requires network access, which is not available in the local-only MVP phase`
  );
  error.name = "LocalOnlyMvpError";
  throw error;
}
