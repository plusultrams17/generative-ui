"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Key,
  Sliders,
  Database,
  Info,
  Check,
  X,
  ExternalLink,
  AlertTriangle,
  Bot,
  Trash2,
  Plus,
  Plug,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useDeployStore } from "@/stores/deploy-store";
import { useGitHubStore } from "@/stores/github-store";
import { useUserContextStore } from "@/stores/user-context-store";
import { useHistoryStore } from "@/stores/history-store";
import { useShareStore } from "@/stores/share-store";
import { useVersionStore } from "@/stores/version-store";
import { AVAILABLE_MODELS } from "@/lib/models";
import { useAgentStore, type AgentEndpoint } from "@/stores/agent-store";
import { useSupabaseStore } from "@/stores/supabase-store";
import { useMCPStore, type MCPServer } from "@/stores/mcp-store";
import { useAuthStore } from "@/stores/auth-store";
import { Crown } from "lucide-react";

function maskToken(token: string): string {
  if (!token) return "";
  if (token.length <= 4) return "****";
  return "●".repeat(Math.min(token.length - 4, 20)) + token.slice(-4);
}

type ConfirmTarget =
  | "history"
  | "shares"
  | "versions"
  | "all"
  | null;

export default function SettingsPage() {
  // --- Stores ---
  const vercelToken = useDeployStore((s) => s.vercelToken);
  const setVercelToken = useDeployStore((s) => s.setVercelToken);
  const githubToken = useGitHubStore((s) => s.githubToken);
  const setGithubToken = useGitHubStore((s) => s.setGithubToken);
  const userContext = useUserContextStore((s) => s.context);
  const historyEntries = useHistoryStore((s) => s.entries);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const shares = useShareStore((s) => s.shares);
  const versions = useVersionStore((s) => s.versions);
  const supabaseConfig = useSupabaseStore((s) => s.config);
  const setSupabaseConfig = useSupabaseStore((s) => s.setConfig);
  const profile = useAuthStore((s) => s.profile);
  const isPro = profile?.plan === "pro";
  const [planLoading, setPlanLoading] = useState(false);

  // --- Token editing state ---
  const [editingVercel, setEditingVercel] = useState(false);
  const [editingGithub, setEditingGithub] = useState(false);
  const [editingSupabase, setEditingSupabase] = useState(false);
  const [vercelDraft, setVercelDraft] = useState("");
  const [githubDraft, setGithubDraft] = useState("");
  const [supabaseUrlDraft, setSupabaseUrlDraft] = useState("");
  const [supabaseKeyDraft, setSupabaseKeyDraft] = useState("");

  // --- Default model ---
  const [defaultModel, setDefaultModel] = useState("gpt-4o");
  useEffect(() => {
    const stored = localStorage.getItem("generative-ui-default-model");
    if (stored) setDefaultModel(stored);
  }, []);

  function handleDefaultModelChange(value: string) {
    setDefaultModel(value);
    localStorage.setItem("generative-ui-default-model", value);
  }

  // --- Skill level ---
  const [skillLevel, setSkillLevel] = useState<string>(userContext.skillLevel);
  useEffect(() => {
    setSkillLevel(userContext.skillLevel);
  }, [userContext.skillLevel]);

  // --- Agent endpoints ---
  const agentEndpoints = useAgentStore((s) => s.endpoints);
  const addAgentEndpoint = useAgentStore((s) => s.addEndpoint);
  const removeAgentEndpoint = useAgentStore((s) => s.removeEndpoint);
  const [agentName, setAgentName] = useState("");
  const [agentUrl, setAgentUrl] = useState("");

  // --- MCP servers ---
  const mcpServers = useMCPStore((s) => s.mcpServers);
  const addMCPServer = useMCPStore((s) => s.addServer);
  const removeMCPServer = useMCPStore((s) => s.removeServer);
  const refreshMCPServer = useMCPStore((s) => s.refreshServer);
  const [mcpName, setMcpName] = useState("");
  const [mcpUrl, setMcpUrl] = useState("");
  const [mcpAdding, setMcpAdding] = useState(false);
  const [mcpExpandedId, setMcpExpandedId] = useState<string | null>(null);

  // --- Confirmation dialog ---
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);

  // Escape key to close confirmation dialog
  useEffect(() => {
    if (!confirmTarget) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirmTarget(null);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmTarget]);

  function handleClear(target: ConfirmTarget) {
    if (target === "history") {
      clearHistory();
    } else if (target === "shares") {
      useShareStore.setState({ shares: [] });
    } else if (target === "versions") {
      useVersionStore.setState({ versions: [] });
    } else if (target === "all") {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith("generative-ui-")
      );
      keys.forEach((k) => localStorage.removeItem(k));
      window.location.reload();
    }
    setConfirmTarget(null);
  }

  const confirmLabels: Record<string, string> = {
    history: "履歴データ",
    shares: "共有データ",
    versions: "バージョンデータ",
    all: "すべてのデータ（設定含む）",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="戻る">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">設定</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {/* ===== Section 0: Plan Management ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              プラン管理
            </CardTitle>
            <CardDescription>
              現在のプランと利用状況を確認できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-sm font-medium">現在のプラン</p>
                <div className="mt-1 flex items-center gap-2">
                  {isPro ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white">
                      <Crown className="h-3 w-3" />
                      Pro
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                      Free
                    </span>
                  )}
                </div>
              </div>
              {!isPro && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={planLoading}
                  onClick={async () => {
                    setPlanLoading(true);
                    try {
                      const res = await fetch("/api/stripe/checkout", { method: "POST" });
                      const data = await res.json();
                      if (data.url) window.location.href = data.url;
                    } catch { /* ignore */ }
                    setPlanLoading(false);
                  }}
                >
                  {planLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Crown className="h-3.5 w-3.5" />
                  )}
                  アップグレード
                </Button>
              )}
            </div>

            {profile && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">今月の生成回数</span>
                  <span className="font-medium">
                    {profile.generation_count_month} / {isPro ? 300 : 30}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(100, (profile.generation_count_month / (isPro ? 300 : 30)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {isPro && profile?.stripe_customer_id && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={async () => {
                  try {
                    const res = await fetch("/api/stripe/portal", { method: "POST" });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch { /* ignore */ }
                }}
              >
                サブスクリプション管理（Stripe）
              </Button>
            )}
          </CardContent>
        </Card>

        {/* ===== Section 1: API Tokens ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              APIトークン
            </CardTitle>
            <CardDescription>
              外部サービスとの連携に使用するトークンを管理します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OpenAI API Key (display only) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>OpenAI API Key</Label>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-green-500" />
                  環境変数で設定済み
                </span>
              </div>
              <Input
                value="●●●●●●●●●●●●"
                disabled
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                サーバー側の環境変数（OPENAI_API_KEY）で管理されています
              </p>
            </div>

            <Separator />

            {/* Vercel Token */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Vercel Token</Label>
                <span className="flex items-center gap-1 text-xs">
                  {vercelToken ? (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        設定済み
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">
                        未設定
                      </span>
                    </>
                  )}
                </span>
              </div>
              {editingVercel ? (
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={vercelDraft}
                    onChange={(e) => setVercelDraft(e.target.value)}
                    placeholder="Vercelトークンを入力"
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      setVercelToken(vercelDraft);
                      setEditingVercel(false);
                      setVercelDraft("");
                    }}
                  >
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingVercel(false);
                      setVercelDraft("");
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={vercelToken ? maskToken(vercelToken) : ""}
                    disabled
                    placeholder="未設定"
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setVercelDraft(vercelToken);
                      setEditingVercel(true);
                    }}
                  >
                    変更
                  </Button>
                </div>
              )}
              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                トークンを取得
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <Separator />

            {/* GitHub Token */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>GitHub Token</Label>
                <span className="flex items-center gap-1 text-xs">
                  {githubToken ? (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        設定済み
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">
                        未設定
                      </span>
                    </>
                  )}
                </span>
              </div>
              {editingGithub ? (
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={githubDraft}
                    onChange={(e) => setGithubDraft(e.target.value)}
                    placeholder="GitHubトークンを入力"
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      setGithubToken(githubDraft);
                      setEditingGithub(false);
                      setGithubDraft("");
                    }}
                  >
                    保存
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingGithub(false);
                      setGithubDraft("");
                    }}
                  >
                    キャンセル
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={githubToken ? maskToken(githubToken) : ""}
                    disabled
                    placeholder="未設定"
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setGithubDraft(githubToken);
                      setEditingGithub(true);
                    }}
                  >
                    変更
                  </Button>
                </div>
              )}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                トークンを取得
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <Separator />

            {/* Supabase */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5" />
                  Supabase
                </Label>
                <span className="flex items-center gap-1 text-xs">
                  {supabaseConfig.url && supabaseConfig.anonKey ? (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        設定済み
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">
                        未設定
                      </span>
                    </>
                  )}
                </span>
              </div>
              {editingSupabase ? (
                <div className="space-y-2">
                  <Input
                    type="url"
                    value={supabaseUrlDraft}
                    onChange={(e) => setSupabaseUrlDraft(e.target.value)}
                    placeholder="https://xxxxx.supabase.co"
                    className="font-mono text-xs"
                  />
                  <Input
                    type="password"
                    value={supabaseKeyDraft}
                    onChange={(e) => setSupabaseKeyDraft(e.target.value)}
                    placeholder="anon key"
                    className="font-mono text-xs"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSupabaseConfig({
                          url: supabaseUrlDraft,
                          anonKey: supabaseKeyDraft,
                        });
                        setEditingSupabase(false);
                        setSupabaseUrlDraft("");
                        setSupabaseKeyDraft("");
                      }}
                    >
                      保存
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingSupabase(false);
                        setSupabaseUrlDraft("");
                        setSupabaseKeyDraft("");
                      }}
                    >
                      キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <Input
                      value={
                        supabaseConfig.url
                          ? maskToken(supabaseConfig.url)
                          : ""
                      }
                      disabled
                      placeholder="URL 未設定"
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={
                        supabaseConfig.anonKey
                          ? maskToken(supabaseConfig.anonKey)
                          : ""
                      }
                      disabled
                      placeholder="anon key 未設定"
                      className="font-mono text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSupabaseUrlDraft(supabaseConfig.url);
                        setSupabaseKeyDraft(supabaseConfig.anonKey);
                        setEditingSupabase(true);
                      }}
                    >
                      変更
                    </Button>
                  </div>
                </div>
              )}
              <a
                href="https://supabase.com/dashboard/project/_/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Supabaseダッシュボード
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* ===== Section 2: Preferences ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              プリファレンス
            </CardTitle>
            <CardDescription>
              アプリケーションの動作設定を変更します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default model */}
            <div className="space-y-2">
              <Label>デフォルトモデル</Label>
              <Select
                value={defaultModel}
                onValueChange={handleDefaultModelChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label} — {m.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Skill level */}
            <div className="space-y-2">
              <Label>スキルレベル</Label>
              <Select
                value={skillLevel}
                onValueChange={(v) => {
                  setSkillLevel(v);
                  useUserContextStore.setState((state) => ({
                    context: {
                      ...state.context,
                      skillLevel: v as "beginner" | "intermediate" | "advanced",
                    },
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">初心者</SelectItem>
                  <SelectItem value="intermediate">中級者</SelectItem>
                  <SelectItem value="advanced">上級者</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                AIの応答レベルを調整します。セッション数に応じて自動調整もされます。
              </p>
            </div>

            <Separator />

            {/* Language */}
            <div className="space-y-2">
              <Label>言語</Label>
              <Input value="日本語" disabled />
              <p className="text-xs text-muted-foreground">
                現在は日本語のみ対応しています
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ===== Section 3: Data Management ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              データ管理
            </CardTitle>
            <CardDescription>
              ローカルに保存されたデータの管理と削除ができます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* History */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">履歴</p>
                <p className="text-xs text-muted-foreground">
                  {historyEntries.length} 件のエントリ
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmTarget("history")}
                disabled={historyEntries.length === 0}
              >
                履歴をクリア
              </Button>
            </div>

            {/* Shares */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">共有データ</p>
                <p className="text-xs text-muted-foreground">
                  {shares.length} 件の共有
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmTarget("shares")}
                disabled={shares.length === 0}
              >
                共有データをクリア
              </Button>
            </div>

            {/* Versions */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">バージョン</p>
                <p className="text-xs text-muted-foreground">
                  {versions.length} 件のバージョン
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmTarget("versions")}
                disabled={versions.length === 0}
              >
                バージョンをクリア
              </Button>
            </div>

            <Separator />

            {/* Clear all */}
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div>
                <p className="text-sm font-medium text-destructive">
                  すべてのデータを削除
                </p>
                <p className="text-xs text-muted-foreground">
                  トークン・設定・履歴など全てのローカルデータを削除します
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmTarget("all")}
              >
                すべてクリア
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ===== Section: Agent Endpoints ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              エージェント連携
            </CardTitle>
            <CardDescription>
              AG-UIプロトコル対応の外部エージェントエンドポイントを管理します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="エージェント名"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="text-xs"
                />
                <Input
                  placeholder="URL (例: http://localhost:8000/sse)"
                  value={agentUrl}
                  onChange={(e) => setAgentUrl(e.target.value)}
                  className="text-xs"
                />
              </div>
              <Button
                size="sm"
                onClick={() => {
                  if (agentName.trim() && agentUrl.trim()) {
                    addAgentEndpoint(agentName.trim(), agentUrl.trim(), "none");
                    setAgentName("");
                    setAgentUrl("");
                  }
                }}
                disabled={!agentName.trim() || !agentUrl.trim()}
              >
                <Plus className="mr-1 h-3 w-3" />
                エンドポイントを追加
              </Button>
            </div>

            {agentEndpoints.length > 0 ? (
              <div className="space-y-2">
                {agentEndpoints.map((ep: AgentEndpoint) => (
                  <div
                    key={ep.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{ep.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {ep.url}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAgentEndpoint(ep.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-2">
                エンドポイントが登録されていません
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              チャット画面のエージェントボタンから接続・イベントモニタリングが行えます
            </p>
          </CardContent>
        </Card>

        {/* ===== Section: MCP Servers ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              MCPサーバー
            </CardTitle>
            <CardDescription>
              Model Context Protocol対応サーバーを接続し、外部ツール・リソースを利用します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add server form */}
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="サーバー名"
                  value={mcpName}
                  onChange={(e) => setMcpName(e.target.value)}
                  className="text-xs"
                />
                <Input
                  placeholder="URL (例: https://mcp-server.example.com)"
                  value={mcpUrl}
                  onChange={(e) => setMcpUrl(e.target.value)}
                  className="text-xs"
                />
              </div>
              <Button
                size="sm"
                onClick={async () => {
                  if (mcpName.trim() && mcpUrl.trim()) {
                    setMcpAdding(true);
                    await addMCPServer(mcpName.trim(), mcpUrl.trim());
                    setMcpName("");
                    setMcpUrl("");
                    setMcpAdding(false);
                  }
                }}
                disabled={!mcpName.trim() || !mcpUrl.trim() || mcpAdding}
              >
                {mcpAdding ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="mr-1 h-3 w-3" />
                )}
                サーバーを追加
              </Button>
            </div>

            {/* Server list */}
            {mcpServers.length > 0 ? (
              <div className="space-y-2">
                {mcpServers.map((server: MCPServer) => (
                  <div
                    key={server.id}
                    className="rounded-lg border p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {server.name}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              server.status === "connected"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : server.status === "connecting"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : server.status === "error"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {server.status === "connecting" && (
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            )}
                            {server.status === "connected"
                              ? "接続済み"
                              : server.status === "connecting"
                                ? "接続中..."
                                : server.status === "error"
                                  ? "エラー"
                                  : "未接続"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {server.url}
                        </p>
                        {server.status === "connected" && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            ツール: {server.tools.length} / リソース:{" "}
                            {server.resources.length} / プロンプト:{" "}
                            {server.prompts.length}
                          </p>
                        )}
                        {server.error && (
                          <p className="text-xs text-red-500 mt-0.5">
                            {server.error}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => refreshMCPServer(server.id)}
                          disabled={server.status === "connecting"}
                        >
                          <RefreshCw
                            className={`h-3 w-3 ${server.status === "connecting" ? "animate-spin" : ""}`}
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeMCPServer(server.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Expandable tools list */}
                    {server.tools.length > 0 && (
                      <div>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() =>
                            setMcpExpandedId(
                              mcpExpandedId === server.id ? null : server.id
                            )
                          }
                        >
                          {mcpExpandedId === server.id ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                          ツール一覧
                        </button>
                        {mcpExpandedId === server.id && (
                          <div className="mt-1 space-y-1 pl-4">
                            {server.tools.map((tool) => (
                              <div
                                key={tool.name}
                                className="rounded border px-2 py-1"
                              >
                                <p className="text-xs font-medium font-mono">
                                  {tool.name}
                                </p>
                                {tool.description && (
                                  <p className="text-[11px] text-muted-foreground">
                                    {tool.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-2">
                MCPサーバーが登録されていません
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              MCPサーバーに接続すると、サーバーが提供するツール・リソース・プロンプトを利用できます
            </p>
          </CardContent>
        </Card>

        {/* ===== Section 4: App Info ===== */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              アプリ情報
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">アプリ名</dt>
                <dd className="font-medium">
                  生成UI - AIドリブンUIジェネレーター
                </dd>
              </div>
              <Separator />
              <div className="flex justify-between">
                <dt className="text-muted-foreground">バージョン</dt>
                <dd className="font-medium">1.0.0</dd>
              </div>
              <Separator />
              <div className="flex justify-between">
                <dt className="text-muted-foreground">技術スタック</dt>
                <dd className="font-medium">Next.js 16, React 19, AI SDK v6</dd>
              </div>
              <Separator />
              <div className="flex justify-between">
                <dt className="text-muted-foreground">機能数</dt>
                <dd className="font-medium">24+</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </main>

      {/* Confirmation Dialog Overlay */}
      {confirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmTarget(null);
          }}
        >
          <div className="mx-4 w-full max-w-sm rounded-xl border bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">データの削除</h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              {confirmLabels[confirmTarget]}を削除します。この操作は元に戻せません。よろしいですか？
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmTarget(null)}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleClear(confirmTarget)}
              >
                削除する
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
