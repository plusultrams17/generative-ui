"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarStore = {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  toggleCollapse: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      isOpen: false,
      isCollapsed: false,
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      setOpen: (open) => set({ isOpen: open }),
      toggleCollapse: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    }),
    { name: "generative-ui-sidebar" }
  )
);
