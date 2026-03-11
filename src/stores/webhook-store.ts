"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WebhookConfig = {
  id: string;
  formTitle: string;
  url: string;
  type: "generic" | "slack" | "discord";
  headers?: Record<string, string>;
  enabled: boolean;
  lastTriggered?: number;
  lastStatus?: "success" | "error";
};

type WebhookState = {
  webhooks: WebhookConfig[];
  addWebhook: (config: Omit<WebhookConfig, "id">) => void;
  updateWebhook: (id: string, updates: Partial<WebhookConfig>) => void;
  removeWebhook: (id: string) => void;
  getWebhooksForForm: (formTitle: string) => WebhookConfig[];
  testWebhook: (id: string) => Promise<boolean>;
};

function generateId(): string {
  return `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatPayload(
  type: WebhookConfig["type"],
  formTitle: string,
  data: Record<string, unknown>
): unknown {
  if (type === "slack") {
    const lines = Object.entries(data)
      .map(([k, v]) => `*${k}*: ${v}`)
      .join("\n");
    return {
      text: `フォーム送信: ${formTitle}`,
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: lines || "(空のデータ)" },
        },
      ],
    };
  }

  if (type === "discord") {
    const fields = Object.entries(data).map(([k, v]) => ({
      name: k,
      value: String(v),
      inline: true,
    }));
    return {
      content: `フォーム送信: ${formTitle}`,
      embeds: [{ title: "送信データ", fields }],
    };
  }

  return { formTitle, data };
}

export { formatPayload };

export const useWebhookStore = create<WebhookState>()(
  persist(
    (set, get) => ({
      webhooks: [],

      addWebhook: (config) =>
        set((state) => {
          if (state.webhooks.length >= 20) return state;
          return {
            webhooks: [...state.webhooks, { ...config, id: generateId() }],
          };
        }),

      updateWebhook: (id, updates) =>
        set((state) => ({
          webhooks: state.webhooks.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      removeWebhook: (id) =>
        set((state) => ({
          webhooks: state.webhooks.filter((w) => w.id !== id),
        })),

      getWebhooksForForm: (formTitle) =>
        get().webhooks.filter((w) => w.formTitle === formTitle),

      testWebhook: async (id) => {
        const webhook = get().webhooks.find((w) => w.id === id);
        if (!webhook) return false;

        const testData = { test: true, message: "テスト送信", timestamp: new Date().toISOString() };
        const payload = formatPayload(webhook.type, webhook.formTitle, testData);

        try {
          const res = await fetch("/api/webhook", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: webhook.url,
              payload,
              type: webhook.type,
              headers: webhook.headers,
            }),
          });
          const result = await res.json();
          const success = result.success === true;

          set((state) => ({
            webhooks: state.webhooks.map((w) =>
              w.id === id
                ? { ...w, lastTriggered: Date.now(), lastStatus: success ? "success" : "error" }
                : w
            ),
          }));

          return success;
        } catch {
          set((state) => ({
            webhooks: state.webhooks.map((w) =>
              w.id === id
                ? { ...w, lastTriggered: Date.now(), lastStatus: "error" }
                : w
            ),
          }));
          return false;
        }
      },
    }),
    {
      name: "generative-ui-webhooks",
      partialize: (state) => ({
        ...state,
        webhooks: state.webhooks.map(({ headers, ...rest }) => rest),
      }),
    }
  )
);
