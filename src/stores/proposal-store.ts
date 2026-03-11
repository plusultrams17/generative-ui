"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected";

export type ProposalItem = {
  id: string;
  description: string;
  hours: number;
  rate: number;
  subtotal: number;
};

export type Proposal = {
  id: string;
  projectId: string;
  clientId: string;
  title: string;
  summary: string;
  items: ProposalItem[];
  taxRate: number;
  discount?: number;
  totalAmount: number;
  status: ProposalStatus;
  validUntil?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

export const STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: "下書き",
  sent: "送付済",
  accepted: "承認済",
  rejected: "却下",
};

const MAX_PROPOSALS = 100;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function calculateTotal(
  items: ProposalItem[],
  taxRate: number,
  discount?: number
): number {
  const subtotal = items.reduce((sum, item) => sum + item.hours * item.rate, 0);
  const discounted = subtotal - (discount ?? 0);
  const tax = discounted * (taxRate / 100);
  return Math.max(0, discounted + tax);
}

type ProposalState = {
  proposals: Proposal[];
  addProposal: (
    proposal: Omit<Proposal, "id" | "createdAt" | "updatedAt" | "totalAmount">
  ) => Proposal | null;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  deleteProposal: (id: string) => void;
  duplicateProposal: (id: string) => Proposal | null;
  calculateTotal: (
    items: ProposalItem[],
    taxRate: number,
    discount?: number
  ) => number;
};

const DEMO_PROPOSALS: Proposal[] = [
  {
    id: "prop-demo-1",
    projectId: "",
    clientId: "demo-1",
    title: "Webサイトリニューアル提案書",
    summary:
      "コーポレートサイトのフルリニューアル。レスポンシブデザイン対応、CMS導入を含む。",
    items: [
      { id: "item-1", description: "要件定義・設計", hours: 40, rate: 8000, subtotal: 320000 },
      { id: "item-2", description: "デザイン制作", hours: 60, rate: 7000, subtotal: 420000 },
      { id: "item-3", description: "フロントエンド実装", hours: 80, rate: 7500, subtotal: 600000 },
      { id: "item-4", description: "CMS構築・設定", hours: 30, rate: 8000, subtotal: 240000 },
      { id: "item-5", description: "テスト・検証", hours: 20, rate: 6000, subtotal: 120000 },
    ],
    taxRate: 10,
    discount: 50000,
    totalAmount: 1815000,
    status: "sent",
    validUntil: Date.now() + 86400000 * 30,
    notes: "納期は契約締結後3ヶ月を予定。",
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "prop-demo-2",
    projectId: "",
    clientId: "demo-2",
    title: "SNSマーケティング運用支援",
    summary: "Instagram・X(Twitter)の月次運用代行サービス。",
    items: [
      { id: "item-6", description: "コンテンツ企画・制作", hours: 20, rate: 6000, subtotal: 120000 },
      { id: "item-7", description: "投稿管理・運用", hours: 15, rate: 5000, subtotal: 75000 },
      { id: "item-8", description: "月次レポート作成", hours: 5, rate: 7000, subtotal: 35000 },
    ],
    taxRate: 10,
    totalAmount: 253000,
    status: "accepted",
    validUntil: Date.now() + 86400000 * 14,
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    id: "prop-demo-3",
    projectId: "",
    clientId: "demo-3",
    title: "業務管理システム開発見積",
    summary: "社内業務フローのデジタル化。承認ワークフロー、ダッシュボード機能を含む。",
    items: [
      { id: "item-9", description: "要件ヒアリング・分析", hours: 30, rate: 9000, subtotal: 270000 },
      { id: "item-10", description: "システム設計", hours: 50, rate: 9000, subtotal: 450000 },
      { id: "item-11", description: "開発", hours: 200, rate: 8000, subtotal: 1600000 },
      { id: "item-12", description: "テスト・品質保証", hours: 40, rate: 7000, subtotal: 280000 },
      { id: "item-13", description: "導入・研修", hours: 20, rate: 8000, subtotal: 160000 },
    ],
    taxRate: 10,
    discount: 100000,
    totalAmount: 2926000,
    status: "draft",
    notes: "フェーズ分割での開発も検討可能。",
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 1,
  },
];

export const useProposalStore = create<ProposalState>()(
  persist(
    (set, get) => ({
      proposals: DEMO_PROPOSALS,

      addProposal: (data) => {
        const { proposals } = get();
        if (proposals.length >= MAX_PROPOSALS) return null;
        const now = Date.now();
        const items = data.items.map((item) => ({
          ...item,
          subtotal: item.hours * item.rate,
        }));
        const total = calculateTotal(items, data.taxRate, data.discount);
        const proposal: Proposal = {
          ...data,
          items,
          id: generateId(),
          totalAmount: total,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ proposals: [proposal, ...state.proposals] }));
        return proposal;
      },

      updateProposal: (id, updates) => {
        set((state) => ({
          proposals: state.proposals.map((p) => {
            if (p.id !== id) return p;
            const merged = { ...p, ...updates, updatedAt: Date.now() };
            const items = (merged.items ?? p.items).map((item) => ({
              ...item,
              subtotal: item.hours * item.rate,
            }));
            const total = calculateTotal(
              items,
              merged.taxRate ?? p.taxRate,
              merged.discount ?? p.discount
            );
            return { ...merged, items, totalAmount: total };
          }),
        }));
      },

      deleteProposal: (id) => {
        set((state) => ({
          proposals: state.proposals.filter((p) => p.id !== id),
        }));
      },

      duplicateProposal: (id) => {
        const { proposals } = get();
        if (proposals.length >= MAX_PROPOSALS) return null;
        const source = proposals.find((p) => p.id === id);
        if (!source) return null;
        const now = Date.now();
        const newProposal: Proposal = {
          ...source,
          id: generateId(),
          title: source.title + " (コピー)",
          status: "draft",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ proposals: [newProposal, ...state.proposals] }));
        return newProposal;
      },

      calculateTotal,
    }),
    {
      name: "generative-ui-proposals",
      partialize: (state) => ({ proposals: state.proposals }),
    }
  )
);
