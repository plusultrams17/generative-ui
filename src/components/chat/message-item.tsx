"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { ToolErrorBoundary } from "@/components/shared/error-boundary";
import {
  FormRenderer,
  TableRenderer,
  ChartRenderer,
  CustomComponentRenderer,
} from "./tool-renderers";
import { MarkdownContent } from "./markdown-content";
import { ExportMenu } from "@/components/shared/export-menu";
import { RefinementChips } from "./refinement-chips";
import { useHistoryStore } from "@/stores/history-store";
import { useFavoritesStore } from "@/stores/favorites-store";
import { User, Bot, Star } from "lucide-react";
import { toast } from "sonner";

type MessageItemProps = {
  message: UIMessage;
  userPrompt?: string;
  onSendMessage?: (message: string) => void;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const TOOL_RENDERERS: Record<string, React.ComponentType<any>> = {
  showForm: FormRenderer,
  showTable: TableRenderer,
  showChart: ChartRenderer,
  generateCustomComponent: CustomComponentRenderer,
};

function getToolName(part: any): string | null {
  if (part.toolName) return part.toolName;
  if (typeof part.type === "string" && part.type.startsWith("tool-")) {
    return part.type.slice(5);
  }
  return null;
}

function isToolPart(part: any): boolean {
  if (part.type === "dynamic-tool") return true;
  if (typeof part.type === "string" && part.type.startsWith("tool-")) return true;
  return false;
}

function getToolData(part: any): Record<string, unknown> | null {
  if (part.input && typeof part.input === "object") {
    return part.input as Record<string, unknown>;
  }
  if (part.output && typeof part.output === "object") {
    return part.output as Record<string, unknown>;
  }
  if (part.args && typeof part.args === "object") {
    return part.args as Record<string, unknown>;
  }
  return null;
}

function isToolLoading(part: any): boolean {
  return (
    part.state === "input-streaming" ||
    part.state === "partial-call" ||
    part.state === "submitted"
  );
}

function isToolComplete(part: any): boolean {
  return part.state === "result" || part.state === "complete";
}

function FavoriteButton({ toolName, title }: { toolName: string; title: string }) {
  const entries = useHistoryStore((s) => s.entries);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);

  // Find matching history entry by toolName and title
  const entry = entries.find(
    (e) => e.toolName === toolName && (e.toolData.title as string || "") === title
  );
  if (!entry) return null;

  const favorited = isFavorite(entry.id);

  return (
    <button
      onClick={() => {
        toggleFavorite(entry.id);
        toast.success(favorited ? "お気に入りから削除しました" : "お気に入りに追加しました");
      }}
      className="rounded-md p-1.5 transition-colors hover:bg-muted"
      title={favorited ? "お気に入りから削除" : "お気に入りに追加"}
    >
      <Star
        className={`h-4 w-4 ${
          favorited
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground"
        }`}
      />
    </button>
  );
}

export function MessageItem({ message, userPrompt, onSendMessage }: MessageItemProps) {
  const isUser = message.role === "user";
  const addEntry = useHistoryStore((s) => s.addEntry);
  const savedToolIds = useRef(new Set<string>());

  useEffect(() => {
    if (isUser) return;
    for (const part of message.parts) {
      if (!isToolPart(part)) continue;
      if (!isToolComplete(part)) continue;

      const toolName = getToolName(part);
      if (!toolName || !TOOL_RENDERERS[toolName]) continue;

      const data = getToolData(part);
      if (!data) continue;

      const toolKey = `${message.id}-${toolName}-${(data.title as string) || ""}`;
      if (savedToolIds.current.has(toolKey)) continue;
      savedToolIds.current.add(toolKey);

      addEntry({
        prompt: userPrompt || "",
        toolName,
        toolData: data,
      });
    }
  }, [message.parts, message.id, isUser, addEntry, userPrompt]);

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={`flex max-w-[85%] flex-col gap-3 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        {message.parts.map((part, index) => {
          if (part.type === "text" && part.text) {
            return (
              <div
                key={`text-${index}`}
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{part.text}</p>
                ) : (
                  <MarkdownContent content={part.text} />
                )}
              </div>
            );
          }

          if (part.type === "file" && isUser) {
            const filePart = part as any;
            const src = filePart.url || (filePart.data
              ? `data:${filePart.mediaType || "image/png"};base64,${filePart.data}`
              : null);
            if (!src) return null;
            return (
              <img
                key={`file-${index}`}
                src={src}
                alt="添付画像"
                className="max-h-48 rounded-lg border"
              />
            );
          }

          if (isToolPart(part)) {
            const toolName = getToolName(part);
            if (!toolName) return null;

            const Renderer = TOOL_RENDERERS[toolName];
            if (!Renderer) return null;

            if (isToolLoading(part)) {
              return <LoadingSkeleton key={`tool-${index}`} />;
            }

            const data = getToolData(part);
            if (!data) {
              return <LoadingSkeleton key={`tool-${index}`} />;
            }

            return (
              <div key={`tool-${index}`} className="w-full space-y-2">
                <div className="relative group">
                  <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <FavoriteButton toolName={toolName} title={(data.title as string) || ""} />
                    <ExportMenu data={data} componentType={toolName} />
                  </div>
                  <ToolErrorBoundary>
                    <Renderer
                      {...data}
                      {...(toolName === "generateCustomComponent"
                        ? { userPrompt: userPrompt || "" }
                        : {})}
                    />
                  </ToolErrorBoundary>
                </div>
                {onSendMessage && (
                  <RefinementChips
                    toolName={toolName}
                    onRefine={onSendMessage}
                  />
                )}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
