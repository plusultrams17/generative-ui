// AG-UI Protocol - CopilotKit互換エージェント通信レイヤー

export type AGUIEventType =
  | "RUN_STARTED"
  | "RUN_FINISHED"
  | "RUN_ERROR"
  | "TEXT_MESSAGE_START"
  | "TEXT_MESSAGE_CONTENT"
  | "TEXT_MESSAGE_END"
  | "TOOL_CALL_START"
  | "TOOL_CALL_ARGS"
  | "TOOL_CALL_END"
  | "TOOL_CALL_RESULT"
  | "STEP_STARTED"
  | "STEP_FINISHED"
  | "STATE_SNAPSHOT"
  | "STATE_DELTA"
  | "MESSAGES_SNAPSHOT"
  | "RAW"
  | "CUSTOM";

export type AGUIEvent = {
  type: AGUIEventType;
  timestamp: number;
  data?: Record<string, unknown>;
  messageId?: string;
  toolCallId?: string;
  toolName?: string;
  content?: string;
  state?: Record<string, unknown>;
  delta?: Record<string, unknown>;
  error?: string;
  runId?: string;
  stepName?: string;
  result?: unknown;
  messages?: unknown[];
  rawData?: string;
};

export type AGUIConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export type AGUIMessageHandler = (event: AGUIEvent) => void;
export type AGUIStatusHandler = (status: AGUIConnectionStatus) => void;

export type SendMessageOptions = {
  threadId?: string;
  tools?: string[];
  authorization?: string;
};

const MAX_EVENTS = 200;
const DEFAULT_MAX_RETRIES = 5;

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class AGUIClient {
  private url: string;
  private eventSource: EventSource | null = null;
  private handlers: Set<AGUIMessageHandler> = new Set();
  private statusHandlers: Set<AGUIStatusHandler> = new Set();
  private _status: AGUIConnectionStatus = "disconnected";
  private _events: AGUIEvent[] = [];
  private _threadId: string;
  private _runId: string | null = null;
  private _retryCount = 0;
  private _maxRetries: number;
  private _abortController: AbortController | null = null;

  constructor(url: string, options?: { maxRetries?: number }) {
    this.url = url;
    this._threadId = generateUUID();
    this._maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  }

  get status(): AGUIConnectionStatus {
    return this._status;
  }

  get events(): AGUIEvent[] {
    return this._events;
  }

  get threadId(): string {
    return this._threadId;
  }

  get runId(): string | null {
    return this._runId;
  }

  private setStatus(status: AGUIConnectionStatus): void {
    this._status = status;
    this.statusHandlers.forEach((handler) => handler(status));
  }

  connect(): void {
    if (typeof window === "undefined") return;
    if (this.eventSource) {
      this.disconnect();
    }

    this.setStatus("connecting");

    const es = new EventSource(this.url);

    es.onopen = () => {
      this._retryCount = 0;
      this.setStatus("connected");
    };

    es.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        this.setStatus("disconnected");
      } else {
        this.setStatus("error");
        this.attemptReconnect();
      }
    };

    this.eventSource = es;
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
    this._retryCount = 0;
    this.setStatus("disconnected");
  }

  onEvent(handler: AGUIMessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  onStatusChange(handler: AGUIStatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  async sendMessage(
    content: string,
    options?: SendMessageOptions
  ): Promise<void> {
    const agentId = this.extractAgentId();
    const endpoint = `${this.url.replace(/\/events$/, "")}/api/agents/${agentId}/run`;

    this.setStatus("connecting");

    if (this._abortController) {
      this._abortController.abort();
    }
    this._abortController = new AbortController();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };
    if (options?.authorization) {
      headers["Authorization"] = options.authorization;
    }

    const body = JSON.stringify({
      threadId: options?.threadId ?? this._threadId,
      content,
      ...(options?.tools ? { tools: options.tools } : {}),
    });

    let retries = 0;

    const attemptFetch = async (): Promise<void> => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body,
          signal: this._abortController?.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this._retryCount = 0;
        this.setStatus("connected");

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is not readable");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const data = trimmed.slice(6);
              if (data === "[DONE]") continue;
              this.handleMessage(data);
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim().startsWith("data: ")) {
          const data = buffer.trim().slice(6);
          if (data !== "[DONE]") {
            this.handleMessage(data);
          }
        }

        this.setStatus("disconnected");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          this.setStatus("disconnected");
          return;
        }

        if (retries < this._maxRetries) {
          retries++;
          const delay = Math.min(1000 * Math.pow(2, retries - 1), 16000);
          this.setStatus("reconnecting");
          this.emitEvent({
            type: "RUN_ERROR",
            timestamp: Date.now(),
            error: `接続エラー、再接続中... (${retries}/${this._maxRetries})`,
          });
          await new Promise((resolve) => setTimeout(resolve, delay));
          return attemptFetch();
        }

        this.setStatus("error");
        this.emitEvent({
          type: "RUN_ERROR",
          timestamp: Date.now(),
          error:
            err instanceof Error ? err.message : "送信中に不明なエラーが発生",
        });
      }
    };

    await attemptFetch();
  }

  resetSession(): void {
    this.disconnect();
    this._threadId = generateUUID();
    this._runId = null;
    this._events = [];
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch(this.url, { method: "HEAD" });
      return res.ok;
    } catch {
      try {
        const res = await fetch(this.url, { method: "GET" });
        return res.ok;
      } catch {
        return false;
      }
    }
  }

  private extractAgentId(): string {
    const match = this.url.match(/\/agents\/([^/]+)/);
    return match?.[1] ?? "default";
  }

  private attemptReconnect(): void {
    if (this._retryCount >= this._maxRetries) {
      this.setStatus("error");
      this.emitEvent({
        type: "RUN_ERROR",
        timestamp: Date.now(),
        error: `再接続失敗: 最大リトライ回数 (${this._maxRetries}) に到達`,
      });
      return;
    }

    this._retryCount++;
    const delay = Math.min(1000 * Math.pow(2, this._retryCount - 1), 16000);
    this.setStatus("reconnecting");
    this.emitEvent({
      type: "RUN_ERROR",
      timestamp: Date.now(),
      error: `接続エラー、${delay / 1000}秒後に再接続... (${this._retryCount}/${this._maxRetries})`,
    });

    setTimeout(() => {
      if (this._status === "reconnecting") {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        this.connect();
      }
    }, delay);
  }

  private emitEvent(event: AGUIEvent): void {
    this.handlers.forEach((handler) => handler(event));
    this._events.push(event);
    if (this._events.length > MAX_EVENTS) {
      this._events = this._events.slice(-MAX_EVENTS);
    }
  }

  private handleMessage(data: string): void {
    try {
      const parsed = JSON.parse(data);
      const event: AGUIEvent = {
        type: parsed.type ?? "CUSTOM",
        timestamp: parsed.timestamp ?? Date.now(),
        ...parsed,
      };

      // Track runId from RUN_STARTED events
      if (event.type === "RUN_STARTED" && event.runId) {
        this._runId = event.runId;
      }

      this.emitEvent(event);
    } catch {
      // invalid JSON - ignore
    }
  }
}

