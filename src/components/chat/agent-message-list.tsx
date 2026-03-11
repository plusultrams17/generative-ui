"use client";

import type { AgentMessage } from "@/stores/agent-store";
import { useApprovalStore, type AuditAction } from "@/stores/approval-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Wrench, Sparkles, ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";
import { useEffect, useRef } from "react";

type AgentMessageListProps = {
  messages: AgentMessage[];
  isStreaming: boolean;
};

type ToolCall = NonNullable<AgentMessage["toolCalls"]>[number];

const approvalBadgeConfig: Record<AuditAction, { label: string; className: string }> = {
  approved: { label: "承認済み", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  rejected: { label: "拒否", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  modified: { label: "修正承認", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  "auto-approved": { label: "自動承認", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  blocked: { label: "ブロック", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
};

function ApprovalBadge({ toolName }: { toolName: string }) {
  const auditLog = useApprovalStore((s) => s.auditLog);
  const entry = [...auditLog].reverse().find((e) => e.toolName === toolName);
  if (!entry) return null;

  const config = approvalBadgeConfig[entry.action];
  const Icon = entry.action === "rejected" || entry.action === "blocked"
    ? ShieldX
    : entry.action === "modified"
      ? ShieldAlert
      : ShieldCheck;

  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-0.5 border-0 ${config.className}`}>
      <Icon className="h-2.5 w-2.5" />
      {config.label}
    </Badge>
  );
}

function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  return (
    <div className="mt-2 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Wrench className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
          {toolCall.toolName}
        </span>
        <ApprovalBadge toolName={toolCall.toolName} />
      </div>
      {Object.keys(toolCall.args).length > 0 && (
        <pre className="mt-1 text-[11px] text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
          {JSON.stringify(toolCall.args, null, 2)}
        </pre>
      )}
      {toolCall.result !== undefined && (
        <div className="mt-2 border-t pt-2">
          <span className="text-[10px] font-medium text-muted-foreground">結果:</span>
          <pre className="mt-0.5 text-[11px] text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all">
            {typeof toolCall.result === "string"
              ? toolCall.result
              : JSON.stringify(toolCall.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function StreamingCursor() {
  return (
    <span className="inline-block w-2 h-4 bg-foreground/70 animate-pulse ml-0.5 align-text-bottom" />
  );
}

export function AgentMessageList({ messages, isStreaming }: AgentMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto max-w-3xl space-y-4 p-4 pb-8">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-6 pt-16 text-center">
            <div className="rounded-full bg-primary/10 p-5">
              <Bot className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">エージェントモード</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                AG-UIエージェントに直接メッセージを送信します。エージェントパネルで接続先を設定してください。
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isUser ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>

              {/* Content */}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  {msg.status === "streaming" && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      ストリーミング中
                    </Badge>
                  )}
                  {msg.status === "error" && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      エラー
                    </Badge>
                  )}
                  {msg.runId && (
                    <span className="text-[10px] opacity-50">
                      Run: {msg.runId.slice(0, 8)}
                    </span>
                  )}
                </div>

                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                  {msg.status === "streaming" && <StreamingCursor />}
                </p>

                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-2 mt-1">
                    {msg.toolCalls.map((tc, i) => (
                      <ToolCallCard key={`${msg.id}-tool-${i}`} toolCall={tc} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isStreaming && messages.length > 0 && messages[messages.length - 1]?.status !== "streaming" && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5">
              <Sparkles className="h-4 w-4 animate-pulse text-primary" />
              <span className="text-sm text-muted-foreground">エージェントが応答中...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
