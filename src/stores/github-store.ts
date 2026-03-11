"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GitHubRepo = {
  id: string;
  repoUrl: string;
  repoName: string;
  timestamp: number;
};

type GitHubState = {
  githubToken: string;
  setGithubToken: (token: string) => void;
  recentRepos: GitHubRepo[];
  addRepo: (repoName: string, repoUrl: string) => void;
};

export const useGitHubStore = create<GitHubState>()(
  persist(
    (set) => ({
      githubToken: "",
      setGithubToken: (token) => set({ githubToken: token }),
      recentRepos: [],
      addRepo: (repoName, repoUrl) => {
        const id = crypto.randomUUID();
        set((state) => ({
          recentRepos: [
            { id, repoName, repoUrl, timestamp: Date.now() },
            ...state.recentRepos,
          ].slice(0, 20),
        }));
      },
    }),
    {
      name: "generative-ui-github",
      partialize: (state) => {
        const { githubToken, ...rest } = state;
        return rest;
      },
    }
  )
);
