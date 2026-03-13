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
  addShareAsync: (
    toolName: string,
    toolData: Record<string, unknown>
  ) => Promise<string>;
  getShare: (id: string) => SharedUI | undefined;
  fetchShare: (id: string) => Promise<SharedUI | null>;
};

export const useShareStore = create<ShareStore>()(
  persist(
    (set, get) => ({
      shares: [],

      // Synchronous add (localStorage fallback)
      addShare: (toolName, toolData) => {
        const id = crypto.randomUUID();
        const share: SharedUI = {
          id,
          toolName,
          toolData,
          createdAt: Date.now(),
        };
        set((state) => ({
          shares: [share, ...state.shares].slice(0, 200),
        }));

        // Also save to server in background
        fetch("/api/shared-uis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolName, toolData }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.id && data.id !== id) {
              // Update local with server-generated ID
              set((state) => ({
                shares: state.shares.map((s) =>
                  s.id === id ? { ...s, id: data.id } : s
                ),
              }));
            }
          })
          .catch(() => {});

        return id;
      },

      // Async add (returns server ID)
      addShareAsync: async (toolName, toolData) => {
        try {
          const res = await fetch("/api/shared-uis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ toolName, toolData }),
          });
          const data = await res.json();
          if (data.id) {
            const share: SharedUI = {
              id: data.id,
              toolName,
              toolData,
              createdAt: Date.now(),
            };
            set((state) => ({
              shares: [share, ...state.shares].slice(0, 200),
            }));
            return data.id;
          }
        } catch {
          // Fallback to local
        }
        return get().addShare(toolName, toolData);
      },

      getShare: (id) => get().shares.find((s) => s.id === id),

      // Fetch from server if not in local store
      fetchShare: async (id) => {
        const local = get().getShare(id);
        if (local) return local;

        try {
          const res = await fetch(`/api/shared-uis?id=${id}`);
          if (!res.ok) return null;
          const data = await res.json();
          if (data) {
            const share: SharedUI = {
              id: data.id,
              toolName: data.tool_name,
              toolData: data.tool_data,
              createdAt: new Date(data.created_at).getTime(),
            };
            // Cache locally
            set((state) => ({
              shares: [share, ...state.shares].slice(0, 200),
            }));
            return share;
          }
        } catch {
          // Offline
        }
        return null;
      },
    }),
    { name: "generative-ui-shares" }
  )
);
