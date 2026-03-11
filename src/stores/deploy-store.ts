"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DeployRecord = {
  id: string;
  url: string;
  projectName: string;
  timestamp: number;
  status: "building" | "ready" | "error";
};

type DeployState = {
  vercelToken: string;
  setVercelToken: (token: string) => void;
  recentDeploys: DeployRecord[];
  addDeploy: (deploy: Omit<DeployRecord, "id">) => string;
  updateDeployStatus: (id: string, status: DeployRecord["status"], url?: string) => void;
};

export const useDeployStore = create<DeployState>()(
  persist(
    (set) => ({
      vercelToken: "",
      setVercelToken: (token) => set({ vercelToken: token }),
      recentDeploys: [],
      addDeploy: (deploy) => {
        const id = crypto.randomUUID();
        set((state) => ({
          recentDeploys: [
            { ...deploy, id },
            ...state.recentDeploys,
          ].slice(0, 20),
        }));
        return id;
      },
      updateDeployStatus: (id, status, url) =>
        set((state) => ({
          recentDeploys: state.recentDeploys.map((d) =>
            d.id === id ? { ...d, status, ...(url ? { url } : {}) } : d
          ),
        })),
    }),
    {
      name: "generative-ui-deploy",
      partialize: (state) => {
        const { vercelToken, ...rest } = state;
        return rest;
      },
    }
  )
);
