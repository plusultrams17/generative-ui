import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MarketplaceItem = {
  id: string;
  title: string;
  description: string;
  code: string;
  toolName: string;
  author: string;
  tags: string[];
  likes: number;
  downloads: number;
  createdAt: number;
  thumbnail?: string;
};

type MarketplaceStore = {
  items: MarketplaceItem[];
  likedIds: Set<string>;
  publishItem: (
    item: Omit<MarketplaceItem, "id" | "likes" | "downloads" | "createdAt">
  ) => MarketplaceItem;
  removeItem: (id: string) => void;
  toggleLike: (id: string) => void;
  incrementDownload: (id: string) => void;
  getByTag: (tag: string) => MarketplaceItem[];
  search: (query: string) => MarketplaceItem[];
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const SEED_ITEMS: MarketplaceItem[] = [
  {
    id: "seed-login",
    title: "ログインフォーム",
    description: "メールアドレスとパスワードによるシンプルなログインフォーム。バリデーション付き。",
    toolName: "showForm",
    author: "公式",
    tags: ["UI", "フォーム"],
    likes: 24,
    downloads: 58,
    createdAt: Date.now() - 86400000 * 7,
    code: `<div className="mx-auto max-w-sm space-y-6 rounded-xl border bg-card p-6 shadow-sm">
  <div className="space-y-2 text-center">
    <h2 className="text-2xl font-bold">ログイン</h2>
    <p className="text-sm text-muted-foreground">アカウントにサインインしてください</p>
  </div>
  <div className="space-y-4">
    <div className="space-y-2">
      <label className="text-sm font-medium">メールアドレス</label>
      <input type="email" placeholder="mail@example.com" className="w-full rounded-md border px-3 py-2 text-sm" />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">パスワード</label>
      <input type="password" placeholder="••••••••" className="w-full rounded-md border px-3 py-2 text-sm" />
    </div>
    <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
      サインイン
    </button>
  </div>
  <p className="text-center text-sm text-muted-foreground">
    アカウントをお持ちでないですか？ <a href="#" className="text-primary underline">新規登録</a>
  </p>
</div>`,
  },
  {
    id: "seed-dashboard",
    title: "ダッシュボードカード",
    description: "KPI表示用のダッシュボードカード。アイコンとトレンド表示付き。",
    toolName: "generateCustomComponent",
    author: "公式",
    tags: ["UI", "データ"],
    likes: 31,
    downloads: 72,
    createdAt: Date.now() - 86400000 * 6,
    code: `<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {[
    { label: "総売上", value: "¥1,234,567", change: "+12.5%", up: true },
    { label: "注文数", value: "1,234", change: "+8.2%", up: true },
    { label: "顧客数", value: "567", change: "+3.1%", up: true },
    { label: "返品率", value: "2.4%", change: "-0.5%", up: false },
  ].map((item) => (
    <div key={item.label} className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{item.label}</p>
      <p className="mt-1 text-2xl font-bold">{item.value}</p>
      <p className={\`mt-1 text-sm \${item.up ? "text-green-600" : "text-red-600"}\`}>
        {item.change}
      </p>
    </div>
  ))}
</div>`,
  },
  {
    id: "seed-pricing",
    title: "価格テーブル",
    description: "3つのプランを比較できる価格テーブル。おすすめプランのハイライト付き。",
    toolName: "generateCustomComponent",
    author: "公式",
    tags: ["UI", "データ"],
    likes: 18,
    downloads: 45,
    createdAt: Date.now() - 86400000 * 5,
    code: `<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
  {[
    { name: "スターター", price: "¥0", features: ["5プロジェクト", "1GBストレージ", "メールサポート"], highlight: false },
    { name: "プロ", price: "¥2,980", features: ["無制限プロジェクト", "100GBストレージ", "優先サポート", "API利用"], highlight: true },
    { name: "エンタープライズ", price: "要相談", features: ["全機能", "無制限ストレージ", "24/7サポート", "SLA保証"], highlight: false },
  ].map((plan) => (
    <div key={plan.name} className={\`rounded-xl border p-6 \${plan.highlight ? "border-primary bg-primary/5 shadow-lg" : "bg-card shadow-sm"}\`}>
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="mt-2 text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">/月</span></p>
      <ul className="mt-4 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm">
            <span className="text-green-500">✓</span>{f}
          </li>
        ))}
      </ul>
      <button className={\`mt-6 w-full rounded-md px-4 py-2 text-sm font-medium \${plan.highlight ? "bg-primary text-primary-foreground" : "border bg-background hover:bg-muted"}\`}>
        選択する
      </button>
    </div>
  ))}
</div>`,
  },
  {
    id: "seed-profile",
    title: "プロフィールカード",
    description: "ユーザーのアバター、名前、ステータスを表示するプロフィールカード。",
    toolName: "generateCustomComponent",
    author: "公式",
    tags: ["UI"],
    likes: 15,
    downloads: 33,
    createdAt: Date.now() - 86400000 * 4,
    code: `<div className="mx-auto max-w-xs rounded-xl border bg-card p-6 text-center shadow-sm">
  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-3xl font-bold text-white">
    T
  </div>
  <h3 className="mt-4 text-lg font-semibold">田中太郎</h3>
  <p className="text-sm text-muted-foreground">フロントエンドエンジニア</p>
  <div className="mt-4 flex justify-center gap-4 text-sm">
    <div><span className="font-bold">128</span><span className="ml-1 text-muted-foreground">投稿</span></div>
    <div><span className="font-bold">1.2K</span><span className="ml-1 text-muted-foreground">フォロワー</span></div>
    <div><span className="font-bold">256</span><span className="ml-1 text-muted-foreground">フォロー中</span></div>
  </div>
  <button className="mt-4 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
    フォローする
  </button>
</div>`,
  },
  {
    id: "seed-notifications",
    title: "通知リスト",
    description: "既読/未読のステータス付き通知リスト。アイコンと時刻表示。",
    toolName: "generateCustomComponent",
    author: "公式",
    tags: ["UI", "データ"],
    likes: 12,
    downloads: 28,
    createdAt: Date.now() - 86400000 * 3,
    code: `<div className="mx-auto max-w-md space-y-2 rounded-xl border bg-card p-4 shadow-sm">
  <h3 className="mb-3 text-lg font-semibold">通知</h3>
  {[
    { text: "新しいコメントが追加されました", time: "3分前", read: false },
    { text: "プロジェクトが更新されました", time: "1時間前", read: false },
    { text: "チームメンバーが参加しました", time: "3時間前", read: true },
    { text: "デプロイが完了しました", time: "昨日", read: true },
  ].map((n, i) => (
    <div key={i} className={\`flex items-start gap-3 rounded-lg p-3 \${n.read ? "opacity-60" : "bg-primary/5"}\`}>
      <div className={\`mt-1 h-2 w-2 shrink-0 rounded-full \${n.read ? "bg-muted-foreground" : "bg-primary"}\`} />
      <div className="flex-1">
        <p className="text-sm">{n.text}</p>
        <p className="text-xs text-muted-foreground">{n.time}</p>
      </div>
    </div>
  ))}
</div>`,
  },
  {
    id: "seed-chart",
    title: "統計チャート",
    description: "シンプルなバーチャートによる週間統計表示。CSSのみで実装。",
    toolName: "showChart",
    author: "公式",
    tags: ["データ"],
    likes: 20,
    downloads: 41,
    createdAt: Date.now() - 86400000 * 2,
    code: `<div className="mx-auto max-w-md rounded-xl border bg-card p-6 shadow-sm">
  <h3 className="text-lg font-semibold">週間アクティビティ</h3>
  <p className="text-sm text-muted-foreground">過去7日間の利用状況</p>
  <div className="mt-6 flex items-end justify-between gap-2" style={{ height: 160 }}>
    {[
      { day: "月", value: 60 },
      { day: "火", value: 85 },
      { day: "水", value: 45 },
      { day: "木", value: 90 },
      { day: "金", value: 70 },
      { day: "土", value: 30 },
      { day: "日", value: 50 },
    ].map((d) => (
      <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
        <div className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary" style={{ height: \`\${d.value}%\` }} />
        <span className="text-xs text-muted-foreground">{d.day}</span>
      </div>
    ))}
  </div>
</div>`,
  },
  {
    id: "seed-taskboard",
    title: "タスクボード",
    description: "ステータスごとにグループ化されたタスクボード。ドラッグ&ドロップ風のUI。",
    toolName: "generateCustomComponent",
    author: "公式",
    tags: ["UI", "データ"],
    likes: 27,
    downloads: 55,
    createdAt: Date.now() - 86400000 * 1,
    code: `<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
  {[
    { status: "未着手", color: "bg-gray-100 dark:bg-gray-800", items: ["要件定義書の作成", "デザインレビュー"] },
    { status: "進行中", color: "bg-blue-50 dark:bg-blue-950", items: ["API実装", "テスト作成", "ドキュメント更新"] },
    { status: "完了", color: "bg-green-50 dark:bg-green-950", items: ["環境構築", "DB設計"] },
  ].map((col) => (
    <div key={col.status} className={\`rounded-xl p-4 \${col.color}\`}>
      <h4 className="mb-3 text-sm font-semibold">{col.status}<span className="ml-2 text-muted-foreground">{col.items.length}</span></h4>
      <div className="space-y-2">
        {col.items.map((task) => (
          <div key={task} className="rounded-lg border bg-card p-3 text-sm shadow-sm">
            {task}
          </div>
        ))}
      </div>
    </div>
  ))}
</div>`,
  },
  {
    id: "seed-navbar",
    title: "ナビバー",
    description: "レスポンシブ対応のナビゲーションバー。ロゴ、リンク、CTAボタン付き。",
    toolName: "generateCustomComponent",
    author: "公式",
    tags: ["UI", "ナビ"],
    likes: 22,
    downloads: 49,
    createdAt: Date.now() - 3600000,
    code: `<nav className="flex items-center justify-between rounded-xl border bg-card px-6 py-3 shadow-sm">
  <div className="flex items-center gap-2">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">G</div>
    <span className="text-lg font-semibold">GenUI</span>
  </div>
  <div className="hidden items-center gap-6 md:flex">
    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">ホーム</a>
    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">機能</a>
    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">料金</a>
    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">ドキュメント</a>
  </div>
  <div className="flex items-center gap-2">
    <button className="rounded-md px-4 py-2 text-sm hover:bg-muted">ログイン</button>
    <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">始める</button>
  </div>
</nav>`,
  },
];

export const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      items: SEED_ITEMS,
      likedIds: new Set<string>(),
      publishItem: (item) => {
        const newItem: MarketplaceItem = {
          ...item,
          id: generateId(),
          likes: 0,
          downloads: 0,
          createdAt: Date.now(),
        };
        set((state) => ({
          items: [newItem, ...state.items].slice(0, 100),
        }));
        return newItem;
      },
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      toggleLike: (id) =>
        set((state) => {
          const newLiked = new Set(state.likedIds);
          const alreadyLiked = newLiked.has(id);
          if (alreadyLiked) {
            newLiked.delete(id);
          } else {
            newLiked.add(id);
          }
          return {
            likedIds: newLiked,
            items: state.items.map((i) =>
              i.id === id
                ? { ...i, likes: i.likes + (alreadyLiked ? -1 : 1) }
                : i
            ),
          };
        }),
      incrementDownload: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, downloads: i.downloads + 1 } : i
          ),
        })),
      getByTag: (tag) => get().items.filter((i) => i.tags.includes(tag)),
      search: (query) => {
        const q = query.toLowerCase();
        return get().items.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q) ||
            i.tags.some((t) => t.toLowerCase().includes(q))
        );
      },
    }),
    {
      name: "generative-ui-marketplace",
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          if (parsed?.state?.likedIds) {
            parsed.state.likedIds = new Set(parsed.state.likedIds);
          }
          return parsed;
        },
        setItem: (name, value) => {
          const serializable = {
            ...value,
            state: {
              ...value.state,
              likedIds: Array.from(value.state.likedIds || []),
            },
          };
          localStorage.setItem(name, JSON.stringify(serializable));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
