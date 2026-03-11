"use client";

import { create } from "zustand";
import type { CollabUser } from "@/lib/collab-channel";

type CollabStore = {
  users: Record<string, CollabUser>;
  myUser: CollabUser | null;
  isConnected: boolean;
  addUser: (user: CollabUser) => void;
  removeUser: (userId: string) => void;
  updateUser: (user: CollabUser) => void;
  setMyUser: (user: CollabUser | null) => void;
  setConnected: (connected: boolean) => void;
  cleanStale: () => void;
};

const STALE_THRESHOLD = 30_000;

export const useCollabStore = create<CollabStore>()((set) => ({
  users: {},
  myUser: null,
  isConnected: false,

  addUser: (user) =>
    set((state) => ({
      users: { ...state.users, [user.id]: user },
    })),

  removeUser: (userId) =>
    set((state) => {
      const { [userId]: _, ...rest } = state.users;
      return { users: rest };
    }),

  updateUser: (user) =>
    set((state) => ({
      users: { ...state.users, [user.id]: user },
    })),

  setMyUser: (user) => set({ myUser: user }),

  setConnected: (connected) => set({ isConnected: connected }),

  cleanStale: () =>
    set((state) => {
      const now = Date.now();
      const fresh: Record<string, CollabUser> = {};
      for (const [id, user] of Object.entries(state.users)) {
        if (now - user.lastSeen < STALE_THRESHOLD) {
          fresh[id] = user;
        }
      }
      return { users: fresh };
    }),
}));
