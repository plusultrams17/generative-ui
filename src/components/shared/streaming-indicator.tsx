"use client";

import type { UIMessage } from "ai";
import { GenerationProgress } from "./generation-progress";

type StreamingIndicatorProps = {
  status?: string;
  messages?: UIMessage[];
};

export function StreamingIndicator({ status, messages }: StreamingIndicatorProps) {
  if (status && messages) {
    return <GenerationProgress status={status} messages={messages} />;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
      </div>
      <span>UIを生成中...</span>
    </div>
  );
}
