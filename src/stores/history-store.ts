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
  synced: boolean;
  addEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  syncFromServer: () => Promise<void>;
};

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      entries: [],
      synced: false,
      addEntry: (entry) => {
        const id = crypto.randomUUID();
        const timestamp = Date.now();
        const newEntry = { ...entry, id, timestamp };

        set((state) => ({
          entries: [newEntry, ...state.entries].slice(0, 200),
        }));

        // Save to server in background
        fetch("/api/generated-uis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: entry.prompt,
            toolName: entry.toolName,
            toolData: entry.toolData,
            title: (entry.toolData.title as string) || null,
          }),
        }).catch(() => {
          // Silently fail - localStorage is the fallback
        });
      },
      removeEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
        }));

        // Delete from server in background
        fetch(`/api/generated-uis?id=${id}`, { method: "DELETE" }).catch(
          () => {}
        );
      },
      clearHistory: () => set({ entries: [] }),
      syncFromServer: async () => {
        if (get().synced) return;
        try {
          const res = await fetch("/api/generated-uis");
          if (!res.ok) return;
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const serverEntries: HistoryEntry[] = data.map(
              (item: {
                id: string;
                created_at: string;
                prompt: string;
                tool_name: string;
                tool_data: Record<string, unknown>;
              }) => ({
                id: item.id,
                timestamp: new Date(item.created_at).getTime(),
                prompt: item.prompt,
                toolName: item.tool_name,
                toolData: item.tool_data,
              })
            );
            // Merge: server data takes priority, keep local entries not on server
            const serverIds = new Set(serverEntries.map((e) => e.id));
            const localOnly = get().entries.filter(
              (e) => !serverIds.has(e.id)
            );
            set({
              entries: [...serverEntries, ...localOnly].slice(0, 200),
              synced: true,
            });
          } else {
            set({ synced: true });
          }
        } catch {
          // Offline - use localStorage
        }
      },
    }),
    { name: "generative-ui-history" }
  )
);
