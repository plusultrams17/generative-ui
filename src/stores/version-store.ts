"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ComponentVersion = {
  id: string;
  componentId: string;
  version: number;
  timestamp: number;
  prompt: string;
  toolName: string;
  toolData: Record<string, unknown>;
  code?: string;
};

type VersionState = {
  versions: ComponentVersion[];
  addVersion: (
    componentId: string,
    prompt: string,
    toolName: string,
    toolData: Record<string, unknown>,
    code?: string
  ) => ComponentVersion;
  getVersions: (componentId: string) => ComponentVersion[];
  getLatestVersion: (componentId: string) => ComponentVersion | undefined;
  rollbackTo: (versionId: string) => ComponentVersion | undefined;
  clearVersions: (componentId: string) => void;
};

const MAX_VERSIONS_PER_COMPONENT = 50;
const MAX_TOTAL_VERSIONS = 500;

export const useVersionStore = create<VersionState>()(
  persist(
    (set, get) => ({
      versions: [],
      addVersion: (componentId, prompt, toolName, toolData, code) => {
        const existing = get().versions.filter(
          (v) => v.componentId === componentId
        );
        const nextVersion =
          existing.length > 0
            ? Math.max(...existing.map((v) => v.version)) + 1
            : 1;

        const newVersion: ComponentVersion = {
          id: crypto.randomUUID(),
          componentId,
          version: nextVersion,
          timestamp: Date.now(),
          prompt,
          toolName,
          toolData,
          code,
        };

        set((state) => {
          const componentVersions = state.versions.filter(
            (v) => v.componentId === componentId
          );
          const otherVersions = state.versions.filter(
            (v) => v.componentId !== componentId
          );

          const trimmedComponent = [
            ...componentVersions,
            newVersion,
          ].slice(-MAX_VERSIONS_PER_COMPONENT);

          return {
            versions: [...otherVersions, ...trimmedComponent].slice(
              -MAX_TOTAL_VERSIONS
            ),
          };
        });

        return newVersion;
      },
      getVersions: (componentId) =>
        get()
          .versions.filter((v) => v.componentId === componentId)
          .sort((a, b) => a.version - b.version),
      getLatestVersion: (componentId) => {
        const versions = get().versions.filter(
          (v) => v.componentId === componentId
        );
        if (versions.length === 0) return undefined;
        return versions.reduce((latest, v) =>
          v.version > latest.version ? v : latest
        );
      },
      rollbackTo: (versionId) =>
        get().versions.find((v) => v.id === versionId),
      clearVersions: (componentId) =>
        set((state) => ({
          versions: state.versions.filter(
            (v) => v.componentId !== componentId
          ),
        })),
    }),
    { name: "generative-ui-versions" }
  )
);
