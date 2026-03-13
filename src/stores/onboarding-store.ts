"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type OnboardingState = {
  completed: boolean;
  firstGenerationDone: boolean;
  complete: () => void;
  markFirstGeneration: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      firstGenerationDone: false,
      complete: () => set({ completed: true }),
      markFirstGeneration: () => set({ firstGenerationDone: true }),
      reset: () => set({ completed: false, firstGenerationDone: false }),
    }),
    { name: "generative-ui-onboarding" }
  )
);
