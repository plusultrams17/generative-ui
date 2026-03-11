"use client";

import type { UIMessage } from "ai";
import { MessageItem } from "./message-item";
import { StreamingIndicator } from "@/components/shared/streaming-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useMemo } from "react";
import { Sparkles, FormInput, Table2, BarChart3, Palette } from "lucide-react";

type MessageListProps = {
  messages: UIMessage[];
  isLoading: boolean;
  status?: string;
  onPromptClick?: (prompt: string) => void;
  onSendMessage?: (message: string) => void;
};

const SAMPLE_PROMPTS = [
  {
    icon: FormInput,
    label: "フォーム",
    prompt: "ユーザー登録フォームを作って（名前、メール、パスワード、確認パスワード）",
  },
  {
    icon: Table2,
    label: "テーブル",
    prompt: "社員一覧のテーブルを作って（名前、部署、役職、入社年）",
  },
  {
    icon: BarChart3,
    label: "チャート",
    prompt: "2024年の月別売上データを棒グラフで表示して",
  },
  {
    icon: Palette,
    label: "カスタム",
    prompt: "モダンなプロフィールカードを作って（アバター、名前、肩書き、SNSリンク付き）",
  },
];

export function MessageList({ messages, isLoading, status, onPromptClick, onSendMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto max-w-3xl space-y-6 p-4 pb-8">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-6 pt-16 text-center">
            <div className="rounded-full bg-primary/10 p-5">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">生成UI アシスタント</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                作りたいUIを自然言語で説明してください。フォーム、テーブル、チャート、カスタムコンポーネントをリアルタイムで生成します。
              </p>
            </div>
            <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
              {SAMPLE_PROMPTS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => onPromptClick?.(item.prompt)}
                  className="group flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/50 hover:shadow-md hover:shadow-primary/5"
                >
                  <div className="rounded-lg bg-muted p-2 transition-colors group-hover:bg-primary/10">
                    <item.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {item.prompt}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, idx) => {
          let userPrompt: string | undefined;
          if (message.role === "assistant") {
            for (let i = idx - 1; i >= 0; i--) {
              if (messages[i].role === "user") {
                userPrompt = messages[i].parts.find((p) => p.type === "text")?.text || "";
                break;
              }
            }
          }
          return (
            <MessageItem
              key={message.id}
              message={message}
              userPrompt={userPrompt}
              onSendMessage={onSendMessage}
            />
          );
        })}

        {isLoading && (
          <StreamingIndicator status={status} messages={messages} />
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
