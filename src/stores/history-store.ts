"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type HistoryEntry = {
  id: string;
  timestamp: number;
  prompt: string;
  toolName: string;
  toolData: Record<string, unknown>;
};

type HistoryStore = {
  entries: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
};

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            {
              ...entry,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
            ...state.entries,
          ].slice(0, 100),
        })),
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        })),
      clearHistory: () => set({ entries: [] }),
    }),
    { name: "generative-ui-history" }
  )
);
