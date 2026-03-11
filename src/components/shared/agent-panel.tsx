"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Wifi,
  WifiOff,
  Trash2,
  Plus,
  RotateCcw,
  X,
  Send,
  Lock,
  Key,
  ShieldOff,
} from "lucide-react";
import { useAgentStore, type AuthType } from "@/stores/agent-store";
import {
  AGUIClient,
  type AGUIEvent,
  type AGUIConnectionStatus,
  formatEventForDisplay,
  getEventColor,
} from "@/lib/ag-ui-protocol";

type AgentPanelProps = {
  open: boolean;
  onClose: () => void;
};

function getAuthorizationString(
  authType: AuthType,
  token: string | undefined
): string | undefined {
  if (!token || authType === "none") return undefined;
  if (authType === "bearer") return `Bearer ${token}`;
  if (authType === "apikey") return token;
  return undefined;
}

function getAuthHeaders(
  authType: AuthType,
  token: string | undefined
): Record<string, string> {
  if (!token || authType === "none") return {};
  if (authType === "bearer") return { Authorization: `Bearer ${token}` };
  if (authType === "apikey") return { "X-API-Key": token };
  return {};
}

function AuthBadge({ authType }: { authType: AuthType }) {
  if (authType === "none") return null;
  if (authType === "bearer") {
    return (
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
        <Lock className="h-2.5 w-2.5" />
        Bearer
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
      <Key className="h-2.5 w-2.5" />
      API Key
    </Badge>
  );
}

export function AgentPanel({ open, onClose }: AgentPanelProps) {
  const endpoints = useAgentStore((s) => s.endpoints);
  const activeEndpointId = useAgentStore((s) => s.activeEndpointId);
  const addEndpoint = useAgentStore((s) => s.addEndpoint);
  const removeEndpoint = useAgentStore((s) => s.removeEndpoint);
  const setActiveEndpoint = useAgentStore((s) => s.setActiveEndpoint);
  const getActiveEndpoint = useAgentStore((s) => s.getActiveEndpoint);
  const setCredential = useAgentStore((s) => s.setCredential);
  const getCredential = useAgentStore((s) => s.getCredential);

  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAuthType, setNewAuthType] = useState<AuthType>("none");
  const [newToken, setNewToken] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<AGUIConnectionStatus>("disconnected");
  const [events, setEvents] = useState<AGUIEvent[]>([]);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [latestState, setLatestState] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const clientRef = useRef<AGUIClient | null>(null);
  const eventLogRef = useRef<HTMLDivElement>(null);
  const cleanupFnsRef = useRef<(() => void)[]>([]);

  const cleanup = useCallback(() => {
    cleanupFnsRef.current.forEach((fn) => fn());
    cleanupFnsRef.current = [];
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }
    setConnectionStatus("disconnected");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Escape key to close panel
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  function handleAddEndpoint() {
    if (!newName.trim() || !newUrl.trim()) return;
    const endpoint = addEndpoint(
      newName.trim(),
      newUrl.trim(),
      newAuthType,
      newDescription.trim() || undefined
    );
    if (newAuthType !== "none" && newToken.trim()) {
      setCredential(endpoint.id, newToken.trim());
    }
    setNewName("");
    setNewUrl("");
    setNewAuthType("none");
    setNewToken("");
    setNewDescription("");
  }

  async function handleTestConnection() {
    const active = getActiveEndpoint();
    if (!active) return;
    setTestResult(null);
    const token = getCredential(active.id);
    const headers = getAuthHeaders(active.authType, token);
    try {
      const res = await fetch(active.url, { method: "HEAD", headers });
      setTestResult(res.ok);
    } catch {
      try {
        const res = await fetch(active.url, { method: "GET", headers });
        setTestResult(res.ok);
      } catch {
        setTestResult(false);
      }
    }
  }

  function handleConnect() {
    const active = getActiveEndpoint();
    if (!active) return;

    cleanup();

    const token = getCredential(active.id);

    // For EventSource SSE, pass auth via query params since EventSource doesn't support headers
    let connectUrl = active.url;
    if (active.authType === "bearer" && token) {
      const sep = connectUrl.includes("?") ? "&" : "?";
      connectUrl += `${sep}_auth=${encodeURIComponent(`Bearer ${token}`)}`;
    } else if (active.authType === "apikey" && token) {
      const sep = connectUrl.includes("?") ? "&" : "?";
      connectUrl += `${sep}_apikey=${encodeURIComponent(token)}`;
    }

    const client = new AGUIClient(connectUrl);
    clientRef.current = client;

    const unsubEvent = client.onEvent((event) => {
      setEvents((prev) => {
        const next = [...prev, event];
        return next.length > 200 ? next.slice(-200) : next;
      });
      if (event.type === "STATE_SNAPSHOT" && event.state) {
        setLatestState(event.state);
      }
    });

    const unsubStatus = client.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    cleanupFnsRef.current.push(unsubEvent, unsubStatus);

    client.connect();
    setConnectionStatus("connecting");
  }

  function handleDisconnect() {
    cleanup();
  }

  function handleClearEvents() {
    setEvents([]);
    setLatestState(null);
  }

  async function handleSendMessage() {
    const active = getActiveEndpoint();
    if (!active || !messageInput.trim() || !clientRef.current) return;

    const message = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    const token = getCredential(active.id);
    const authorization = getAuthorizationString(active.authType, token);

    try {
      await clientRef.current.sendMessage(message, { authorization });
    } catch {
      // Errors are emitted as RUN_ERROR events via the client
    } finally {
      setIsSending(false);
    }
  }

  function handleMessageKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  // Auto-scroll event log
  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [events]);

  const statusColor: Record<AGUIConnectionStatus, string> = {
    connected: "bg-green-500",
    connecting: "bg-yellow-500",
    reconnecting: "bg-yellow-500",
    error: "bg-red-500",
    disconnected: "bg-gray-400",
  };

  const isConnected = connectionStatus === "connected";
  const canSend = isConnected && !isSending;

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative ml-auto flex h-full w-full max-w-md flex-col border-l bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <h2 className="text-sm font-semibold">AG-UI エージェント</h2>
            <span
              className={`inline-block h-2 w-2 rounded-full ${statusColor[connectionStatus]}`}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Endpoint management */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">
              エンドポイント管理
            </h3>

            {/* Add form */}
            <div className="space-y-2 rounded-md border p-3">
              <Input
                placeholder="名前（例: My Agent）"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-xs"
              />
              <Input
                placeholder="URL（例: http://localhost:8000/agents/my-agent/events）"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="text-xs"
              />
              <Input
                placeholder="説明（オプション）"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="text-xs"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">
                  認証:
                </span>
                <Select
                  value={newAuthType}
                  onValueChange={(v) => setNewAuthType(v as AuthType)}
                >
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-1.5">
                        <ShieldOff className="h-3 w-3" />
                        なし
                      </div>
                    </SelectItem>
                    <SelectItem value="bearer">
                      <div className="flex items-center gap-1.5">
                        <Lock className="h-3 w-3" />
                        Bearer Token
                      </div>
                    </SelectItem>
                    <SelectItem value="apikey">
                      <div className="flex items-center gap-1.5">
                        <Key className="h-3 w-3" />
                        API Key
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newAuthType !== "none" && (
                <Input
                  type="password"
                  placeholder={
                    newAuthType === "bearer"
                      ? "Bearer トークン"
                      : "API キー"
                  }
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                  className="text-xs"
                />
              )}
              <Button
                size="sm"
                onClick={handleAddEndpoint}
                disabled={!newName.trim() || !newUrl.trim()}
                className="w-full"
              >
                <Plus className="mr-1 h-3 w-3" />
                追加
              </Button>
            </div>

            {/* Endpoint list */}
            <div className="space-y-1">
              {endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className={`flex items-center justify-between rounded-md border p-2 text-xs cursor-pointer transition-colors ${
                    activeEndpointId === ep.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setActiveEndpoint(ep.id)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium truncate">{ep.name}</p>
                      <AuthBadge authType={ep.authType} />
                    </div>
                    <p className="text-muted-foreground truncate">{ep.url}</p>
                    {ep.description && (
                      <p className="text-muted-foreground/70 truncate mt-0.5">
                        {ep.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEndpoint(ep.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {endpoints.length === 0 && (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  エンドポイントが未登録です
                </p>
              )}
            </div>
          </div>

          {/* Connection controls */}
          {activeEndpointId && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                接続制御
              </h3>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestConnection}
                >
                  テスト
                </Button>
                {connectionStatus === "disconnected" ||
                connectionStatus === "error" ? (
                  <Button size="sm" onClick={handleConnect}>
                    <Wifi className="mr-1 h-3 w-3" />
                    接続
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDisconnect}
                  >
                    <WifiOff className="mr-1 h-3 w-3" />
                    切断
                  </Button>
                )}
              </div>
              {testResult !== null && (
                <p
                  className={`text-xs ${testResult ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {testResult ? "接続テスト成功" : "接続テスト失敗"}
                </p>
              )}
            </div>
          )}

          {/* Event monitor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-muted-foreground">
                イベントモニター
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearEvents}
                className="h-6 px-2 text-xs"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                クリア
              </Button>
            </div>
            <div
              ref={eventLogRef}
              className="max-h-60 space-y-1 overflow-y-auto rounded-md border bg-muted/30 p-2"
            >
              {events.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  イベントなし
                </p>
              ) : (
                events.map((event, i) => (
                  <div
                    key={`${event.timestamp}-${i}`}
                    className="rounded-md border bg-background p-2 text-xs"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 ${getEventColor(event.type)}`}
                      >
                        {event.type}
                      </Badge>
                      <span className="text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      {formatEventForDisplay(event)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Latest state snapshot */}
          {latestState && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                最新の状態スナップショット
              </h3>
              <pre className="max-h-40 overflow-auto rounded-md border bg-muted/30 p-2 text-xs">
                {JSON.stringify(latestState, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Message input (fixed at bottom) */}
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Textarea
              placeholder={
                isConnected
                  ? "エージェントにメッセージを送信..."
                  : "接続してからメッセージを送信"
              }
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleMessageKeyDown}
              disabled={!canSend}
              className="min-h-9 max-h-24 resize-none text-xs"
              rows={1}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!canSend || !messageInput.trim()}
              className="shrink-0 h-9 w-9"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!isConnected && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              エージェントに接続するとメッセージを送信できます
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
