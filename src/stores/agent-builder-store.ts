"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FlowNodeType = "trigger" | "action" | "condition" | "output";

export type FlowNode = {
  id: string;
  type: FlowNodeType;
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type AgentFlow = {
  id: string;
  name: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: number;
  updatedAt: number;
};

export const NODE_TEMPLATES: Record<
  FlowNodeType,
  { type: FlowNodeType; label: string; config: Record<string, unknown> }[]
> = {
  trigger: [
    { type: "trigger", label: "ユーザーメッセージ", config: { event: "user-message" } },
    { type: "trigger", label: "スケジュール", config: { cron: "" } },
    { type: "trigger", label: "Webhook", config: { url: "" } },
  ],
  action: [
    { type: "action", label: "LLM呼び出し", config: { model: "gpt-4o", prompt: "" } },
    { type: "action", label: "ツール実行", config: { toolName: "", args: {} } },
    { type: "action", label: "API リクエスト", config: { method: "GET", url: "", headers: {} } },
  ],
  condition: [
    { type: "condition", label: "IF-ELSE", config: { expression: "" } },
    { type: "condition", label: "テキスト含有", config: { keyword: "" } },
    { type: "condition", label: "正規表現", config: { pattern: "" } },
  ],
  output: [
    { type: "output", label: "テキスト応答", config: { template: "" } },
    { type: "output", label: "UI コンポーネント", config: { component: "" } },
    { type: "output", label: "通知", config: { channel: "toast" } },
  ],
};

type AgentBuilderStore = {
  flows: AgentFlow[];
  activeFlowId: string | null;
  addFlow: (name: string, description?: string) => AgentFlow;
  updateFlow: (id: string, partial: Partial<Omit<AgentFlow, "id">>) => void;
  removeFlow: (id: string) => void;
  duplicateFlow: (id: string) => AgentFlow | null;
  addNode: (flowId: string, node: Omit<FlowNode, "id">) => void;
  updateNode: (flowId: string, nodeId: string, partial: Partial<Omit<FlowNode, "id">>) => void;
  removeNode: (flowId: string, nodeId: string) => void;
  addEdge: (flowId: string, edge: Omit<FlowEdge, "id">) => void;
  removeEdge: (flowId: string, edgeId: string) => void;
  setActiveFlow: (id: string | null) => void;
};

function computeNodePosition(nodes: FlowNode[], type: FlowNodeType): { x: number; y: number } {
  const typeOrder: FlowNodeType[] = ["trigger", "action", "condition", "output"];
  const col = typeOrder.indexOf(type);
  const nodesOfType = nodes.filter((n) => n.type === type);
  const row = nodesOfType.length;
  return { x: 80 + col * 220, y: 60 + row * 120 };
}

export const useAgentBuilderStore = create<AgentBuilderStore>()(
  persist(
    (set, get) => ({
      flows: [],
      activeFlowId: null,

      addFlow: (name, description = "") => {
        const flow: AgentFlow = {
          id: crypto.randomUUID(),
          name,
          description,
          nodes: [],
          edges: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          flows: [...state.flows, flow],
          activeFlowId: flow.id,
        }));
        return flow;
      },

      updateFlow: (id, partial) =>
        set((state) => ({
          flows: state.flows.map((f) =>
            f.id === id ? { ...f, ...partial, updatedAt: Date.now() } : f
          ),
        })),

      removeFlow: (id) =>
        set((state) => ({
          flows: state.flows.filter((f) => f.id !== id),
          activeFlowId: state.activeFlowId === id ? null : state.activeFlowId,
        })),

      duplicateFlow: (id) => {
        const source = get().flows.find((f) => f.id === id);
        if (!source) return null;
        const newFlow: AgentFlow = {
          ...source,
          id: crypto.randomUUID(),
          name: `${source.name} (コピー)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          nodes: source.nodes.map((n) => ({ ...n, id: crypto.randomUUID() })),
          edges: [],
        };
        set((state) => ({
          flows: [...state.flows, newFlow],
          activeFlowId: newFlow.id,
        }));
        return newFlow;
      },

      addNode: (flowId, node) =>
        set((state) => ({
          flows: state.flows.map((f) => {
            if (f.id !== flowId) return f;
            const position = computeNodePosition(f.nodes, node.type);
            const newNode: FlowNode = {
              ...node,
              id: crypto.randomUUID(),
              position: node.position.x === 0 && node.position.y === 0 ? position : node.position,
            };
            return { ...f, nodes: [...f.nodes, newNode], updatedAt: Date.now() };
          }),
        })),

      updateNode: (flowId, nodeId, partial) =>
        set((state) => ({
          flows: state.flows.map((f) => {
            if (f.id !== flowId) return f;
            return {
              ...f,
              nodes: f.nodes.map((n) => (n.id === nodeId ? { ...n, ...partial } : n)),
              updatedAt: Date.now(),
            };
          }),
        })),

      removeNode: (flowId, nodeId) =>
        set((state) => ({
          flows: state.flows.map((f) => {
            if (f.id !== flowId) return f;
            return {
              ...f,
              nodes: f.nodes.filter((n) => n.id !== nodeId),
              edges: f.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
              updatedAt: Date.now(),
            };
          }),
        })),

      addEdge: (flowId, edge) =>
        set((state) => ({
          flows: state.flows.map((f) => {
            if (f.id !== flowId) return f;
            const exists = f.edges.some(
              (e) => e.source === edge.source && e.target === edge.target
            );
            if (exists) return f;
            return {
              ...f,
              edges: [...f.edges, { ...edge, id: crypto.randomUUID() }],
              updatedAt: Date.now(),
            };
          }),
        })),

      removeEdge: (flowId, edgeId) =>
        set((state) => ({
          flows: state.flows.map((f) => {
            if (f.id !== flowId) return f;
            return {
              ...f,
              edges: f.edges.filter((e) => e.id !== edgeId),
              updatedAt: Date.now(),
            };
          }),
        })),

      setActiveFlow: (id) => set({ activeFlowId: id }),
    }),
    { name: "generative-ui-agent-builder" }
  )
);
