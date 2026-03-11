"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AgentRole = "coordinator" | "worker" | "reviewer";
export type AgentStatus = "idle" | "running" | "completed" | "error";
export type LogType = "info" | "success" | "error" | "warning";
export type OrchestrationStatus = "idle" | "running" | "completed";

export type OrchestratedAgent = {
  id: string;
  name: string;
  endpointUrl: string;
  role: AgentRole;
  status: AgentStatus;
  lastMessage?: string;
  taskCount: number;
};

export type AgentLink = {
  id: string;
  from: string;
  to: string;
  protocol: "a2a" | "direct";
  label?: string;
};

export type OrchLog = {
  id: string;
  agentId: string;
  agentName: string;
  message: string;
  timestamp: number;
  type: LogType;
};

export type Orchestration = {
  id: string;
  name: string;
  description: string;
  agents: OrchestratedAgent[];
  links: AgentLink[];
  status: OrchestrationStatus;
  createdAt: number;
  logs: OrchLog[];
};

type OrchestrationStore = {
  orchestrations: Orchestration[];
  activeOrchId: string | null;
  addOrchestration: (name: string, description?: string) => string;
  removeOrchestration: (id: string) => void;
  addAgent: (orchId: string, name: string, endpointUrl: string, role: AgentRole) => void;
  removeAgent: (orchId: string, agentId: string) => void;
  updateAgentStatus: (orchId: string, agentId: string, status: AgentStatus, message?: string) => void;
  addLink: (orchId: string, from: string, to: string, protocol?: "a2a" | "direct") => void;
  removeLink: (orchId: string, linkId: string) => void;
  addLog: (orchId: string, agentId: string, agentName: string, message: string, type: LogType) => void;
  clearLogs: (orchId: string) => void;
  setActiveOrch: (id: string | null) => void;
  setOrchestrationStatus: (orchId: string, status: OrchestrationStatus) => void;
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export const useOrchestrationStore = create<OrchestrationStore>()(
  persist(
    (set) => ({
      orchestrations: [],
      activeOrchId: null,

      addOrchestration: (name, description) => {
        const id = generateId();
        const orch: Orchestration = {
          id,
          name,
          description: description || "",
          agents: [],
          links: [],
          status: "idle",
          createdAt: Date.now(),
          logs: [],
        };
        set((state) => ({
          orchestrations: [...state.orchestrations, orch],
          activeOrchId: id,
        }));
        return id;
      },

      removeOrchestration: (id) =>
        set((state) => ({
          orchestrations: state.orchestrations.filter((o) => o.id !== id),
          activeOrchId: state.activeOrchId === id ? null : state.activeOrchId,
        })),

      addAgent: (orchId, name, endpointUrl, role) => {
        const agent: OrchestratedAgent = {
          id: generateId(),
          name,
          endpointUrl,
          role,
          status: "idle",
          taskCount: 0,
        };
        set((state) => ({
          orchestrations: state.orchestrations.map((o) =>
            o.id === orchId ? { ...o, agents: [...o.agents, agent] } : o
          ),
        }));
      },

      removeAgent: (orchId, agentId) =>
        set((state) => ({
          orchestrations: state.orchestrations.map((o) =>
            o.id === orchId
              ? {
                  ...o,
                  agents: o.agents.filter((a) => a.id !== agentId),
                  links: o.links.filter((l) => l.from !== agentId && l.to !== agentId),
                }
              : o
          ),
        })),

      updateAgentStatus: (orchId, agentId, status, message) =>
        set((state) => ({
          orchestrations: state.orchestrations.map((o) =>
            o.id === orchId
              ? {
                  ...o,
                  agents: o.agents.map((a) =>
                    a.id === agentId
                      ? {
                          ...a,
                          status,
                          lastMessage: message ?? a.lastMessage,
                          taskCount: status === "completed" ? a.taskCount + 1 : a.taskCount,
                        }
                      : a
                  ),
                }
              : o
          ),
        })),

      addLink: (orchId, from, to, protocol) => {
        const link: AgentLink = {
          id: generateId(),
          from,
          to,
          protocol: protocol || "a2a",
        };
        set((state) => ({
          orchestrations: state.orchestrations.map((o) =>
            o.id === orchId ? { ...o, links: [...o.links, link] } : o
          ),
        }));
      },

      removeLink: (orchId, linkId) =>
        set((state) => ({
          orchestrations: state.orchestrations.map((o) =>
            o.id === orchId
              ? { ...o, links: o.links.filter((l) => l.id !== linkId) }
              : o
          ),
        })),

      addLog: (orchId, agentId, agentName, message, type) => {
        const log: OrchLog = {
          id: generateId(),
          agentId,
          agentName,
          message,
          timestamp: Date.now(),
          type,
        };
        set((state) => ({
          orchestrations: state.orchestrations.map((o) =>
            o.id === orchId ? { ...o, logs: [...o.logs, log] } : o
          ),
        }));
      },

      clearLogs: (orchId) =>
        set((state) => ({
          orchestrations: state.orchestrations.map((o) =>
            o.id === orchId ? { ...o, logs: [] } : o
          ),
        })),

      setActiveOrch: (id) => set({ activeOrchId: id }),

      setOrchestrationStatus: (orchId, status) =>
        set((state) => ({
          orchestrations: state.orchestrations.map((o) =>
            o.id === orchId ? { ...o, status } : o
          ),
        })),
    }),
    {
      name: "generative-ui-orchestration",
      partialize: (state) => ({
        orchestrations: state.orchestrations,
        activeOrchId: state.activeOrchId,
      }),
    }
  )
);
