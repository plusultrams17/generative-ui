"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SharedUI = {
  id: string;
  toolName: string;
  toolData: Record<string, unknown>;
  createdAt: number;
};

type ShareStore = {
  shares: SharedUI[];
  addShare: (toolName: string, toolData: Record<string, unknown>) => string;
  getShare: (id: string) => SharedUI | undefined;
};

export const useShareStore = create<ShareStore>()(
  persist(
    (set, get) => ({
      shares: [],
      addShare: (toolName, toolData) => {
        const id = crypto.randomUUID();
        set((state) => ({
          shares: [
            { id, toolName, toolData, createdAt: Date.now() },
            ...state.shares,
          ].slice(0, 200),
        }));
        return id;
      },
      getShare: (id) => get().shares.find((s) => s.id === id),
    }),
    { name: "generative-ui-shares" }
  )
);
