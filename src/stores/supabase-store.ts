"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type SupabaseConfig = {
  url: string;
  anonKey: string;
};

type TableMapping = {
  id: string;
  componentType: string;
  tableName: string;
  columns: { name: string; type: string; nullable: boolean }[];
  createdAt: number;
};

type SupabaseStore = {
  config: SupabaseConfig;
  setConfig: (config: Partial<SupabaseConfig>) => void;
  mappings: TableMapping[];
  addMapping: (mapping: Omit<TableMapping, "id" | "createdAt">) => TableMapping;
  removeMapping: (id: string) => void;
  getMappingsByType: (componentType: string) => TableMapping[];
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export const useSupabaseStore = create<SupabaseStore>()(
  persist(
    (set, get) => ({
      config: { url: "", anonKey: "" },

      setConfig: (partial) =>
        set((state) => ({
          config: { ...state.config, ...partial },
        })),

      mappings: [],

      addMapping: (mapping) => {
        const newMapping: TableMapping = {
          ...mapping,
          id: generateId(),
          createdAt: Date.now(),
        };
        set((state) => {
          const updated = [...state.mappings, newMapping];
          if (updated.length > 20) {
            return { mappings: updated.slice(-20) };
          }
          return { mappings: updated };
        });
        return newMapping;
      },

      removeMapping: (id) =>
        set((state) => ({
          mappings: state.mappings.filter((m) => m.id !== id),
        })),

      getMappingsByType: (componentType) =>
        get().mappings.filter((m) => m.componentType === componentType),
    }),
    { name: "generative-ui-supabase" }
  )
);
