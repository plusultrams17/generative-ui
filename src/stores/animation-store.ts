"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AnimationPreset = {
  name: string;
  label: string;
  css: string;
  className: string;
};

export type AnimationConfig = {
  preset: string;
  duration: string;
  delay: string;
  easing: string;
  iterationCount: string;
};

export const DEFAULT_CONFIG: AnimationConfig = {
  preset: "none",
  duration: "0.5s",
  delay: "0s",
  easing: "ease-out",
  iterationCount: "1",
};

export const ANIMATION_PRESETS: AnimationPreset[] = [
  { name: "none", label: "なし", css: "", className: "" },
  {
    name: "fadeIn",
    label: "フェードイン",
    css: "@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }",
    className: "animate-fadeIn",
  },
  {
    name: "slideUp",
    label: "スライドアップ",
    css: "@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }",
    className: "animate-slideUp",
  },
  {
    name: "slideDown",
    label: "スライドダウン",
    css: "@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }",
    className: "animate-slideDown",
  },
  {
    name: "slideLeft",
    label: "スライドレフト",
    css: "@keyframes slideLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }",
    className: "animate-slideLeft",
  },
  {
    name: "scaleIn",
    label: "スケールイン",
    css: "@keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }",
    className: "animate-scaleIn",
  },
  {
    name: "bounce",
    label: "バウンス",
    css: "@keyframes bounce { 0%,20%,50%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }",
    className: "animate-bounce",
  },
  {
    name: "pulse",
    label: "パルス",
    css: "@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }",
    className: "animate-pulse",
  },
  {
    name: "shake",
    label: "シェイク",
    css: "@keyframes shake { 0%,100% { transform: translateX(0); } 10%,30%,50%,70%,90% { transform: translateX(-4px); } 20%,40%,60%,80% { transform: translateX(4px); } }",
    className: "animate-shake",
  },
];

type AnimationState = {
  config: AnimationConfig;
  setConfig: (config: Partial<AnimationConfig>) => void;
  resetConfig: () => void;
  getAnimationCSS: () => string;
};

export const useAnimationStore = create<AnimationState>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_CONFIG },
      setConfig: (partial) =>
        set((state) => ({
          config: { ...state.config, ...partial },
        })),
      resetConfig: () => set({ config: { ...DEFAULT_CONFIG } }),
      getAnimationCSS: () => {
        const { config } = get();
        if (config.preset === "none") return "";

        const preset = ANIMATION_PRESETS.find((p) => p.name === config.preset);
        if (!preset) return "";

        const iterationCount =
          config.iterationCount === "infinite" ? "infinite" : config.iterationCount;

        return `${preset.css}\n#root > * { animation: ${config.preset} ${config.duration} ${config.easing} ${config.delay} ${iterationCount} both; }`;
      },
    }),
    { name: "generative-ui-animation" }
  )
);
