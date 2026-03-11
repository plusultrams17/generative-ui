"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeTokens = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
  accentColor: string;
  spacing: string;
};

export const DEFAULT_TOKENS: ThemeTokens = {
  primaryColor: "#2563eb",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  borderRadius: "0.5rem",
  fontFamily: "system-ui, sans-serif",
  accentColor: "#7c3aed",
  spacing: "1rem",
};

export type ThemePreset = {
  name: string;
  tokens: ThemeTokens;
};

export const BUILT_IN_PRESETS: ThemePreset[] = [
  {
    name: "デフォルト",
    tokens: { ...DEFAULT_TOKENS },
  },
  {
    name: "ダーク",
    tokens: {
      primaryColor: "#2563eb",
      backgroundColor: "#0f172a",
      textColor: "#f1f5f9",
      borderRadius: "0.5rem",
      fontFamily: "system-ui, sans-serif",
      accentColor: "#7c3aed",
      spacing: "1rem",
    },
  },
  {
    name: "ウォーム",
    tokens: {
      primaryColor: "#d97706",
      backgroundColor: "#fffbeb",
      textColor: "#78350f",
      borderRadius: "0.75rem",
      fontFamily: "Georgia, serif",
      accentColor: "#b45309",
      spacing: "1rem",
    },
  },
  {
    name: "モノクロ",
    tokens: {
      primaryColor: "#374151",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      borderRadius: "0.25rem",
      fontFamily: "system-ui, sans-serif",
      accentColor: "#6b7280",
      spacing: "1rem",
    },
  },
  {
    name: "ネオン",
    tokens: {
      primaryColor: "#06b6d4",
      backgroundColor: "#0c0a09",
      textColor: "#e7e5e4",
      borderRadius: "0.5rem",
      fontFamily: "system-ui, sans-serif",
      accentColor: "#22c55e",
      spacing: "1rem",
    },
  },
];

type ThemeCustomState = {
  tokens: ThemeTokens;
  presets: ThemePreset[];
  setToken: <K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => void;
  setTokens: (tokens: Partial<ThemeTokens>) => void;
  resetTokens: () => void;
  applyPreset: (presetName: string) => void;
};

export const useThemeCustomStore = create<ThemeCustomState>()(
  persist(
    (set, get) => ({
      tokens: { ...DEFAULT_TOKENS },
      presets: BUILT_IN_PRESETS,
      setToken: (key, value) =>
        set((state) => ({
          tokens: { ...state.tokens, [key]: value },
        })),
      setTokens: (partial) =>
        set((state) => ({
          tokens: { ...state.tokens, ...partial },
        })),
      resetTokens: () => set({ tokens: { ...DEFAULT_TOKENS } }),
      applyPreset: (presetName) => {
        const preset = get().presets.find((p) => p.name === presetName);
        if (preset) {
          set({ tokens: { ...preset.tokens } });
        }
      },
    }),
    { name: "generative-ui-theme-custom" }
  )
);
