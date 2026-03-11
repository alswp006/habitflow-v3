import { create } from "zustand";
import type BetterSqlite3 from "better-sqlite3";
import { openDb, runMigrations } from "@/lib/db";

export type DbStatus = "idle" | "loading" | "ready" | "error";

type DbState = {
  status: DbStatus;
  errorMessage: string;
  db: BetterSqlite3.Database | null;
  init: () => Promise<void>;
  retry: () => Promise<void>;
};

export const useDbStore = create<DbState>((set, get) => ({
  status: "idle",
  errorMessage: "",
  db: null,

  init: async (): Promise<void> => {
    set({ status: "loading", errorMessage: "" });
    try {
      const db = openDb();
      runMigrations(db);
      set({ status: "ready", db });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Database initialization failed";
      set({ status: "error", errorMessage, db: null });
    }
  },

  retry: async (): Promise<void> => {
    await get().init();
  },
}));
