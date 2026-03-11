"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthType = "none" | "bearer" | "apikey";

export type AgentEndpoint = {
  id: string;
  name: string;
  url: string;
  createdAt: number;
  authType: AuthType;
  description?: string;
};

export type AgentMessage = {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
  toolCalls?: { toolName: string; args: Record<string, unknown>; result?: unknown }[];
  runId?: string;
  status?: "streaming" | "complete" | "error";
};

type AgentStore = {
  endpoints: AgentEndpoint[];
  activeEndpointId: string | null;
  addEndpoint: (
    name: string,
    url: string,
    authType: AuthType,
    description?: string
  ) => AgentEndpoint;
  updateEndpoint: (id: string, partial: Partial<Omit<AgentEndpoint, "id" | "createdAt">>) => void;
  removeEndpoint: (id: string) => void;
  setActiveEndpoint: (id: string | null) => void;
  getActiveEndpoint: () => AgentEndpoint | undefined;
  // In-memory credential management (not persisted)
  credentials: Map<string, string>;
  setCredential: (endpointId: string, token: string) => void;
  getCredential: (endpointId: string) => string | undefined;
  clearCredentials: () => void;
  // Agent chat messages
  agentMessages: AgentMessage[];
  addAgentMessage: (msg: AgentMessage) => void;
  updateAgentMessage: (id: string, partial: Partial<AgentMessage>) => void;
  clearAgentMessages: () => void;
  agentMode: boolean;
  setAgentMode: (mode: boolean) => void;
};

const MAX_ENDPOINTS = 10;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      endpoints: [],
      activeEndpointId: null,
      credentials: new Map<string, string>(),

      addEndpoint: (name, url, authType, description) => {
        const endpoint: AgentEndpoint = {
          id: generateId(),
          name,
          url,
          createdAt: Date.now(),
          authType,
          description,
        };
        set((state) => {
          if (state.endpoints.length >= MAX_ENDPOINTS) return state;
          return { endpoints: [...state.endpoints, endpoint] };
        });
        return endpoint;
      },

      updateEndpoint: (id, partial) =>
        set((state) => ({
          endpoints: state.endpoints.map((ep) =>
            ep.id === id ? { ...ep, ...partial } : ep
          ),
        })),

      removeEndpoint: (id) =>
        set((state) => {
          const newCredentials = new Map(state.credentials);
          newCredentials.delete(id);
          return {
            endpoints: state.endpoints.filter((e) => e.id !== id),
            activeEndpointId:
              state.activeEndpointId === id ? null : state.activeEndpointId,
            credentials: newCredentials,
          };
        }),

      setActiveEndpoint: (id) => set({ activeEndpointId: id }),

      getActiveEndpoint: () => {
        const { endpoints, activeEndpointId } = get();
        return endpoints.find((e) => e.id === activeEndpointId);
      },

      setCredential: (endpointId, token) =>
        set((state) => {
          const newCredentials = new Map(state.credentials);
          newCredentials.set(endpointId, token);
          return { credentials: newCredentials };
        }),

      getCredential: (endpointId) => {
        return get().credentials.get(endpointId);
      },

      clearCredentials: () => set({ credentials: new Map() }),

      // Agent chat messages
      agentMessages: [],
      addAgentMessage: (msg) =>
        set((state) => ({
          agentMessages: [...state.agentMessages, msg],
        })),
      updateAgentMessage: (id, partial) =>
        set((state) => ({
          agentMessages: state.agentMessages.map((m) =>
            m.id === id ? { ...m, ...partial } : m
          ),
        })),
      clearAgentMessages: () => set({ agentMessages: [] }),
      agentMode: false,
      setAgentMode: (mode) => set({ agentMode: mode }),
    }),
    {
      name: "generative-ui-agents",
      partialize: (state) => ({
        endpoints: state.endpoints,
        activeEndpointId: state.activeEndpointId,
      }),
    }
  )
);
