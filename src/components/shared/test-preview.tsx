"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FlaskConical,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { HighlightedCode } from "@/components/shared/highlighted-code";
import type { GeneratedTests } from "@/lib/test-generator";

type TestPreviewProps = {
  tests: GeneratedTests;
};

type TabType = "playwright" | "rtl";

export function TestPreview({ tests }: TestPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("playwright");
  const [expandedTests, setExpandedTests] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  const currentTests = activeTab === "playwright" ? tests.playwright : tests.rtl;

  function toggleTest(index: number) {
    setExpandedTests((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function copyAllTests() {
    const allCode = currentTests.map((t) => t.code).join("\n\n");

    let header: string;
    if (activeTab === "playwright") {
      header = `import { test, expect } from '@playwright/test';\n\n`;
    } else {
      header = `import { render, screen, fireEvent } from '@testing-library/react';\nimport '@testing-library/jest-dom';\n\n`;
    }

    navigator.clipboard.writeText(header + allCode);
    setCopied(true);
    toast.success("全テストをコピーしました");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-3 max-h-[500px] overflow-y-auto rounded-lg border bg-background p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-semibold">テスト生成</h3>
        </div>
        <Button variant="outline" size="sm" onClick={copyAllTests}>
          {copied ? (
            <Check className="mr-1 h-3.5 w-3.5" />
          ) : (
            <Copy className="mr-1 h-3.5 w-3.5" />
          )}
          全テストをコピー
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
        <Button
          variant={activeTab === "playwright" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setActiveTab("playwright");
            setExpandedTests(new Set());
          }}
        >
          Playwright
          <Badge variant="secondary" className="ml-1.5 text-[10px]">
            {tests.playwright.length}
          </Badge>
        </Button>
        <Button
          variant={activeTab === "rtl" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setActiveTab("rtl");
            setExpandedTests(new Set());
          }}
        >
          React Testing Library
          <Badge variant="secondary" className="ml-1.5 text-[10px]">
            {tests.rtl.length}
          </Badge>
        </Button>
      </div>

      {/* Test cases */}
      <div className="space-y-2">
        {currentTests.map((testCase, index) => (
          <div key={index} className="rounded-md border">
            <button
              className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium hover:bg-muted/50"
              onClick={() => toggleTest(index)}
            >
              <span className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                  {index + 1}
                </span>
                {testCase.name}
              </span>
              {expandedTests.has(index) ? (
                <ChevronUp className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 shrink-0" />
              )}
            </button>
            {expandedTests.has(index) && (
              <div className="border-t px-1 py-1">
                <HighlightedCode
                  code={testCase.code}
                  showLineNumbers={false}
                  maxHeight="300px"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
