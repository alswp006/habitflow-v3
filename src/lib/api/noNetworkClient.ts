/**
 * No-network API client shim for MVP
 *
 * This module provides typed GET/POST shims that throw LocalOnlyMvpError
 * when called. It allows the API layer to be present without adding
 * actual network behavior during the local-only MVP phase.
 *
 * Import these instead of apiFetch when you need API shapes but no network.
 */

import { throwIfApiCalled } from "./localOnly";

/**
 * Shim GET request that always throws LocalOnlyMvpError
 *
 * @param _path - The API path (unused, for type compatibility)
 * @param _token - Optional auth token (unused, for type compatibility)
 * @returns Never returns; always throws
 *
 * @throws {Error} LocalOnlyMvpError
 *
 * @example
 * // Type-safe but throws at runtime
 * const data = await apiGet<User>("/users/me");
 */
export async function apiGet<T>(_path: string, _token?: string | null): Promise<T> {
  throwIfApiCalled("api-get");
}

/**
 * Shim POST request that always throws LocalOnlyMvpError
 *
 * @param _path - The API path (unused, for type compatibility)
 * @param _body - Request body (unused, for type compatibility)
 * @param _token - Optional auth token (unused, for type compatibility)
 * @returns Never returns; always throws
 *
 * @throws {Error} LocalOnlyMvpError
 *
 * @example
 * // Type-safe but throws at runtime
 * const result = await apiPost<Response>("/sync", { habits: [...] });
 */
export async function apiPost<T>(
  _path: string,
  _body?: unknown,
  _token?: string | null
): Promise<T> {
  throwIfApiCalled("api-post");
}
