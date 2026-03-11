"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { HighlightedCode } from "@/components/shared/highlighted-code";
import { type StorybookResult } from "@/lib/storybook-generator";

type StorybookPreviewProps = {
  result: StorybookResult;
};

type TabType = "stories" | "mdx" | "fullcode";

export function StorybookPreview({ result }: StorybookPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("stories");
  const [expandedStories, setExpandedStories] = useState<Set<number>>(
    new Set()
  );
  const [copied, setCopied] = useState(false);

  function toggleStory(index: number) {
    setExpandedStories((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function handleCopy() {
    let text: string;
    if (activeTab === "stories") {
      text = result.stories.map((s) => s.code).join("\n\n");
    } else if (activeTab === "mdx") {
      text = result.mdxDoc;
    } else {
      text = result.fullCode;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("コピーしました");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-3 max-h-[500px] overflow-y-auto rounded-lg border bg-muted/30 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Storybook</h3>
          <Badge variant="secondary" className="text-[10px]">
            {result.meta.title}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="mr-1 h-3.5 w-3.5" />
          ) : (
            <Copy className="mr-1 h-3.5 w-3.5" />
          )}
          コピー
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-3 flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
        <Button
          variant={activeTab === "stories" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("stories")}
        >
          Stories
          <Badge variant="secondary" className="ml-1.5 text-[10px]">
            {result.stories.length}
          </Badge>
        </Button>
        <Button
          variant={activeTab === "mdx" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("mdx")}
        >
          MDX Docs
        </Button>
        <Button
          variant={activeTab === "fullcode" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("fullcode")}
        >
          Full Code
        </Button>
      </div>

      {/* Content */}
      {activeTab === "stories" && (
        <div className="space-y-2">
          {result.stories.map((story, index) => (
            <div key={index} className="rounded-md border">
              <button
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium hover:bg-muted/50"
                onClick={() => toggleStory(index)}
              >
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                    {index + 1}
                  </span>
                  {story.name}
                  {Object.keys(story.args).length > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-normal"
                    >
                      {Object.keys(story.args).length} args
                    </Badge>
                  )}
                </span>
                {expandedStories.has(index) ? (
                  <ChevronUp className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                )}
              </button>
              {expandedStories.has(index) && (
                <div className="border-t">
                  {Object.keys(story.args).length > 0 && (
                    <div className="border-b px-3 py-2">
                      <p className="mb-1 text-[10px] font-medium text-muted-foreground">
                        Args:
                      </p>
                      <pre className="text-[11px] text-muted-foreground">
                        {JSON.stringify(story.args, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className="px-1 py-1">
                    <HighlightedCode
                      code={story.code}
                      showLineNumbers={false}
                      maxHeight="300px"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "mdx" && (
        <HighlightedCode code={result.mdxDoc} maxHeight="400px" />
      )}

      {activeTab === "fullcode" && (
        <HighlightedCode code={result.fullCode} maxHeight="400px" />
      )}
    </div>
  );
}
