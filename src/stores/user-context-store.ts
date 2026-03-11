"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserContext } from "@/types/context";
import { defaultUserContext } from "@/types/context";

type UserContextStore = {
  context: UserContext;
  trackAction: (action: string) => void;
  trackError: () => void;
  incrementSession: () => void;
  setDeviceInfo: (width: number) => void;
};

export const useUserContextStore = create<UserContextStore>()(
  persist(
    (set, get) => ({
      context: defaultUserContext,
      trackAction: (action) =>
        set((state) => {
          const actions = [...state.context.frequentActions, action].slice(-50);
          const sessionCount = state.context.sessionCount;
          const skillLevel =
            sessionCount > 20
              ? "advanced"
              : sessionCount > 5
                ? "intermediate"
                : "beginner";
          return {
            context: {
              ...state.context,
              frequentActions: actions,
              skillLevel,
            },
          };
        }),
      trackError: () =>
        set((state) => ({
          context: {
            ...state.context,
            recentErrors: state.context.recentErrors + 1,
          },
        })),
      incrementSession: () =>
        set((state) => ({
          context: {
            ...state.context,
            sessionCount: state.context.sessionCount + 1,
            recentErrors: 0,
          },
        })),
      setDeviceInfo: (width) =>
        set((state) => ({
          context: {
            ...state.context,
            screenWidth: width,
            deviceType:
              width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop",
          },
        })),
    }),
    { name: "generative-ui-context" }
  )
);
