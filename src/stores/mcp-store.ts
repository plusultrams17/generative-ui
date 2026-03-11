"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  connect,
  type MCPTool,
  type MCPResource,
  type MCPPrompt,
} from "@/lib/mcp-client";

export type MCPServerStatus =
  | "connecting"
  | "connected"
  | "error"
  | "disconnected";

export type MCPServer = {
  id: string;
  name: string;
  url: string;
  status: MCPServerStatus;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  error?: string;
  lastConnected?: number;
};

type MCPStore = {
  mcpServers: MCPServer[];
  addServer: (name: string, url: string) => Promise<void>;
  removeServer: (id: string) => void;
  refreshServer: (id: string) => Promise<void>;
  getAvailableTools: () => (MCPTool & { serverName: string; serverUrl: string })[];
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export const useMCPStore = create<MCPStore>()(
  persist(
    (set, get) => ({
      mcpServers: [],

      addServer: async (name, url) => {
        const id = generateId();
        const server: MCPServer = {
          id,
          name,
          url,
          status: "connecting",
          tools: [],
          resources: [],
          prompts: [],
        };

        set((state) => ({
          mcpServers: [...state.mcpServers, server],
        }));

        try {
          const result = await connect(url);
          set((state) => ({
            mcpServers: state.mcpServers.map((s) =>
              s.id === id
                ? {
                    ...s,
                    status: "connected" as MCPServerStatus,
                    tools: result.tools,
                    resources: result.resources,
                    prompts: result.prompts,
                    error: undefined,
                    lastConnected: Date.now(),
                  }
                : s
            ),
          }));
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "接続に失敗しました";
          set((state) => ({
            mcpServers: state.mcpServers.map((s) =>
              s.id === id
                ? { ...s, status: "error" as MCPServerStatus, error: message }
                : s
            ),
          }));
        }
      },

      removeServer: (id) =>
        set((state) => ({
          mcpServers: state.mcpServers.filter((s) => s.id !== id),
        })),

      refreshServer: async (id) => {
        const server = get().mcpServers.find((s) => s.id === id);
        if (!server) return;

        set((state) => ({
          mcpServers: state.mcpServers.map((s) =>
            s.id === id
              ? { ...s, status: "connecting" as MCPServerStatus, error: undefined }
              : s
          ),
        }));

        try {
          const result = await connect(server.url);
          set((state) => ({
            mcpServers: state.mcpServers.map((s) =>
              s.id === id
                ? {
                    ...s,
                    status: "connected" as MCPServerStatus,
                    tools: result.tools,
                    resources: result.resources,
                    prompts: result.prompts,
                    error: undefined,
                    lastConnected: Date.now(),
                  }
                : s
            ),
          }));
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "接続に失敗しました";
          set((state) => ({
            mcpServers: state.mcpServers.map((s) =>
              s.id === id
                ? { ...s, status: "error" as MCPServerStatus, error: message }
                : s
            ),
          }));
        }
      },

      getAvailableTools: () => {
        const { mcpServers } = get();
        return mcpServers
          .filter((s) => s.status === "connected")
          .flatMap((s) =>
            s.tools.map((t) => ({
              ...t,
              serverName: s.name,
              serverUrl: s.url,
            }))
          );
      },
    }),
    {
      name: "generative-ui-mcp",
      partialize: (state) => ({
        mcpServers: state.mcpServers.map((s) => ({
          ...s,
          status: "disconnected" as MCPServerStatus,
          error: undefined,
        })),
      }),
    }
  )
);
