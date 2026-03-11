"use client";

import { useEffect, useRef } from "react";

export type ShortcutDefinition = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  description: string;
  category: string;
  action: () => void;
};

export function useKeyboardShortcuts(shortcuts: ShortcutDefinition[]) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const modifier = e.ctrlKey || e.metaKey;

      for (const shortcut of shortcutsRef.current) {
        const keyMatch = e.key === shortcut.key || e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? modifier : !modifier;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;

        if (keyMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
