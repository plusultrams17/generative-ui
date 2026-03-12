"use client";

import {
  useProjectStore,
  type Project,
  type ProjectStatus,
} from "@/stores/project-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Kanban,
  List,
  Trash2,
  Calendar,
  DollarSign,
  FolderOpen,
  Palette,
} from "lucide-react";
import { useClientStore } from "@/stores/client-store";
import { useBrandingStore } from "@/stores/branding-store";
import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ProGate } from "@/components/shared/pro-gate";

const STATUS_CONFIG: {
  key: ProjectStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    key: "proposal",
    label: "提案中",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    key: "in_progress",
    label: "制作中",
    color: "text-yellow-700 dark:text-yellow-300",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/40",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  {
    key: "review",
    label: "レビュー",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-50 dark:bg-purple-950/40",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  {
    key: "delivered",
    label: "納品済",
    color: "text-green-700 dark:text-green-300",
    bgColor: "bg-green-50 dark:bg-green-950/40",
    borderColor: "border-green-200 dark:border-green-800",
  },
  {
    key: "archived",
    label: "アーカイブ",
    color: "text-gray-700 dark:text-gray-300",
    bgColor: "bg-gray-50 dark:bg-gray-950/40",
    borderColor: "border-gray-200 dark:border-gray-800",
  },
];

const STATUS_BADGE_COLORS: Record<ProjectStatus, string> = {
  proposal: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  in_progress:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  review:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  delivered:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  archived:
    "bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300",
};

function getStatusLabel(status: ProjectStatus): string {
  return STATUS_CONFIG.find((s) => s.key === status)?.label ?? status;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("ja-JP");
}

function formatBudget(budget: number): string {
  if (budget >= 10000) {
    return `${(budget / 10000).toFixed(budget % 10000 === 0 ? 0 : 1)}万円`;
  }
  return `${budget.toLocaleString()}円`;
}

function useClients(): { id: string; companyName: string }[] {
  return useClientStore((s) => s.clients);
}

function getClientName(
  clients: { id: string; companyName: string }[],
  clientId: string
): string {
  const client = clients.find((c) => c.id === clientId);
  return client?.companyName ?? "不明なクライアント";
}

// --- Create Modal ---
function CreateProjectModal({
  open,
  onClose,
  clients,
}: {
  open: boolean;
  onClose: () => void;
  clients: { id: string; companyName: string }[];
}) {
  const addProject = useProjectStore((s) => s.addProject);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("proposal");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("案件名を入力してください");
      return;
    }
    if (!clientId) {
      toast.error("クライアントを選択してください");
      return;
    }
    addProject({
      name: name.trim(),
      clientId,
      description: description.trim() || undefined,
      status,
      deadline: deadline ? new Date(deadline).getTime() : undefined,
      budget: budget ? Number(budget) : undefined,
    });
    toast.success("プロジェクトを作成しました");
    setName("");
    setClientId("");
    setDescription("");
    setStatus("proposal");
    setDeadline("");
    setBudget("");
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-lg border bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">新規プロジェクト</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">案件名 *</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="案件名を入力"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-client">クライアント *</Label>
            {clients.length > 0 ? (
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="クライアントを選択" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <Input
                  id="project-client"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="クライアントIDを入力"
                />
                <p className="text-xs text-muted-foreground">
                  クライアント管理でクライアントを追加するとドロップダウンで選択できます
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-desc">概要</Label>
            <Textarea
              id="project-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="プロジェクトの概要"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-status">ステータス</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ProjectStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_CONFIG.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-deadline">期限</Label>
              <Input
                id="project-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-budget">予算 (円)</Label>
            <Input
              id="project-budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="例: 500000"
              min="0"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit">作成</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const FONT_OPTIONS = [
  { value: "", label: "デフォルト" },
  { value: "Noto Sans JP", label: "Noto Sans JP" },
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "M PLUS 1p", label: "M PLUS 1p" },
  { value: "Zen Kaku Gothic New", label: "Zen Kaku Gothic New" },
];

