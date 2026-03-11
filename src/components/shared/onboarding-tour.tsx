"use client";

import { useOnboardingStore } from "@/stores/onboarding-store";
import { useEffect, useState, useCallback } from "react";

type TourStep = {
  targetId: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
};

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "onboarding-welcome",
    title: "生成UIへようこそ！",
    description:
      "AIを使って、自然言語でUIコンポーネントを生成できます。このツアーで基本操作をご案内します。",
    position: "bottom",
  },
  {
    targetId: "onboarding-input",
    title: "チャット入力",
    description:
      "作りたいUIを日本語で説明してください。「ログインフォームを作って」のように入力するだけでOKです。",
    position: "top",
  },
  {
    targetId: "onboarding-templates",
    title: "テンプレート",
    description:
      "よく使うUIパターンのテンプレートから素早く始められます。",
    position: "bottom",
  },
  {
    targetId: "onboarding-model",
    title: "AIモデル選択",
    description:
      "GPT-4o、Claude、Geminiなど複数のAIモデルから選べます。",
    position: "bottom",
  },
  {
    targetId: "onboarding-gallery",
    title: "ギャラリー",
    description:
      "生成したUIの履歴を一覧で確認、再利用できます。",
    position: "bottom",
  },
  {
    targetId: "onboarding-settings",
    title: "設定",
    description:
      "APIトークンやプリファレンスを管理できます。デプロイやGitHub連携もここから設定します。",
    position: "bottom",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function OnboardingTour() {
  const { currentStep, nextStep, prevStep, setStep, complete } =
    useOnboardingStore();
  const [targetRect, setTargetRect] = useState<Rect | null>(null);

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  const measure = useCallback(() => {
    if (!step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      const r = el.getBoundingClientRect();
      setTargetRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    }
  }, [step]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  // Escape key to skip tour
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        complete();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        if (isLastStep) {
          complete();
        } else {
          nextStep();
        }
      } else if (e.key === "ArrowLeft") {
        if (!isFirstStep) {
          prevStep();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [complete, nextStep, prevStep, isLastStep, isFirstStep]);

  if (!step || !targetRect) return null;

  const padding = 6;
  const spotlightStyle: React.CSSProperties = {
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
  };

  const tooltipStyle = computeTooltipPosition(
    targetRect,
    step.position,
    padding
  );

  function handleNext() {
    if (isLastStep) {
      complete();
    } else {
      nextStep();
    }
  }

  function handlePrev() {
    if (!isFirstStep) {
      prevStep();
    }
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

      {/* Spotlight cutout */}
      <div style={spotlightStyle} />

      {/* Tooltip */}
      <div
        style={{
          position: "fixed",
          zIndex: 9999,
          ...tooltipStyle,
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            background: "var(--color-card, #fff)",
            color: "var(--color-card-foreground, #111)",
            borderRadius: 12,
            padding: "20px 24px",
            maxWidth: 340,
            minWidth: 260,
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h3
              style={{
                fontSize: 16,
                fontWeight: 700,
                margin: 0,
              }}
            >
              {step.title}
            </h3>
            <span
              style={{
                fontSize: 12,
                opacity: 0.5,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {currentStep + 1}/{TOUR_STEPS.length}
            </span>
          </div>

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              margin: "0 0 12px 0",
              opacity: 0.8,
            }}
          >
            {step.description}
          </p>

          {/* Step indicator dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginBottom: 16,
            }}
          >
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`ステップ ${i + 1}`}
                style={{
                  width: i === currentStep ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: "none",
                  background:
                    i === currentStep
                      ? "var(--color-primary, #2563eb)"
                      : i < currentStep
                        ? "var(--color-primary, #2563eb)"
                        : "rgba(128,128,128,0.3)",
                  opacity: i === currentStep ? 1 : i < currentStep ? 0.6 : 0.4,
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.2s ease",
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 8,
            }}
          >
            <button
              onClick={complete}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                opacity: 0.5,
                cursor: "pointer",
                fontSize: 13,
                padding: "4px 8px",
              }}
            >
              スキップ
            </button>
            <div style={{ display: "flex", gap: 6 }}>
              {!isFirstStep && (
                <button
                  onClick={handlePrev}
                  style={{
                    background: "rgba(128,128,128,0.15)",
                    color: "inherit",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  戻る
                </button>
              )}
              <button
                onClick={handleNext}
                style={{
                  background: "var(--color-primary, #2563eb)",
                  color: "var(--color-primary-foreground, #fff)",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {isLastStep ? "始めましょう！" : "次へ"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function computeTooltipPosition(
  rect: Rect,
  position: TourStep["position"],
  padding: number
): React.CSSProperties {
  const gap = 12;
  switch (position) {
    case "bottom":
      return {
        top: rect.top + rect.height + padding + gap,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
      };
    case "top":
      return {
        bottom:
          window.innerHeight - rect.top + padding + gap,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
      };
    case "left":
      return {
        top: rect.top + rect.height / 2,
        right:
          window.innerWidth - rect.left + padding + gap,
        transform: "translateY(-50%)",
      };
    case "right":
      return {
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width + padding + gap,
        transform: "translateY(-50%)",
      };
  }
}
