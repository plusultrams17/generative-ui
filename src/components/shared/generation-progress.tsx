"use client";

import { useEffect, useState } from "react";
import type { UIMessage } from "ai";
import { Loader2, Brain, Palette, Code, CheckCircle2 } from "lucide-react";

type GenerationProgressProps = {
  status: string;
  messages: UIMessage[];
};

type Step = {
  id: string;
  label: string;
  icon: typeof Brain;
  status: "pending" | "active" | "done";
};

function detectCurrentStep(
  status: string,
  messages: UIMessage[]
): Step[] {
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const hasText = lastAssistant?.parts.some(
    (p: any) => p.type === "text" && p.text
  );
  const hasToolLoading = lastAssistant?.parts.some(
    (p: any) =>
      (p.type === "dynamic-tool" ||
        (typeof p.type === "string" && p.type.startsWith("tool-"))) &&
      (p.state === "input-streaming" ||
        p.state === "partial-call" ||
        p.state === "submitted")
  );
  const hasToolDone = lastAssistant?.parts.some(
    (p: any) =>
      (p.type === "dynamic-tool" ||
        (typeof p.type === "string" && p.type.startsWith("tool-"))) &&
      (p.state === "result" || p.state === "complete")
  );

  const isStreaming = status === "streaming";
  const isSubmitted = status === "submitted";

  const steps: Step[] = [
    {
      id: "analyze",
      label: "リクエストを分析中",
      icon: Brain,
      status:
        isSubmitted && !hasText && !hasToolLoading
          ? "active"
          : hasText || hasToolLoading || hasToolDone
            ? "done"
            : "pending",
    },
    {
      id: "design",
      label: "UIデザインを設計中",
      icon: Palette,
      status:
        hasText && !hasToolLoading && !hasToolDone && isStreaming
          ? "active"
          : hasToolLoading || hasToolDone
            ? "done"
            : "pending",
    },
    {
      id: "generate",
      label: "コンポーネントを生成中",
      icon: Code,
      status: hasToolLoading
        ? "active"
        : hasToolDone
          ? "done"
          : "pending",
    },
    {
      id: "complete",
      label: "完了",
      icon: CheckCircle2,
      status: hasToolDone && !isStreaming ? "done" : "pending",
    },
  ];

  return steps;
}

export function GenerationProgress({
  status,
  messages,
}: GenerationProgressProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [elapsed, setElapsed] = useState(0);

  const isActive = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (isActive) {
      setSteps(detectCurrentStep(status, messages));
    }
  }, [status, messages, isActive]);

  useEffect(() => {
    if (!isActive) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive || steps.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">生成プロセス</p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {elapsed}秒
        </p>
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              step.status === "active"
                ? "bg-primary/10 text-primary"
                : step.status === "done"
                  ? "text-muted-foreground"
                  : "text-muted-foreground/40"
            }`}
          >
            {step.status === "active" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step.status === "done" ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <step.icon className="h-4 w-4" />
            )}
            <span
              className={
                step.status === "active" ? "font-medium" : ""
              }
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
