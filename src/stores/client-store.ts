"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ClientStatus = "active" | "inactive" | "prospect";

export type Client = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  industry?: string;
  notes?: string;
  status: ClientStatus;
  createdAt: number;
  updatedAt: number;
};

export const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "アクティブ",
  inactive: "非アクティブ",
  prospect: "見込み",
};

const MAX_CLIENTS = 200;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

type ClientStore = {
  clients: Client[];

  addClient: (
    data: Omit<Client, "id" | "createdAt" | "updatedAt">
  ) => Client | null;
  updateClient: (
    id: string,
    data: Partial<Omit<Client, "id" | "createdAt" | "updatedAt">>
  ) => void;
  removeClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  searchClients: (query: string, status?: ClientStatus | "all") => Client[];
};

const DEMO_CLIENTS: Client[] = [
  {
    id: "demo-1",
    companyName: "株式会社テクノソリューション",
    contactName: "田中太郎",
    email: "tanaka@techno-solution.co.jp",
    phone: "03-1234-5678",
    industry: "IT・通信",
    notes: "主要クライアント。月次定例あり。",
    status: "active",
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: "demo-2",
    companyName: "グローバルマーケティング合同会社",
    contactName: "鈴木花子",
    email: "suzuki@global-marketing.jp",
    phone: "06-9876-5432",
    industry: "広告・マーケティング",
    status: "active",
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 7,
  },
  {
    id: "demo-3",
    companyName: "未来建設株式会社",
    contactName: "佐藤次郎",
    email: "sato@mirai-kensetsu.co.jp",
    industry: "建設・不動産",
    notes: "提案書送付済み。返答待ち。",
    status: "prospect",
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 10,
  },
  {
    id: "demo-4",
    companyName: "オーシャンフーズ株式会社",
    contactName: "山田一郎",
    email: "yamada@ocean-foods.co.jp",
    phone: "092-111-2222",
    industry: "食品・飲料",
    status: "inactive",
    createdAt: Date.now() - 86400000 * 180,
    updatedAt: Date.now() - 86400000 * 45,
  },
  {
    id: "demo-5",
    companyName: "スマートエデュケーション株式会社",
    contactName: "高橋美咲",
    email: "takahashi@smart-edu.co.jp",
    industry: "教育",
    status: "prospect",
    createdAt: Date.now() - 86400000 * 14,
    updatedAt: Date.now() - 86400000 * 2,
  },
];

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clients: DEMO_CLIENTS,

      addClient: (data) => {
        const { clients } = get();
        if (clients.length >= MAX_CLIENTS) return null;
        const now = Date.now();
        const client: Client = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ clients: [...state.clients, client] }));
        return client;
      },

      updateClient: (id, data) => {
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: Date.now() } : c
          ),
        }));
      },

      removeClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        }));
      },

      getClient: (id) => {
        return get().clients.find((c) => c.id === id);
      },

      searchClients: (query, status = "all") => {
        const { clients } = get();
        const q = query.toLowerCase().trim();
        return clients.filter((c) => {
          if (status !== "all" && c.status !== status) return false;
          if (!q) return true;
          return (
            c.companyName.toLowerCase().includes(q) ||
            c.contactName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.industry && c.industry.toLowerCase().includes(q))
          );
        });
      },
    }),
    {
      name: "generative-ui-clients",
      partialize: (state) => ({
        clients: state.clients,
      }),
    }
  )
);
