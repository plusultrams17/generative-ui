"use client";

import { create } from "zustand";
import type { HistoryEntry } from "./history-store";

export type ComposerItem = {
  id: string;
  historyEntryId: string;
  toolName: string;
  toolData: Record<string, unknown>;
  title: string;
  order: number;
};

type ComposerState = {
  items: ComposerItem[];
  addItem: (entry: HistoryEntry) => void;
  removeItem: (id: string) => void;
  moveItem: (id: string, direction: "up" | "down") => void;
  clearItems: () => void;
  isInComposer: (historyEntryId: string) => boolean;
};

export const useComposerStore = create<ComposerState>()((set, get) => ({
  items: [],
  addItem: (entry) =>
    set((state) => {
      if (state.items.some((item) => item.historyEntryId === entry.id)) {
        return state;
      }
      const title =
        (entry.toolData.title as string) || entry.prompt.slice(0, 40);
      return {
        items: [
          ...state.items,
          {
            id: crypto.randomUUID(),
            historyEntryId: entry.id,
            toolName: entry.toolName,
            toolData: entry.toolData,
            title,
            order: state.items.length,
          },
        ],
      };
    }),
  removeItem: (id) =>
    set((state) => ({
      items: state.items
        .filter((item) => item.id !== id)
        .map((item, i) => ({ ...item, order: i })),
    })),
  moveItem: (id, direction) =>
    set((state) => {
      const idx = state.items.findIndex((item) => item.id === id);
      if (idx === -1) return state;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= state.items.length) return state;
      const newItems = [...state.items];
      [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
      return {
        items: newItems.map((item, i) => ({ ...item, order: i })),
      };
    }),
  clearItems: () => set({ items: [] }),
  isInComposer: (historyEntryId) =>
    get().items.some((item) => item.historyEntryId === historyEntryId),
}));
