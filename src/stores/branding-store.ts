"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BrandingConfig = {
  id: string;
  projectId: string;
  companyName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  footerText?: string;
  createdAt: number;
  updatedAt: number;
};

type BrandingState = {
  configs: BrandingConfig[];
  addConfig: (
    config: Omit<BrandingConfig, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateConfig: (id: string, updates: Partial<BrandingConfig>) => void;
  deleteConfig: (id: string) => void;
  getConfigByProjectId: (projectId: string) => BrandingConfig | undefined;
};

export const useBrandingStore = create<BrandingState>()(
  persist(
    (set, get) => ({
      configs: [],
      addConfig: (config) => {
        set((state) => {
          // projectIdはユニーク — 既存があれば上書き
          const filtered = state.configs.filter(
            (c) => c.projectId !== config.projectId
          );
          return {
            configs: [
              {
                ...config,
                id: crypto.randomUUID(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
              ...filtered,
            ].slice(0, 100),
          };
        });
      },
      updateConfig: (id, updates) =>
        set((state) => ({
          configs: state.configs.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        })),
      deleteConfig: (id) =>
        set((state) => ({
          configs: state.configs.filter((c) => c.id !== id),
        })),
      getConfigByProjectId: (projectId) =>
        get().configs.find((c) => c.projectId === projectId),
    }),
    { name: "generative-ui-branding" }
  )
);
