"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Wand2 } from "lucide-react";
import { useRef, useState, useEffect, forwardRef, useImperativeHandle, type KeyboardEvent } from "react";
import { getSuggestions, enhancePrompt, type PromptSuggestion } from "@/lib/prompt-suggestions";
import { ImageUpload, useImageDrop } from "./image-upload";

type ChatInputProps = {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSendWithImage?: (text: string, file: File) => void;
  isLoading: boolean;
};

export type ChatInputHandle = {
  focus: () => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  form: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  table: "bg-green-500/10 text-green-600 dark:text-green-400",
  chart: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  custom: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput({
  input,
  onInputChange,
  onSend,
  onSendWithImage,
  isLoading,
}, ref) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
  }));
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([]);
  const [showEnhance, setShowEnhance] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { isDragging, handlePaste, dragProps } = useImageDrop(setSelectedImage);

  // Listen for paste events on the container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("paste", handlePaste);
    return () => el.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed.length >= 2) {
      setSuggestions(getSuggestions(trimmed));
      setShowEnhance(trimmed.length >= 5);
    } else {
      setSuggestions([]);
      setShowEnhance(false);
    }
  }, [input]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        handleSubmit();
      }
    }
  }

  function handleSubmit() {
    if (selectedImage && onSendWithImage) {
      onSendWithImage(input.trim(), selectedImage);
      setSelectedImage(null);
      return;
    }
    if (input.trim()) {
      onSend();
    }
  }

  function handleSuggestionClick(text: string) {
    onInputChange(text);
    setSuggestions([]);
    textareaRef.current?.focus();
  }

  function handleEnhance() {
    const enhanced = enhancePrompt(input);
    if (enhanced !== input) {
      onInputChange(enhanced);
    }
  }

  const canSend = !isLoading && (!!input.trim() || !!selectedImage);

  return (
    <div className="border-t bg-background" ref={containerRef} {...dragProps}>
      {suggestions.length > 0 && !isLoading && (
        <div className="mx-auto max-w-3xl px-4 pt-2">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s.text}
                onClick={() => handleSuggestionClick(s.text)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all hover:opacity-80 ${CATEGORY_COLORS[s.category] || "bg-muted"}`}
              >
                {s.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {isDragging && (
        <div className="mx-auto max-w-3xl px-4 pt-2">
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 py-3 text-sm text-muted-foreground">
            ドラッグ&ドロップで画像を添付
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-2">
          {selectedImage && (
            <div className="flex items-center gap-2">
              <ImageUpload
                onImageSelect={setSelectedImage}
                selectedImage={selectedImage}
                onRemove={() => setSelectedImage(null)}
                disabled={isLoading}
              />
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {selectedImage.name}
              </span>
            </div>
          )}
          <div className="flex items-end gap-2">
            {!selectedImage && (
              <ImageUpload
                onImageSelect={setSelectedImage}
                selectedImage={null}
                onRemove={() => {}}
                disabled={isLoading}
              />
            )}
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedImage ? "画像について説明を追加（任意）..." : "UIを作りたい内容を入力してください..."}
                className="min-h-[44px] max-h-[200px] resize-none pr-10"
                rows={1}
                disabled={isLoading}
              />
              {showEnhance && !isLoading && (
                <button
                  onClick={handleEnhance}
                  className="absolute bottom-2 right-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                  title="プロンプトを強化"
                >
                  <Wand2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!canSend}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
