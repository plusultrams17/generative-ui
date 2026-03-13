"use client";

import { create } from "zustand";

export type UpgradeTrigger =
  | "quota_exhausted"
  | "quota_warning"
  | "model_locked"
  | "general";

type UpgradeContext = {
  attemptedPrompt?: string;
  lockedModelName?: string;
  lockedModelDescription?: string;
  remaining?: number;
  limit?: number;
  used?: number;
};

type UpgradeState = {
  open: boolean;
  trigger: UpgradeTrigger;
  context: UpgradeContext;
  openUpgrade: (trigger: UpgradeTrigger, context?: UpgradeContext) => void;
  closeUpgrade: () => void;
};

export const useUpgradeStore = create<UpgradeState>((set) => ({
  open: false,
  trigger: "general",
  context: {},
  openUpgrade: (trigger, context = {}) => set({ open: true, trigger, context }),
  closeUpgrade: () => set({ open: false }),
}));
