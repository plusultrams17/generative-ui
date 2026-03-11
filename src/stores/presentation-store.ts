"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PresentationSlide = {
  id: string;
  type: "title" | "ui_preview" | "comparison" | "text";
  title?: string;
  description?: string;
  generationId?: string;
  beforeText?: string;
  content?: string;
};

export type Presentation = {
  id: string;
  projectId?: string;
  title: string;
  slides: PresentationSlide[];
  createdAt: number;
  updatedAt: number;
};

type PresentationState = {
  presentations: Presentation[];
  addPresentation: (
    p: Omit<Presentation, "id" | "createdAt" | "updatedAt">
  ) => string;
  updatePresentation: (id: string, updates: Partial<Presentation>) => void;
  deletePresentation: (id: string) => void;
  addSlide: (
    presentationId: string,
    slide: Omit<PresentationSlide, "id">
  ) => void;
  updateSlide: (
    presentationId: string,
    slideId: string,
    updates: Partial<PresentationSlide>
  ) => void;
  removeSlide: (presentationId: string, slideId: string) => void;
  moveSlide: (
    presentationId: string,
    slideId: string,
    direction: "up" | "down"
  ) => void;
};

export const usePresentationStore = create<PresentationState>()(
  persist(
    (set) => ({
      presentations: [],

      addPresentation: (p) => {
        const id = crypto.randomUUID();
        set((state) => ({
          presentations: [
            {
              ...p,
              id,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
            ...state.presentations,
          ].slice(0, 50),
        }));
        return id;
      },

      updatePresentation: (id, updates) =>
        set((state) => ({
          presentations: state.presentations.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
        })),

      deletePresentation: (id) =>
        set((state) => ({
          presentations: state.presentations.filter((p) => p.id !== id),
        })),

      addSlide: (presentationId, slide) =>
        set((state) => ({
          presentations: state.presentations.map((p) =>
            p.id === presentationId
              ? {
                  ...p,
                  slides: [
                    ...p.slides,
                    { ...slide, id: crypto.randomUUID() },
                  ],
                  updatedAt: Date.now(),
                }
              : p
          ),
        })),

      updateSlide: (presentationId, slideId, updates) =>
        set((state) => ({
          presentations: state.presentations.map((p) =>
            p.id === presentationId
              ? {
                  ...p,
                  slides: p.slides.map((s) =>
                    s.id === slideId ? { ...s, ...updates } : s
                  ),
                  updatedAt: Date.now(),
                }
              : p
          ),
        })),

      removeSlide: (presentationId, slideId) =>
        set((state) => ({
          presentations: state.presentations.map((p) =>
            p.id === presentationId
              ? {
                  ...p,
                  slides: p.slides.filter((s) => s.id !== slideId),
                  updatedAt: Date.now(),
                }
              : p
          ),
        })),

      moveSlide: (presentationId, slideId, direction) =>
        set((state) => ({
          presentations: state.presentations.map((p) => {
            if (p.id !== presentationId) return p;
            const idx = p.slides.findIndex((s) => s.id === slideId);
            if (idx === -1) return p;
            const newIdx = direction === "up" ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= p.slides.length) return p;
            const slides = [...p.slides];
            [slides[idx], slides[newIdx]] = [slides[newIdx], slides[idx]];
            return { ...p, slides, updatedAt: Date.now() };
          }),
        })),
    }),
    { name: "generative-ui-presentations" }
  )
);
