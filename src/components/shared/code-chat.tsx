"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Check, X } from "lucide-react";
import { toast } from "sonner";
import { applyTextPatch, type PatchResult, type PatchOperation } from "@/lib/code-patcher";

type CodeChatProps = {
  code: string;
  onApply: (newCode: string) => void;
  open: boolean;
  onClose: () => void;
};

type ChatMessage = {
  id: string;
  role: "user" | "system";
  content: string;
  patch?: PatchResult;
  applied?: boolean;
};

export function CodeChat({ code, onApply, open, onClose }: CodeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const patch = applyTextPatch(code, trimmed);

    const systemMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      role: "system",
      content: patch.summary,
      patch,
      applied: false,
    };

    setMessages((prev) => [...prev.slice(-8), userMsg, systemMsg]);
    setInput("");
  }, [input, code]);

  const handleApply = useCallback(
    (msgId: string, patchedCode: string) => {
      onApply(patchedCode);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
      );
      toast.success("パッチを適用しました");
    },
    [onApply]
  );

  const handleDismiss = useCallback((msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, applied: true } : m))
    );
    toast("パッチを却下しました");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />
      {/* Side panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-96 max-w-full flex-col border-l bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="font-semibold text-sm">コードチャット</span>
            <Badge variant="secondary" className="text-[10px]">
              ルールベース
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2">
              <MessageSquare className="h-8 w-8 opacity-30" />
              <p>コードの変更を自然言語で指示できます</p>
              <div className="text-xs space-y-1 text-center mt-2">
                <p>例: 「色を赤に変えて」</p>
                <p>例: 「パディングを大きくして」</p>
                <p>例: 「影を追加して」</p>
                <p>例: 「丸みを追加して」</p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-primary/10 rounded-lg p-3"
                    : "bg-muted rounded-lg p-3"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{msg.content}</p>

                    {msg.patch && msg.patch.operations.length > 0 && (
                      <div className="space-y-1.5">
                        {msg.patch.operations.map((op: PatchOperation, idx: number) => (
                          <div key={idx} className="font-mono text-xs space-y-0.5">
                            {op.original && (
                              <div className="bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded overflow-x-auto">
                                <span className="select-none opacity-50 mr-1">-</span>
                                {op.original.trim()}
                              </div>
                            )}
                            {op.replacement && (
                              <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded overflow-x-auto">
                                <span className="select-none opacity-50 mr-1">+</span>
                                {op.replacement.trim()}
                              </div>
                            )}
                          </div>
                        ))}

                        {!msg.applied && (
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 text-xs"
                              onClick={() => handleApply(msg.id, msg.patch!.patchedCode)}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              適用する
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => handleDismiss(msg.id)}
                            >
                              <X className="mr-1 h-3 w-3" />
                              却下
                            </Button>
                          </div>
                        )}

                        {msg.applied && (
                          <Badge variant="outline" className="text-[10px]">
                            <Check className="mr-1 h-3 w-3" />
                            処理済み
                          </Badge>
                        )}
                      </div>
                    )}

                    {msg.patch && msg.patch.operations.length === 0 && (
                      <p className="text-xs text-muted-foreground">{msg.patch.summary}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="変更を指示してください..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
