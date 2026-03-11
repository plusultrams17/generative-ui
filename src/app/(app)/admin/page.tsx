"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { AuthGuard } from "@/components/shared/auth-guard";
import {
  useEnterpriseStore,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  type Role,
  type User,
  type AuditLogEntry,
  type CostEntry,
} from "@/stores/enterprise-store";
import {
  ArrowLeft,
  Shield,
  Users,
  ScrollText,
  DollarSign,
  KeyRound,
  Trash2,
  Download,
  Plus,
  LogOut,
  BarChart3,
} from "lucide-react";

type Tab = "users" | "audit" | "cost" | "sso";

const TABS: { key: Tab; label: string; icon: typeof Users }[] = [
  { key: "users", label: "ユーザー管理", icon: Users },
  { key: "audit", label: "監査ログ", icon: ScrollText },
  { key: "cost", label: "コスト管理", icon: DollarSign },
  { key: "sso", label: "SSO設定", icon: KeyRound },
];

function UsersTab() {
  const users = useEnterpriseStore((s) => s.users);
  const addUser = useEnterpriseStore((s) => s.addUser);
  const updateUserRole = useEnterpriseStore((s) => s.updateUserRole);
  const removeUser = useEnterpriseStore((s) => s.removeUser);
  const currentUser = useEnterpriseStore((s) => s.currentUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("viewer");

  function handleAdd() {
    if (!name.trim() || !email.trim()) return;
    addUser(name.trim(), email.trim(), role);
    setName("");
    setEmail("");
    setRole("viewer");
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ユーザーを追加</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input
              placeholder="名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-sm"
            />
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理者</SelectItem>
                <SelectItem value="editor">編集者</SelectItem>
                <SelectItem value="viewer">閲覧者</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={handleAdd} disabled={!name.trim() || !email.trim()}>
            <Plus className="mr-1 h-3 w-3" />
            追加
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ユーザー一覧 ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">名前</th>
                  <th className="pb-2 pr-4">メール</th>
                  <th className="pb-2 pr-4">ロール</th>
                  <th className="pb-2 text-right">アクション</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium">
                      {user.name}
                      {currentUser?.id === user.id && (
                        <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                          ログイン中
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{user.email}</td>
                    <td className="py-2.5 pr-4">
                      <Select
                        value={user.role}
                        onValueChange={(v) => updateUserRole(user.id, v as Role)}
                      >
                        <SelectTrigger className="h-7 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">管理者</SelectItem>
                          <SelectItem value="editor">編集者</SelectItem>
                          <SelectItem value="viewer">閲覧者</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => removeUser(user.id)}
                        disabled={currentUser?.id === user.id}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ロール別権限</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(Object.entries(ROLE_PERMISSIONS) as [Role, string[]][]).map(([r, perms]) => (
              <div key={r}>
                <p className="text-xs font-medium mb-1">{ROLE_LABELS[r]}</p>
                <div className="flex flex-wrap gap-1">
                  {perms.map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px]">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AuditTab() {
  const auditLog = useEnterpriseStore((s) => s.auditLog);
  const clearAuditLog = useEnterpriseStore((s) => s.clearAuditLog);
  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState("");

  const filtered = actionFilter
    ? auditLog.filter((e) => e.action.includes(actionFilter))
    : auditLog;
  const sorted = [...filtered].reverse();
  const pageSize = 20;
  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageItems = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function handleExport() {
    const blob = new Blob([JSON.stringify(auditLog, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="アクションでフィルター..."
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className="h-8 w-48 text-xs"
          />
          <span className="text-xs text-muted-foreground">{filtered.length}件</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={auditLog.length === 0}>
            <Download className="mr-1 h-3 w-3" />
            エクスポート
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAuditLog} disabled={auditLog.length === 0}>
            クリア
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          {pageItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">監査ログがありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">日時</th>
                    <th className="pb-2 pr-4">ユーザー</th>
                    <th className="pb-2 pr-4">アクション</th>
                    <th className="pb-2 pr-4">対象</th>
                    <th className="pb-2">詳細</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((entry: AuditLogEntry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleString("ja-JP", {
                          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 pr-4 text-xs">{entry.userName}</td>
                      <td className="py-2 pr-4">
                        <Badge variant="outline" className="text-[10px]">{entry.action}</Badge>
                      </td>
                      <td className="py-2 pr-4 text-xs">{entry.target}</td>
                      <td className="py-2 text-xs text-muted-foreground">{entry.details ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                前へ
              </Button>
              <span className="text-xs text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>
                次へ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CostTab() {
  const costEntries = useEnterpriseStore((s) => s.costEntries);
  const getCostSummary = useEnterpriseStore((s) => s.getCostSummary);
  const generateDemoCosts = useEnterpriseStore((s) => s.generateDemoCosts);
  const summary = getCostSummary();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">合計コスト</p>
            <p className="text-lg font-bold">${summary.totalCost.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">今月</p>
            <p className="text-lg font-bold">${summary.lastMonthCost.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">モデル数</p>
            <p className="text-lg font-bold">{Object.keys(summary.byModel).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">エントリ数</p>
            <p className="text-lg font-bold">{costEntries.length}</p>
          </CardContent>
        </Card>
      </div>

      {Object.keys(summary.byModel).length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">モデル別コスト</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(summary.byModel)
                .sort(([, a], [, b]) => b - a)
                .map(([model, cost]) => (
                  <div key={model} className="flex items-center justify-between">
                    <span className="text-xs font-mono">{model}</span>
                    <span className="text-xs font-medium">${cost.toFixed(2)}</span>
                  </div>
                ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">エージェント別コスト</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(summary.byAgent).length > 0 ? (
                Object.entries(summary.byAgent)
                  .sort(([, a], [, b]) => b - a)
                  .map(([agent, cost]) => (
                    <div key={agent} className="flex items-center justify-between">
                      <span className="text-xs">{agent}</span>
                      <span className="text-xs font-medium">${cost.toFixed(2)}</span>
                    </div>
                  ))
              ) : (
                <p className="text-xs text-muted-foreground">データなし</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={generateDemoCosts}>
          <BarChart3 className="mr-1 h-3 w-3" />
          デモデータ生成
        </Button>
      </div>

      {costEntries.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">日時</th>
                    <th className="pb-2 pr-4">モデル</th>
                    <th className="pb-2 pr-4">トークン</th>
                    <th className="pb-2 pr-4">コスト</th>
                    <th className="pb-2">エージェント</th>
                  </tr>
                </thead>
                <tbody>
                  {[...costEntries].reverse().slice(0, 20).map((entry: CostEntry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleDateString("ja-JP", {
                          month: "short", day: "numeric",
                        })}
                      </td>
                      <td className="py-2 pr-4 text-xs font-mono">{entry.model}</td>
                      <td className="py-2 pr-4 text-xs">
                        {entry.tokens.input.toLocaleString()} / {entry.tokens.output.toLocaleString()}
                      </td>
                      <td className="py-2 pr-4 text-xs font-medium">${entry.cost.toFixed(2)}</td>
                      <td className="py-2 text-xs text-muted-foreground">{entry.agentName ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SSOTab() {
  const ssoConfig = useEnterpriseStore((s) => s.ssoConfig);
  const setSSOConfig = useEnterpriseStore((s) => s.setSSOConfig);
  const addAuditLog = useEnterpriseStore((s) => s.addAuditLog);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">シングルサインオン設定</CardTitle>
        <CardDescription className="text-xs">
          SAML/OIDCプロバイダーを設定してエンタープライズSSOを有効化します
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium">プロバイダー</label>
          <Select
            value={ssoConfig.provider}
            onValueChange={(v) => setSSOConfig({ provider: v as "none" | "saml" | "oidc" })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">なし</SelectItem>
              <SelectItem value="saml">SAML 2.0</SelectItem>
              <SelectItem value="oidc">OpenID Connect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {ssoConfig.provider !== "none" && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-medium">Issuer URL</label>
              <Input
                value={ssoConfig.issuerUrl}
                onChange={(e) => setSSOConfig({ issuerUrl: e.target.value })}
                placeholder="https://auth.example.com"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Client ID</label>
              <Input
                value={ssoConfig.clientId}
                onChange={(e) => setSSOConfig({ clientId: e.target.value })}
                placeholder="client-id"
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sso-enabled"
                checked={ssoConfig.enabled}
                onChange={(e) => setSSOConfig({ enabled: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="sso-enabled" className="text-sm cursor-pointer">
                SSOを有効にする
              </label>
            </div>
          </>
        )}

        <Separator />

        <Button
          size="sm"
          onClick={() => {
            addAuditLog("SSO設定変更", ssoConfig.provider, ssoConfig.enabled ? "有効" : "無効");
          }}
        >
          保存
        </Button>

        <p className="text-xs text-muted-foreground">
          実際のSSO認証はNextAuth.jsとの統合で実装されます。現在はプロトタイプ設定画面です。
        </p>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const currentUser = useEnterpriseStore((s) => s.currentUser);
  const setCurrentUser = useEnterpriseStore((s) => s.setCurrentUser);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="戻る">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">管理ダッシュボード</h1>
          <div className="flex-1" />
          {currentUser && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {currentUser.name} ({ROLE_LABELS[currentUser.role]})
              </span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentUser(null)} className="h-7 gap-1 text-xs">
                <LogOut className="h-3 w-3" />
                ログアウト
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <AuthGuard permission="view-audit">
          <div className="mb-6 flex flex-wrap gap-1">
            {TABS.map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                className="gap-1.5 text-xs"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </Button>
            ))}
          </div>

          {activeTab === "users" && <UsersTab />}
          {activeTab === "audit" && <AuditTab />}
          {activeTab === "cost" && <CostTab />}
          {activeTab === "sso" && <SSOTab />}
        </AuthGuard>
      </main>
    </div>
  );
}
