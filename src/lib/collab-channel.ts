export type CollabUser = {
  id: string;
  name: string;
  color: string;
  lastSeen: number;
  currentPage: string;
};

export type CollabMessage =
  | { type: "join"; user: CollabUser }
  | { type: "leave"; userId: string }
  | { type: "heartbeat"; user: CollabUser }
  | { type: "activity"; userId: string; action: string };

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
];

const NAMES = [
  "ユーザーA",
  "ユーザーB",
  "ユーザーC",
  "ユーザーD",
  "ユーザーE",
];

const CHANNEL_NAME = "generative-ui-collab";

export class CollabChannel {
  private channel: BroadcastChannel | null = null;
  private userId: string;
  private handlers: Set<(msg: CollabMessage) => void> = new Set();

  constructor() {
    this.userId = `user-${Date.now().toString(36)}`;
  }

  get id() {
    return this.userId;
  }

  connect(pagePath: string): CollabUser {
    const user: CollabUser = {
      id: this.userId,
      name: NAMES[Math.floor(Math.random() * NAMES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      lastSeen: Date.now(),
      currentPage: pagePath,
    };

    if (typeof window !== "undefined") {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent<CollabMessage>) => {
        this.handlers.forEach((handler) => handler(event.data));
      };
      this.channel.postMessage({ type: "join", user } satisfies CollabMessage);
    }

    return user;
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.postMessage({
        type: "leave",
        userId: this.userId,
      } satisfies CollabMessage);
      this.channel.close();
      this.channel = null;
    }
  }

  sendHeartbeat(user: CollabUser): void {
    if (this.channel) {
      this.channel.postMessage({
        type: "heartbeat",
        user: { ...user, lastSeen: Date.now() },
      } satisfies CollabMessage);
    }
  }

  sendActivity(action: string): void {
    if (this.channel) {
      this.channel.postMessage({
        type: "activity",
        userId: this.userId,
        action,
      } satisfies CollabMessage);
    }
  }

  onMessage(handler: (msg: CollabMessage) => void): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }
}
