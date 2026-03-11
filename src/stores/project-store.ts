"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProjectStatus =
  | "proposal"
  | "in_progress"
  | "review"
  | "delivered"
  | "archived";

export type Project = {
  id: string;
  name: string;
  clientId: string;
  description?: string;
  status: ProjectStatus;
  deadline?: number;
  budget?: number;
  generationIds: string[];
  tags?: string[];
  createdAt: number;
  updatedAt: number;
};

const STATUS_ORDER: ProjectStatus[] = [
  "proposal",
  "in_progress",
  "review",
  "delivered",
  "archived",
];

type ProjectStore = {
  projects: Project[];
  addProject: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt" | "generationIds">
  ) => string;
  updateProject: (id: string, updates: Partial<Omit<Project, "id" | "createdAt">>) => void;
  removeProject: (id: string) => void;
  moveStatusForward: (id: string) => void;
  moveStatusBackward: (id: string) => void;
  getByClient: (clientId: string) => Project[];
  getByStatus: (status: ProjectStatus) => Project[];
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      addProject: (project) => {
        const id = crypto.randomUUID();
        set((state) => ({
          projects: [
            {
              ...project,
              id,
              generationIds: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...state.projects,
          ].slice(0, 100),
        }));
        return id;
      },
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        })),
      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        })),
      moveStatusForward: (id) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== id) return p;
            const idx = STATUS_ORDER.indexOf(p.status);
            if (idx < STATUS_ORDER.length - 1) {
              return {
                ...p,
                status: STATUS_ORDER[idx + 1],
                updatedAt: Date.now(),
              };
            }
            return p;
          }),
        })),
      moveStatusBackward: (id) =>
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== id) return p;
            const idx = STATUS_ORDER.indexOf(p.status);
            if (idx > 0) {
              return {
                ...p,
                status: STATUS_ORDER[idx - 1],
                updatedAt: Date.now(),
              };
            }
            return p;
          }),
        })),
      getByClient: (clientId) =>
        get().projects.filter((p) => p.clientId === clientId),
      getByStatus: (status) =>
        get().projects.filter((p) => p.status === status),
    }),
    { name: "generative-ui-projects" }
  )
);