// --- Branding Modal ---
function BrandingModal({
  open,
  onClose,
  projectId,
  projectName,
}: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}) {
  const existing = useBrandingStore((s) => s.getConfigByProjectId(projectId));
  const addConfig = useBrandingStore((s) => s.addConfig);
  const updateConfig = useBrandingStore((s) => s.updateConfig);
  const deleteConfig = useBrandingStore((s) => s.deleteConfig);

  const [companyName, setCompanyName] = useState(existing?.companyName ?? "");
  const [primaryColor, setPrimaryColor] = useState(
    existing?.primaryColor ?? "#3b82f6"
  );
  const [secondaryColor, setSecondaryColor] = useState(
    existing?.secondaryColor ?? "#6366f1"
  );
  const [accentColor, setAccentColor] = useState(
    existing?.accentColor ?? "#f59e0b"
  );
  const [fontFamily, setFontFamily] = useState(existing?.fontFamily ?? "");
  const [footerText, setFooterText] = useState(existing?.footerText ?? "");

  const handleSave = useCallback(() => {
    if (!companyName.trim()) {
      toast.error("会社名を入力してください");
      return;
    }
    if (existing) {
      updateConfig(existing.id, {
        companyName: companyName.trim(),
        primaryColor,
        secondaryColor: secondaryColor || undefined,
        accentColor: accentColor || undefined,
        fontFamily: fontFamily || undefined,
        footerText: footerText.trim() || undefined,
      });
    } else {
      addConfig({
        projectId,
        companyName: companyName.trim(),
        primaryColor,
        secondaryColor: secondaryColor || undefined,
        accentColor: accentColor || undefined,
        fontFamily: fontFamily || undefined,
        footerText: footerText.trim() || undefined,
      });
    }
    toast.success("ブランド設定を保存しました");
    onClose();
  }, [
    companyName,
    primaryColor,
    secondaryColor,
    accentColor,
    fontFamily,
    footerText,
    existing,
    projectId,
    addConfig,
    updateConfig,
    onClose,
  ]);

  const handleDelete = useCallback(() => {
    if (existing) {
      deleteConfig(existing.id);
      toast.success("ブランド設定を削除しました");
      onClose();
    }
  }, [existing, deleteConfig, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-lg border bg-background p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">ブランド設定</h2>
            <p className="text-xs text-muted-foreground">{projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-company">会社名 *</Label>
            <Input
              id="brand-company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="会社名を入力"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="brand-primary">メインカラー</Label>
              <div className="flex items-center gap-2">
                <input
                  id="brand-primary"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border bg-transparent p-0.5"
                />
                <span className="text-xs text-muted-foreground">
                  {primaryColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-secondary">サブカラー</Label>
              <div className="flex items-center gap-2">
                <input
                  id="brand-secondary"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border bg-transparent p-0.5"
                />
                <span className="text-xs text-muted-foreground">
                  {secondaryColor}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-accent">アクセント</Label>
              <div className="flex items-center gap-2">
                <input
                  id="brand-accent"
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border bg-transparent p-0.5"
                />
                <span className="text-xs text-muted-foreground">
                  {accentColor}
                </span>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-md border p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              カラープレビュー
            </p>
            <div className="flex gap-2">
              <div
                className="h-8 flex-1 rounded"
                style={{ backgroundColor: primaryColor }}
              />
              <div
                className="h-8 flex-1 rounded"
                style={{ backgroundColor: secondaryColor }}
              />
              <div
                className="h-8 flex-1 rounded"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-font">フォント</Label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="フォントを選択" />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((f) => (
                  <SelectItem key={f.value || "_default"} value={f.value || "_default"}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-footer">フッターテキスト</Label>
            <Input
              id="brand-footer"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="例: (c) 2026 Company Inc."
            />
          </div>

          <div className="flex justify-between pt-2">
            <div>
              {existing && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  削除
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
              <Button type="button" onClick={handleSave}>
                保存
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Kanban Card ---
function KanbanCard({
  project,
  clientName,
  isFirst,
  isLast,
  onBrandingClick,
}: {
  project: Project;
  clientName: string;
  isFirst: boolean;
  isLast: boolean;
  onBrandingClick: () => void;
}) {
  const moveStatusForward = useProjectStore((s) => s.moveStatusForward);
  const moveStatusBackward = useProjectStore((s) => s.moveStatusBackward);
  const removeProject = useProjectStore((s) => s.removeProject);
  const hasBranding = useBrandingStore(
    (s) => !!s.getConfigByProjectId(project.id)
  );

  const isOverdue =
    project.deadline && project.deadline < Date.now() && project.status !== "delivered" && project.status !== "archived";

  return (
    <Card className="gap-0 py-0 overflow-hidden">
      <CardHeader className="px-3 pb-1 pt-3">
        <div className="flex items-start justify-between gap-1">
          <CardTitle className="text-sm leading-snug">{project.name}</CardTitle>
          {hasBranding && (
            <Badge className="shrink-0 text-[9px] px-1.5 py-0 bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-0">
              ブランド
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{clientName}</p>
      </CardHeader>
      <CardContent className="px-3 pb-2 pt-1">
        {project.deadline && (
          <div
            className={`flex items-center gap-1 text-xs ${
              isOverdue
                ? "text-red-600 dark:text-red-400 font-medium"
                : "text-muted-foreground"
            }`}
          >
            <Calendar className="h-3 w-3" />
            {formatDate(project.deadline)}
            {isOverdue && " (期限超過)"}
          </div>
        )}
        {project.budget != null && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <DollarSign className="h-3 w-3" />
            {formatBudget(project.budget)}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={isFirst}
              onClick={() => moveStatusBackward(project.id)}
              title="前のステータスに移動"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              disabled={isLast}
              onClick={() => moveStatusForward(project.id)}
              title="次のステータスに移動"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
              onClick={onBrandingClick}
              title="ブランド設定"
            >
              <Palette className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-destructive"
              onClick={() => {
                removeProject(project.id);
                toast.success("プロジェクトを削除しました");
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Main Page ---
export default function ProjectsPage() {
  const projects = useProjectStore((s) => s.projects);
  const clients = useClients();

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [brandingTarget, setBrandingTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (clientFilter !== "all" && p.clientId !== clientFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = p.name.toLowerCase();
        const desc = (p.description ?? "").toLowerCase();
        const cName = getClientName(clients, p.clientId).toLowerCase();
        if (!name.includes(q) && !desc.includes(q) && !cName.includes(q))
          return false;
      }
      return true;
    });
  }, [projects, statusFilter, clientFilter, searchQuery, clients]);

  // Group by status for kanban
  const grouped = useMemo(() => {
    const map: Record<ProjectStatus, Project[]> = {
      proposal: [],
      in_progress: [],
      review: [],
      delivered: [],
      archived: [],
    };
    for (const p of filtered) {
      map[p.status].push(p);
    }
    return map;
  }, [filtered]);

  // Unique client IDs for filter
  const clientIds = useMemo(() => {
    const ids = new Set(projects.map((p) => p.clientId));
    return Array.from(ids);
  }, [projects]);

  return (
    <ProGate feature="projects" fallbackTitle="プロジェクト管理" fallbackDescription="プロジェクト管理はProプランでご利用いただけます。案件の進捗管理が可能です。">
      <div className="flex min-h-screen flex-col bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
            <Link href="/">
              <Button variant="ghost" size="icon" aria-label="チャットに戻る">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">プロジェクト管理</h1>
            </div>
            <span className="text-sm text-muted-foreground">
              {filtered.length}件
            </span>
            <div className="flex-1" />

            {/* View toggle */}
            <div className="flex items-center rounded-md border">
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                className="rounded-r-none gap-1.5"
                onClick={() => setViewMode("kanban")}
              >
                <Kanban className="h-3.5 w-3.5" />
                カンバン
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-l-none gap-1.5"
                onClick={() => setViewMode("list")}
              >
                <List className="h-3.5 w-3.5" />
                リスト
              </Button>
            </div>

            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              新規作成
            </Button>
          </div>

          {/* Filters */}
          <div className="mx-auto max-w-7xl space-y-3 px-4 pb-3 sm:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="案件名・概要・クライアントで検索..."
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全てのステータス</SelectItem>
                  {STATUS_CONFIG.map((s) => (
                    <SelectItem key={s.key} value={s.key}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="クライアント" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全てのクライアント</SelectItem>
                  {clientIds.map((cid) => (
                    <SelectItem key={cid} value={cid}>
                      {getClientName(clients, cid)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
          {projects.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">
                プロジェクトがありません
              </p>
              <p className="text-sm text-muted-foreground">
                新規作成ボタンからプロジェクトを追加してください
              </p>
              <Button
                variant="outline"
                className="mt-2 gap-1.5"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                最初のプロジェクトを作成
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            // No results
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-medium text-muted-foreground">
                検索結果がありません
              </p>
              <p className="text-sm text-muted-foreground">
                フィルターや検索条件を変更してください
              </p>
            </div>
          ) : viewMode === "kanban" ? (
            // Kanban view
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {STATUS_CONFIG.map((col, colIdx) => {
                  const items = grouped[col.key];
                  return (
                    <div
                      key={col.key}
                      className={`w-64 shrink-0 rounded-lg border ${col.borderColor} ${col.bgColor} p-3`}
                    >
                      {/* Column header */}
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className={`text-sm font-semibold ${col.color}`}>
                          {col.label}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] ${col.color}`}
                        >
                          {items.length}
                        </Badge>
                      </div>

                      {/* Cards */}
                      <div className="space-y-2">
                        {items.map((project) => (
                          <KanbanCard
                            key={project.id}
                            project={project}
                            clientName={getClientName(clients, project.clientId)}
                            isFirst={colIdx === 0}
                            isLast={colIdx === STATUS_CONFIG.length - 1}
                            onBrandingClick={() => setBrandingTarget({ id: project.id, name: project.name })}
                          />
                        ))}
                        {items.length === 0 && (
                          <p className="py-4 text-center text-xs text-muted-foreground">
                            案件なし
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // List/table view
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">案件名</th>
                    <th className="px-4 py-3 text-left font-medium">
                      クライアント
                    </th>
                    <th className="px-4 py-3 text-left font-medium">
                      ステータス
                    </th>
                    <th className="px-4 py-3 text-left font-medium">期限</th>
                    <th className="px-4 py-3 text-left font-medium">予算</th>
                    <th className="px-4 py-3 text-left font-medium">作成日</th>
                    <th className="px-4 py-3 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => {
                    const isOverdue =
                      project.deadline &&
                      project.deadline < Date.now() &&
                      project.status !== "delivered" &&
                      project.status !== "archived";
                    const colIdx = STATUS_CONFIG.findIndex(
                      (s) => s.key === project.status
                    );
                    return (
                      <TableRow
                        key={project.id}
                        project={project}
                        clientName={getClientName(clients, project.clientId)}
                        isOverdue={!!isOverdue}
                        isFirst={colIdx === 0}
                        isLast={colIdx === STATUS_CONFIG.length - 1}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Create modal */}
        <CreateProjectModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          clients={clients}
        />
      </div>
    </ProGate>
  );
}

// Separate component for table rows to allow hook usage
function TableRow({
  project,
  clientName,
  isOverdue,
  isFirst,
  isLast,
}: {
  project: Project;
  clientName: string;
  isOverdue: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const moveStatusForward = useProjectStore((s) => s.moveStatusForward);
  const moveStatusBackward = useProjectStore((s) => s.moveStatusBackward);
  const removeProject = useProjectStore((s) => s.removeProject);

  return (
    <tr className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div>
          <span className="font-medium">{project.name}</span>
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {project.description}
            </p>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{clientName}</td>
      <td className="px-4 py-3">
        <Badge
          className={`text-[10px] border-0 ${STATUS_BADGE_COLORS[project.status]}`}
        >
          {getStatusLabel(project.status)}
        </Badge>
      </td>
      <td
        className={`px-4 py-3 ${
          isOverdue
            ? "text-red-600 dark:text-red-400 font-medium"
            : "text-muted-foreground"
        }`}
      >
        {project.deadline ? formatDate(project.deadline) : "-"}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {project.budget != null ? formatBudget(project.budget) : "-"}
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {formatDate(project.createdAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isFirst}
            onClick={() => moveStatusBackward(project.id)}
            title="前のステータスに移動"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isLast}
            onClick={() => moveStatusForward(project.id)}
            title="次のステータスに移動"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => {
              removeProject(project.id);
              toast.success("プロジェクトを削除しました");
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