export function formatEventForDisplay(event: AGUIEvent): string {
  switch (event.type) {
    case "RUN_STARTED":
      return `実行開始 (Run: ${event.runId ?? "N/A"})`;
    case "RUN_FINISHED":
      return `実行完了 (Run: ${event.runId ?? "N/A"})`;
    case "RUN_ERROR":
      return `実行エラー: ${event.error ?? "不明なエラー"}`;
    case "TEXT_MESSAGE_START":
      return `メッセージ開始 (ID: ${event.messageId ?? "N/A"})`;
    case "TEXT_MESSAGE_CONTENT":
      return event.content ?? "(空のコンテンツ)";
    case "TEXT_MESSAGE_END":
      return `メッセージ終了 (ID: ${event.messageId ?? "N/A"})`;
    case "TOOL_CALL_START":
      return `ツール呼出開始: ${event.toolName ?? "不明"}`;
    case "TOOL_CALL_ARGS":
      return `ツール引数: ${JSON.stringify(event.data ?? {}).slice(0, 100)}`;
    case "TOOL_CALL_END":
      return `ツール呼出完了: ${event.toolName ?? "不明"}`;
    case "TOOL_CALL_RESULT":
      return `ツール実行結果: ${event.toolName ?? "不明"} (ID: ${event.toolCallId ?? "N/A"})`;
    case "STEP_STARTED":
      return `ステップ開始: ${event.stepName ?? "不明"}`;
    case "STEP_FINISHED":
      return `ステップ完了: ${event.stepName ?? "不明"}`;
    case "STATE_SNAPSHOT":
      return `状態スナップショット受信`;
    case "STATE_DELTA":
      return `状態差分受信`;
    case "MESSAGES_SNAPSHOT":
      return `メッセージ履歴スナップショット (${event.messages?.length ?? 0}件)`;
    case "RAW":
      return `生データ: ${(event.rawData ?? "").slice(0, 100)}`;
    case "CUSTOM":
      return `カスタムイベント: ${JSON.stringify(event.data ?? {}).slice(0, 100)}`;
    default:
      return `不明なイベント: ${event.type}`;
  }
}

export function getEventColor(type: AGUIEventType): string {
  switch (type) {
    case "RUN_STARTED":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "RUN_FINISHED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "RUN_ERROR":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "TEXT_MESSAGE_START":
    case "TEXT_MESSAGE_CONTENT":
    case "TEXT_MESSAGE_END":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "TOOL_CALL_START":
    case "TOOL_CALL_ARGS":
    case "TOOL_CALL_END":
    case "TOOL_CALL_RESULT":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "STEP_STARTED":
    case "STEP_FINISHED":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
    case "STATE_SNAPSHOT":
    case "STATE_DELTA":
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
    case "MESSAGES_SNAPSHOT":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
    case "RAW":
      return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200";
    case "CUSTOM":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
}
