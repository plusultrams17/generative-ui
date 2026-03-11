"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "admin" | "editor" | "viewer";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: number;
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    "manage-users",
    "manage-agents",
    "manage-settings",
    "view-audit",
    "approve-tools",
    "export-data",
  ],
  editor: ["manage-agents", "approve-tools", "view-audit"],
  viewer: ["view-audit"],
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "管理者",
  editor: "編集者",
  viewer: "閲覧者",
};

export type AuditLogEntry = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  details?: string;
  timestamp: number;
};

export type CostEntry = {
  id: string;
  model: string;
  tokens: { input: number; output: number };
  cost: number;
  timestamp: number;
  agentName?: string;
};

export type SSOConfig = {
  provider: "none" | "saml" | "oidc";
  issuerUrl: string;
  clientId: string;
  enabled: boolean;
};

const MAX_AUDIT_LOG = 1000;
const MAX_COST_ENTRIES = 500;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

type EnterpriseStore = {
  currentUser: User | null;
  users: User[];
  auditLog: AuditLogEntry[];
  costEntries: CostEntry[];
  ssoConfig: SSOConfig;

  setCurrentUser: (user: User | null) => void;
  addUser: (name: string, email: string, role: Role) => User;
  updateUserRole: (id: string, role: Role) => void;
  removeUser: (id: string) => void;
  hasPermission: (permission: string) => boolean;
  addAuditLog: (action: string, target: string, details?: string) => void;
  addCostEntry: (
    model: string,
    tokens: { input: number; output: number },
    cost: number,
    agentName?: string
  ) => void;
  getCostSummary: () => {
    totalCost: number;
    byModel: Record<string, number>;
    byAgent: Record<string, number>;
    lastMonthCost: number;
  };
  setSSOConfig: (config: Partial<SSOConfig>) => void;
  clearAuditLog: () => void;
  generateDemoCosts: () => void;
};

const DEMO_USERS: User[] = [
  { id: "1", name: "管理者", email: "admin@example.com", role: "admin", createdAt: Date.now() - 86400000 * 30 },
  { id: "2", name: "編集者A", email: "editor@example.com", role: "editor", createdAt: Date.now() - 86400000 * 15 },
  { id: "3", name: "閲覧者B", email: "viewer@example.com", role: "viewer", createdAt: Date.now() - 86400000 * 5 },
];

export const useEnterpriseStore = create<EnterpriseStore>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: DEMO_USERS,
      auditLog: [],
      costEntries: [],
      ssoConfig: { provider: "none", issuerUrl: "", clientId: "", enabled: false },

      setCurrentUser: (user) => set({ currentUser: user }),

      addUser: (name, email, role) => {
        const user: User = { id: generateId(), name, email, role, createdAt: Date.now() };
        set((state) => ({ users: [...state.users, user] }));
        get().addAuditLog("ユーザー追加", `${name} (${email})`, `ロール: ${ROLE_LABELS[role]}`);
        return user;
      },

      updateUserRole: (id, role) => {
        const user = get().users.find((u) => u.id === id);
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
        }));
        if (user) {
          get().addAuditLog("ロール変更", user.name, `→ ${ROLE_LABELS[role]}`);
        }
      },

      removeUser: (id) => {
        const user = get().users.find((u) => u.id === id);
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
          currentUser: state.currentUser?.id === id ? null : state.currentUser,
        }));
        if (user) {
          get().addAuditLog("ユーザー削除", user.name);
        }
      },

      hasPermission: (permission) => {
        const { currentUser } = get();
        if (!currentUser) return false;
        return ROLE_PERMISSIONS[currentUser.role].includes(permission);
      },

      addAuditLog: (action, target, details?) => {
        const { currentUser } = get();
        const entry: AuditLogEntry = {
          id: generateId(),
          userId: currentUser?.id ?? "system",
          userName: currentUser?.name ?? "システム",
          action,
          target,
          details,
          timestamp: Date.now(),
        };
        set((state) => {
          const newLog = [...state.auditLog, entry];
          return { auditLog: newLog.length > MAX_AUDIT_LOG ? newLog.slice(-MAX_AUDIT_LOG) : newLog };
        });
      },

      addCostEntry: (model, tokens, cost, agentName?) => {
        const entry: CostEntry = { id: generateId(), model, tokens, cost, timestamp: Date.now(), agentName };
        set((state) => {
          const newEntries = [...state.costEntries, entry];
          return { costEntries: newEntries.length > MAX_COST_ENTRIES ? newEntries.slice(-MAX_COST_ENTRIES) : newEntries };
        });
      },

      getCostSummary: () => {
        const { costEntries } = get();
        const now = Date.now();
        const monthAgo = now - 30 * 86400000;
        const byModel: Record<string, number> = {};
        const byAgent: Record<string, number> = {};
        let totalCost = 0;
        let lastMonthCost = 0;

        for (const e of costEntries) {
          totalCost += e.cost;
          byModel[e.model] = (byModel[e.model] ?? 0) + e.cost;
          if (e.agentName) {
            byAgent[e.agentName] = (byAgent[e.agentName] ?? 0) + e.cost;
          }
          if (e.timestamp >= monthAgo) {
            lastMonthCost += e.cost;
          }
        }
        return { totalCost, byModel, byAgent, lastMonthCost };
      },

      setSSOConfig: (config) =>
        set((state) => ({ ssoConfig: { ...state.ssoConfig, ...config } })),

      clearAuditLog: () => set({ auditLog: [] }),

      generateDemoCosts: () => {
        const models = ["gpt-4o", "gpt-4o-mini", "claude-3.5-sonnet", "gemini-2.0-flash"];
        const agents = ["チャットアシスタント", "コード生成", "データ分析", undefined];
        const entries: CostEntry[] = [];
        for (let i = 0; i < 50; i++) {
          const model = models[Math.floor(Math.random() * models.length)];
          const agent = agents[Math.floor(Math.random() * agents.length)];
          const input = Math.floor(Math.random() * 5000) + 100;
          const output = Math.floor(Math.random() * 2000) + 50;
          const rate = model.includes("4o-mini") ? 0.00015 : model.includes("4o") ? 0.005 : 0.003;
          entries.push({
            id: generateId() + i,
            model,
            tokens: { input, output },
            cost: Math.round((input + output) * rate * 100) / 100,
            timestamp: Date.now() - Math.floor(Math.random() * 30 * 86400000),
            agentName: agent,
          });
        }
        set((state) => ({ costEntries: [...state.costEntries, ...entries].slice(-MAX_COST_ENTRIES) }));
      },
    }),
    {
      name: "generative-ui-enterprise",
      partialize: (state) => ({
        users: state.users,
        auditLog: state.auditLog,
        costEntries: state.costEntries,
        ssoConfig: state.ssoConfig,
      }),
    }
  )
);
