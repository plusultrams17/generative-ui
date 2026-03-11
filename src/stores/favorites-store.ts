"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FavoriteEntry = {
  historyEntryId: string;
  tags: string[];
  note?: string;
  favoritedAt: number;
};

type FavoritesState = {
  favorites: FavoriteEntry[];
  allTags: string[];
  toggleFavorite: (historyEntryId: string) => void;
  isFavorite: (historyEntryId: string) => boolean;
  addTag: (historyEntryId: string, tag: string) => void;
  removeTag: (historyEntryId: string, tag: string) => void;
  setNote: (historyEntryId: string, note: string) => void;
  getFavorite: (historyEntryId: string) => FavoriteEntry | undefined;
  getFavoriteEntries: () => FavoriteEntry[];
};

function computeAllTags(favorites: FavoriteEntry[]): string[] {
  const tagSet = new Set<string>();
  for (const fav of favorites) {
    for (const tag of fav.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet);
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      allTags: [],
      toggleFavorite: (historyEntryId) =>
        set((state) => {
          const exists = state.favorites.some(
            (f) => f.historyEntryId === historyEntryId
          );
          const newFavorites = exists
            ? state.favorites.filter(
                (f) => f.historyEntryId !== historyEntryId
              )
            : [
                ...state.favorites,
                {
                  historyEntryId,
                  tags: [],
                  favoritedAt: Date.now(),
                },
              ];
          return {
            favorites: newFavorites,
            allTags: computeAllTags(newFavorites),
          };
        }),
      isFavorite: (historyEntryId) =>
        get().favorites.some((f) => f.historyEntryId === historyEntryId),
      addTag: (historyEntryId, tag) =>
        set((state) => {
          const trimmed = tag.trim();
          if (!trimmed) return state;
          const newFavorites = state.favorites.map((f) =>
            f.historyEntryId === historyEntryId && !f.tags.includes(trimmed)
              ? { ...f, tags: [...f.tags, trimmed] }
              : f
          );
          return {
            favorites: newFavorites,
            allTags: computeAllTags(newFavorites),
          };
        }),
      removeTag: (historyEntryId, tag) =>
        set((state) => {
          const newFavorites = state.favorites.map((f) =>
            f.historyEntryId === historyEntryId
              ? { ...f, tags: f.tags.filter((t) => t !== tag) }
              : f
          );
          return {
            favorites: newFavorites,
            allTags: computeAllTags(newFavorites),
          };
        }),
      setNote: (historyEntryId, note) =>
        set((state) => ({
          favorites: state.favorites.map((f) =>
            f.historyEntryId === historyEntryId ? { ...f, note } : f
          ),
        })),
      getFavorite: (historyEntryId) =>
        get().favorites.find((f) => f.historyEntryId === historyEntryId),
      getFavoriteEntries: () => get().favorites,
    }),
    { name: "generative-ui-favorites" }
  )
);
