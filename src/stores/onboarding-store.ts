"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type OnboardingState = {
  completed: boolean;
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  complete: () => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      currentStep: 0,
      setStep: (step) => set({ currentStep: step }),
      nextStep: () =>
        set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        })),
      complete: () => set({ completed: true, currentStep: 0 }),
      reset: () => set({ completed: false, currentStep: 0 }),
    }),
    { name: "generative-ui-onboarding" }
  )
);
