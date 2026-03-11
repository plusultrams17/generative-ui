"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "modified";

export type ApprovalRequest = {
  id: string;
  toolName: string;
  toolCallId: string;
  args: Record<string, unknown>;
  timestamp: number;
  status: ApprovalStatus;
  modifiedArgs?: Record<string, unknown>;
  reason?: string;
};

export type ApprovalPolicyAction = "auto-approve" | "always-ask" | "block";

export type ApprovalPolicy = {
  toolName: string;
  action: ApprovalPolicyAction;
};

export type AuditAction =
  | "approved"
  | "rejected"
  | "modified"
  | "auto-approved"
  | "blocked";

export type AuditEntry = {
  id: string;
  toolName: string;
  toolCallId: string;
  action: AuditAction;
  timestamp: number;
  args: Record<string, unknown>;
  reason?: string;
};

const MAX_AUDIT_LOG = 500;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

type ApprovalStore = {
  approvalRequests: ApprovalRequest[];
  policies: ApprovalPolicy[];
  auditLog: AuditEntry[];

  requestApproval: (
    toolName: string,
    toolCallId: string,
    args: Record<string, unknown>
  ) => ApprovalRequest;
  approve: (requestId: string) => void;
  reject: (requestId: string, reason?: string) => void;
  modifyAndApprove: (
    requestId: string,
    newArgs: Record<string, unknown>
  ) => void;
  setPolicy: (toolName: string, action: ApprovalPolicyAction) => void;
  getPolicy: (toolName: string) => ApprovalPolicyAction;
  addAuditEntry: (
    toolName: string,
    toolCallId: string,
    action: AuditAction,
    args: Record<string, unknown>,
    reason?: string
  ) => void;
  clearAuditLog: () => void;
  removeRequest: (requestId: string) => void;
};

export const useApprovalStore = create<ApprovalStore>()(
  persist(
    (set, get) => ({
      approvalRequests: [],
      policies: [],
      auditLog: [],

      requestApproval: (toolName, toolCallId, args) => {
        const request: ApprovalRequest = {
          id: generateId(),
          toolName,
          toolCallId,
          args,
          timestamp: Date.now(),
          status: "pending",
        };
        set((state) => ({
          approvalRequests: [...state.approvalRequests, request],
        }));
        return request;
      },

      approve: (requestId) => {
        const request = get().approvalRequests.find((r) => r.id === requestId);
        if (!request) return;
        set((state) => ({
          approvalRequests: state.approvalRequests.map((r) =>
            r.id === requestId ? { ...r, status: "approved" as const } : r
          ),
        }));
        get().addAuditEntry(
          request.toolName,
          request.toolCallId,
          "approved",
          request.args
        );
      },

      reject: (requestId, reason?) => {
        const request = get().approvalRequests.find((r) => r.id === requestId);
        if (!request) return;
        set((state) => ({
          approvalRequests: state.approvalRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: "rejected" as const, reason }
              : r
          ),
        }));
        get().addAuditEntry(
          request.toolName,
          request.toolCallId,
          "rejected",
          request.args,
          reason
        );
      },

      modifyAndApprove: (requestId, newArgs) => {
        const request = get().approvalRequests.find((r) => r.id === requestId);
        if (!request) return;
        set((state) => ({
          approvalRequests: state.approvalRequests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: "modified" as const,
                  modifiedArgs: newArgs,
                }
              : r
          ),
        }));
        get().addAuditEntry(
          request.toolName,
          request.toolCallId,
          "modified",
          newArgs
        );
      },

      setPolicy: (toolName, action) =>
        set((state) => {
          const exists = state.policies.find((p) => p.toolName === toolName);
          if (exists) {
            return {
              policies: state.policies.map((p) =>
                p.toolName === toolName ? { ...p, action } : p
              ),
            };
          }
          return {
            policies: [...state.policies, { toolName, action }],
          };
        }),

      getPolicy: (toolName) => {
        const policy = get().policies.find((p) => p.toolName === toolName);
        return policy?.action ?? "always-ask";
      },

      addAuditEntry: (toolName, toolCallId, action, args, reason?) => {
        const entry: AuditEntry = {
          id: generateId(),
          toolName,
          toolCallId,
          action,
          timestamp: Date.now(),
          args,
          reason,
        };
        set((state) => {
          const newLog = [...state.auditLog, entry];
          return {
            auditLog: newLog.length > MAX_AUDIT_LOG
              ? newLog.slice(newLog.length - MAX_AUDIT_LOG)
              : newLog,
          };
        });
      },

      clearAuditLog: () => set({ auditLog: [] }),

      removeRequest: (requestId) =>
        set((state) => ({
          approvalRequests: state.approvalRequests.filter(
            (r) => r.id !== requestId
          ),
        })),
    }),
    {
      name: "generative-ui-approval",
      partialize: (state) => ({
        policies: state.policies,
        auditLog: state.auditLog,
      }),
    }
  )
);
