"use client";

import { useOnboardingStore } from "@/stores/onboarding-store";
import { useCallback, useEffect, useState } from "react";

export function OnboardingTour() {
  const { completed, complete } = useOnboardingStore();
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const measure = useCallback(() => {
    const el = document.getElementById("onboarding-input");
    if (el) {
      const r = el.getBoundingClientRect();
      setTargetRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    }
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        complete();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [complete]);

  if (completed || !targetRect) return null;

  const padding = 6;

  function handleStart() {
    complete();
    // Focus the chat input after closing
    setTimeout(() => {
      const input = document.querySelector<HTMLTextAreaElement>(
        "#onboarding-input textarea, #onboarding-input input"
      );
      input?.focus();
    }, 100);
  }

  return (
    <>
      {/* Full-screen click-blocker */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9997,
        }}
        aria-hidden="true"
      />

      {/* Spotlight on chat input */}
      <div
        style={{
          position: "fixed",
          top: targetRect.top - padding,
          left: targetRect.left - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
          borderRadius: 8,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
          zIndex: 9998,
          pointerEvents: "none",
          transition: "all 0.3s ease",
        }}
      />

      {/* Welcome tooltip above the input */}
      <div
        style={{
          position: "fixed",
          zIndex: 9999,
          bottom:
            window.innerHeight - targetRect.top + padding + 16,
          left: targetRect.left + targetRect.width / 2,
          transform: "translateX(-50%)",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            background: "var(--color-card, #fff)",
            color: "var(--color-card-foreground, #111)",
            borderRadius: 12,
            padding: "24px 28px",
            maxWidth: 380,
            minWidth: 280,
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              margin: "0 0 8px 0",
            }}
          >
            AIに話しかけてUIを作りましょう!
          </h3>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              margin: "0 0 20px 0",
              opacity: 0.7,
            }}
          >
            下の入力欄にプロンプトを入力してEnterキーを押してください
          </p>
          <button
            onClick={handleStart}
            style={{
              background: "var(--color-primary, #2563eb)",
              color: "var(--color-primary-foreground, #fff)",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            試してみる
          </button>
        </div>
      </div>
    </>
  );
}
