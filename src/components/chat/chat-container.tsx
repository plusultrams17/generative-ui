"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageList } from "./message-list";
import { AgentMessageList } from "./agent-message-list";
import { ChatInput, type ChatInputHandle } from "./chat-input";
import { ModelSelector } from "./model-selector";
import { StyleSelector, type DesignStyle } from "./style-selector";
import { TemplateDrawer } from "./template-drawer";
import { HistoryPanel } from "./history-panel";
import { ShortcutsModal } from "@/components/shared/shortcuts-modal";
import { AgentPanel } from "@/components/shared/agent-panel";
import { OnboardingTour } from "@/components/shared/onboarding-tour";
import { InstallPrompt } from "@/components/shared/install-prompt";
import { useKeyboardShortcuts, type ShortcutDefinition } from "@/hooks/use-keyboard-shortcuts";
import { useUserContextStore } from "@/stores/user-context-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useAgentStore } from "@/stores/agent-store";
import { AGUIClient, type AGUIEvent } from "@/lib/ag-ui-protocol";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import { useApprovalStore } from "@/stores/approval-store";
import { useShallow } from "zustand/react/shallow";
import { ApprovalDialog } from "./approval-dialog";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Keyboard, Bot, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ChatContainer() {
  const searchParams = useSearchParams();
  const userContext = useUserContextStore((s) => s.context);
  const trackAction = useUserContextStore((s) => s.trackAction);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const contextRef = useRef(userContext);
  contextRef.current = userContext;

  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const modelRef = useRef(modelId);
  modelRef.current = modelId;

  const [designStyle, setDesignStyle] = useState<DesignStyle>("auto");
  const designStyleRef = useRef(designStyle);
  designStyleRef.current = designStyle;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          userContext: contextRef.current,
          modelId: modelRef.current,
          designStyle: designStyleRef.current,
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
    onError: (err) => {
      console.error("[useChat error]", err);
    },
  });
  const [input, setInput] = useState("");
  const chatInputRef = useRef<ChatInputHandle>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);

  // Agent mode state
  const agentMode = useAgentStore((s) => s.agentMode);
  const setAgentMode = useAgentStore((s) => s.setAgentMode);
  const agentMessages = useAgentStore((s) => s.agentMessages);
  const addAgentMessage = useAgentStore((s) => s.addAgentMessage);
  const updateAgentMessage = useAgentStore((s) => s.updateAgentMessage);
  const clearAgentMessages = useAgentStore((s) => s.clearAgentMessages);
  const getActiveEndpoint = useAgentStore((s) => s.getActiveEndpoint);
  const getCredential = useAgentStore((s) => s.getCredential);

  const agentClientRef = useRef<AGUIClient | null>(null);
  const [agentSending, setAgentSending] = useState(false);
  const streamingMsgIdRef = useRef<string | null>(null);
  const toolCallBufferRef = useRef<{ toolName: string; args: string; toolCallId: string } | null>(null);

  // HITL approval workflow
  const getApprovalPolicy = useApprovalStore((s) => s.getPolicy);
  const requestApproval = useApprovalStore((s) => s.requestApproval);
  const addAuditEntry = useApprovalStore((s) => s.addAuditEntry);
  const pendingRequests = useApprovalStore(
    useShallow((s) => s.approvalRequests.filter((r) => r.status === "pending"))
  );
  const [activeApprovalId, setActiveApprovalId] = useState<string | null>(null);
  const pendingApproval = pendingRequests.find((r) => r.id === activeApprovalId) ?? pendingRequests[0] ?? null;

  // Cleanup agent client on unmount
  useEffect(() => {
    return () => {
      if (agentClientRef.current) {
        agentClientRef.current.disconnect();
        agentClientRef.current = null;
      }
    };
  }, []);

  const isLoading = status === "streaming" || status === "submitted";
  const isAgentLoading = agentSending;

  const shortcuts: ShortcutDefinition[] = useMemo(
    () => [
      {
        key: "k",
        ctrl: true,
        description: "チャット入力にフォーカス",
        category: "ナビゲーション",
        action: () => chatInputRef.current?.focus(),
      },
      {
        key: "/",
        ctrl: true,
        description: "ショートカット一覧",
        category: "ナビゲーション",
        action: () => setShortcutsOpen((prev) => !prev),
      },
      {
        key: "Escape",
        description: "モーダルを閉じる",
        category: "その他",
        action: () => setShortcutsOpen(false),
      },
    ],
    []
  );

  useKeyboardShortcuts(shortcuts);

  // Handle ?prompt= query parameter from templates/other pages
  const promptHandled = useRef(false);
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam && !promptHandled.current) {
      promptHandled.current = true;
      setInput(promptParam);
      // Auto-send after a short delay to ensure everything is mounted
      const timer = setTimeout(() => {
        trackAction(promptParam.slice(0, 50));
        sendMessage({ text: promptParam });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, sendMessage, trackAction]);

  const handleAgentEvent = useCallback(
    (event: AGUIEvent) => {
      switch (event.type) {
        case "TEXT_MESSAGE_START": {
          const msgId = event.messageId ?? crypto.randomUUID();
          streamingMsgIdRef.current = msgId;
          addAgentMessage({
            id: msgId,
            role: "agent",
            content: "",
            timestamp: Date.now(),
            runId: event.runId ?? undefined,
            status: "streaming",
          });
          break;
        }
        case "TEXT_MESSAGE_CONTENT": {
          const id = streamingMsgIdRef.current;
          if (id && event.content) {
            const current = useAgentStore.getState().agentMessages.find((m) => m.id === id);
            updateAgentMessage(id, {
              content: (current?.content ?? "") + event.content,
            });
          }
          break;
        }
        case "TEXT_MESSAGE_END": {
          const id = streamingMsgIdRef.current;
          if (id) {
            updateAgentMessage(id, { status: "complete" });
            streamingMsgIdRef.current = null;
          }
          break;
        }
        case "TOOL_CALL_START": {
          const toolName = event.toolName ?? "unknown";
          const toolCallId = event.toolCallId ?? crypto.randomUUID();
          const policy = useApprovalStore.getState().getPolicy(toolName);

          if (policy === "block") {
            // Block: do not set buffer, log and show error
            toolCallBufferRef.current = null;
            useApprovalStore.getState().addAuditEntry(
              toolName,
              toolCallId,
              "blocked",
              {}
            );
            addAgentMessage({
              id: crypto.randomUUID(),
              role: "agent",
              content: `ツール「${toolName}」はポリシーによりブロックされました。`,
              timestamp: Date.now(),
              status: "complete",
            });
            break;
          }

          if (policy === "auto-approve") {
            // Auto-approve: set buffer and log
            toolCallBufferRef.current = {
              toolName,
              args: "",
              toolCallId,
            };
            useApprovalStore.getState().addAuditEntry(
              toolName,
              toolCallId,
              "auto-approved",
              {}
            );
            break;
          }

          // always-ask: set buffer and request approval
          toolCallBufferRef.current = {
            toolName,
            args: "",
            toolCallId,
          };
          const req = useApprovalStore.getState().requestApproval(
            toolName,
            toolCallId,
            {}
          );
          setActiveApprovalId(req.id);
          break;
        }
        case "TOOL_CALL_ARGS": {
          if (toolCallBufferRef.current && event.content) {
            toolCallBufferRef.current.args += event.content;
          }
          break;
        }
        case "TOOL_CALL_END": {
          if (toolCallBufferRef.current) {
            const tc = toolCallBufferRef.current;
            let parsedArgs: Record<string, unknown> = {};
            try {
              parsedArgs = JSON.parse(tc.args || "{}");
            } catch {
              parsedArgs = { raw: tc.args };
            }
            // Attach tool call to the current streaming message or create a new one
            const currentId = streamingMsgIdRef.current;
            if (currentId) {
              const current = useAgentStore.getState().agentMessages.find((m) => m.id === currentId);
              updateAgentMessage(currentId, {
                toolCalls: [
                  ...(current?.toolCalls ?? []),
                  { toolName: tc.toolName, args: parsedArgs },
                ],
              });
            } else {
              addAgentMessage({
                id: crypto.randomUUID(),
                role: "agent",
                content: "",
                timestamp: Date.now(),
                toolCalls: [{ toolName: tc.toolName, args: parsedArgs }],
                status: "complete",
              });
            }
            toolCallBufferRef.current = null;
          }
          break;
        }
        case "TOOL_CALL_RESULT": {
          // Find the latest message with matching tool call and add result
          const msgs = useAgentStore.getState().agentMessages;
          for (let i = msgs.length - 1; i >= 0; i--) {
            const m = msgs[i];
            if (m.toolCalls?.some((tc) => tc.toolName === event.toolName && !tc.result)) {
              const updatedCalls = m.toolCalls!.map((tc) =>
                tc.toolName === event.toolName && !tc.result
                  ? { ...tc, result: event.result }
                  : tc
              );
              updateAgentMessage(m.id, { toolCalls: updatedCalls });
              break;
            }
          }
          break;
        }
        case "RUN_ERROR": {
          const id = streamingMsgIdRef.current;
          if (id) {
            updateAgentMessage(id, {
              status: "error",
              content:
                (useAgentStore.getState().agentMessages.find((m) => m.id === id)?.content ?? "") +
                `\n[エラー: ${event.error ?? "不明なエラー"}]`,
            });
            streamingMsgIdRef.current = null;
          } else {
            addAgentMessage({
              id: crypto.randomUUID(),
              role: "agent",
              content: `エラー: ${event.error ?? "不明なエラー"}`,
              timestamp: Date.now(),
              status: "error",
            });
          }
          break;
        }
        case "RUN_FINISHED": {
          setAgentSending(false);
          break;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addAgentMessage, updateAgentMessage, setActiveApprovalId]
  );

  const handleApprovalResolved = useCallback(() => {
    setActiveApprovalId(null);
  }, []);

  async function handleAgentSend(text: string) {
    const endpoint = getActiveEndpoint();
    if (!endpoint || !text.trim()) return;

    // Add user message
    addAgentMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
      status: "complete",
    });

    setAgentSending(true);

    // Create client if needed or reuse
    if (!agentClientRef.current || agentClientRef.current.status === "error") {
      if (agentClientRef.current) {
        agentClientRef.current.disconnect();
      }
      agentClientRef.current = new AGUIClient(endpoint.url);
    }

    const client = agentClientRef.current;
    const unsub = client.onEvent(handleAgentEvent);

    const token = getCredential(endpoint.id);
    const authorization =
      endpoint.authType === "bearer" && token
        ? `Bearer ${token}`
        : endpoint.authType === "apikey" && token
          ? token
          : undefined;

    try {
      await client.sendMessage(text.trim(), { authorization });
    } catch {
      // errors handled via RUN_ERROR event
    } finally {
      unsub();
      setAgentSending(false);
    }
  }

  function handleSend() {
    if (!input.trim()) return;

    if (agentMode) {
      if (!agentSending) {
        trackAction(input.trim().slice(0, 50));
        handleAgentSend(input.trim());
        setInput("");
      }
      return;
    }

    if (!isLoading) {
      trackAction(input.trim().slice(0, 50));
      sendMessage({ text: input });
      setInput("");
    }
  }

  async function handleSendWithImage(text: string, file: File) {
    if (!isLoading) {
      trackAction((text || "画像からUI生成").slice(0, 50));
      const dataUrl = await fileToDataUrl(file);
      sendMessage({
        text: text || "この画像のUIを再現してください",
        files: [
          {
            type: "file" as const,
            mediaType: file.type,
            filename: file.name,
            url: dataUrl,
          },
        ],
      });
      setInput("");
    }
  }

  const handlePromptSend = useCallback(
    (prompt: string) => {
      if (!isLoading) {
        trackAction(prompt.slice(0, 50));
        sendMessage({ text: prompt });
      }
    },
    [isLoading, trackAction, sendMessage]
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <TemplateDrawer onSelect={handlePromptSend} />
          <ModelSelector selectedModelId={modelId} onModelChange={setModelId} />
          <StyleSelector selectedStyle={designStyle} onStyleChange={setDesignStyle} />
          <HistoryPanel onReuse={handlePromptSend} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShortcutsOpen(true)}
            aria-label="ショートカット"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <Button
            variant={agentMode ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              const endpoint = getActiveEndpoint();
              if (!endpoint) {
                setAgentPanelOpen(true);
                return;
              }
              setAgentMode(!agentMode);
            }}
            aria-label="エージェントモード切替"
            className="gap-1.5"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">エージェント</span>
            {agentMode && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-0.5">
                ON
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAgentPanelOpen(true)}
            aria-label="エージェント設定"
          >
            <Bot className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {agentMode && (
        <div className="flex items-center justify-between border-b bg-primary/5 px-4 py-1.5">
          <div className="flex items-center gap-2 text-xs text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>エージェントモード: {getActiveEndpoint()?.name ?? "未接続"}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground"
            onClick={clearAgentMessages}
          >
            クリア
          </Button>
        </div>
      )}

      {error && !agentMode && (
        <div className="border-b bg-destructive/10 px-6 py-2 text-sm text-destructive">
          エラーが発生しました: {error.message}
        </div>
      )}

      {agentMode ? (
        <AgentMessageList
          messages={agentMessages}
          isStreaming={agentSending}
        />
      ) : (
        <MessageList
          messages={messages}
          isLoading={isLoading}
          status={status}
          onPromptClick={handlePromptSend}
          onSendMessage={handlePromptSend}
        />
      )}

      <InstallPrompt />

      <div id="onboarding-input">
        <ChatInput
          ref={chatInputRef}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          onSendWithImage={handleSendWithImage}
          isLoading={agentMode ? isAgentLoading : isLoading}
        />
      </div>

      <ShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <AgentPanel open={agentPanelOpen} onClose={() => setAgentPanelOpen(false)} />

      {pendingApproval && (
        <ApprovalDialog
          request={pendingApproval}
          onResolved={handleApprovalResolved}
        />
      )}

      {!onboardingCompleted && <OnboardingTour />}
    </div>
  );
}
