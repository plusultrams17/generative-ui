"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  useProposalStore,
  STATUS_LABELS,
  type Proposal,
  type ProposalItem,
  type ProposalStatus,
} from "@/stores/proposal-store";
import { useClientStore } from "@/stores/client-store";
import { useProjectStore } from "@/stores/project-store";
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  Search,
  Copy,
  Eye,
  Pencil,
  X,
} from "lucide-react";

type ViewMode = "list" | "edit" | "preview";

const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  accepted: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function formatCurrency(amount: number): string {
  return "\u00a5" + amount.toLocaleString("ja-JP");
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function generateItemId(): string {
  return "item-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

// ─── List View ───

function ProposalList({
  onEdit,
  onPreview,
}: {
  onEdit: (p: Proposal) => void;
  onPreview: (p: Proposal) => void;
}) {
  const proposals = useProposalStore((s) => s.proposals);
  const deleteProposal = useProposalStore((s) => s.deleteProposal);
  const duplicateProposal = useProposalStore((s) => s.duplicateProposal);
  const clients = useClientStore((s) => s.clients);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "all">("all");

  const clientMap = useMemo(() => {
    const m = new Map<string, string>();
    clients.forEach((c) => m.set(c.id, c.companyName));
    return m;
  }, [clients]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return proposals.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      const clientName = clientMap.get(p.clientId) ?? "";
      return (
        p.title.toLowerCase().includes(q) ||
        clientName.toLowerCase().includes(q)
      );
    });
  }, [proposals, search, statusFilter, clientMap]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="タイトル・クライアント名で検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-56 pl-8 text-xs"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as ProposalStatus | "all")}
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="draft">下書き</SelectItem>
              <SelectItem value="sent">送付済</SelectItem>
              <SelectItem value="accepted">承認済</SelectItem>
              <SelectItem value="rejected">却下</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">{filtered.length}件</span>
        </div>
        <Button
          size="sm"
          onClick={() =>
            onEdit({
              id: "",
              projectId: "",
              clientId: "",
              title: "",
              summary: "",
              items: [{ id: generateItemId(), description: "", hours: 0, rate: 0, subtotal: 0 }],
              taxRate: 10,
              totalAmount: 0,
              status: "draft",
              createdAt: 0,
              updatedAt: 0,
            })
          }
          className="gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          新規作成
        </Button>
      </div>

      <Card>
        <CardContent className="pt-4">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              提案書がありません
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">タイトル</th>
                    <th className="pb-2 pr-4">クライアント</th>
                    <th className="pb-2 pr-4 text-right">金額</th>
                    <th className="pb-2 pr-4">ステータス</th>
                    <th className="pb-2 pr-4">作成日</th>
                    <th className="pb-2 text-right">アクション</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2.5 pr-4 font-medium">{p.title}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {clientMap.get(p.clientId) ?? "不明"}
                      </td>
                      <td className="py-2.5 pr-4 text-right font-mono text-xs">
                        {formatCurrency(p.totalAmount)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[p.status]}`}
                        >
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => onPreview(p)}
                            title="プレビュー"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => onEdit(p)}
                            title="編集"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => duplicateProposal(p.id)}
                            title="複製"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive"
                            onClick={() => deleteProposal(p.id)}
                            title="削除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Edit View ───

function ProposalEditor({
  initial,
  onBack,
}: {
  initial: Proposal;
  onBack: () => void;
}) {
  const addProposal = useProposalStore((s) => s.addProposal);
  const updateProposal = useProposalStore((s) => s.updateProposal);
  const calcTotal = useProposalStore((s) => s.calculateTotal);
  const clients = useClientStore((s) => s.clients);
  const projects = useProjectStore((s) => s.projects);

  const isNew = !initial.id;

  const [title, setTitle] = useState(initial.title);
  const [summary, setSummary] = useState(initial.summary);
  const [clientId, setClientId] = useState(initial.clientId);
  const [projectId, setProjectId] = useState(initial.projectId);
  const [items, setItems] = useState<ProposalItem[]>(
    initial.items.length > 0
      ? initial.items
      : [{ id: generateItemId(), description: "", hours: 0, rate: 0, subtotal: 0 }]
  );
  const [taxRate, setTaxRate] = useState(initial.taxRate);
  const [discount, setDiscount] = useState(initial.discount ?? 0);
  const [status, setStatus] = useState<ProposalStatus>(initial.status);
  const [validUntil, setValidUntil] = useState(
    initial.validUntil
      ? new Date(initial.validUntil).toISOString().split("T")[0]
      : ""
  );
  const [notes, setNotes] = useState(initial.notes ?? "");

  const filteredProjects = useMemo(
    () => (clientId ? projects.filter((p) => p.clientId === clientId) : projects),
    [clientId, projects]
  );

  const updateItem = useCallback(
    (id: string, field: keyof ProposalItem, value: string | number) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          const updated = { ...item, [field]: value };
          updated.subtotal = updated.hours * updated.rate;
          return updated;
        })
      );
    },
    []
  );

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { id: generateItemId(), description: "", hours: 0, rate: 0, subtotal: 0 },
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const subtotalSum = useMemo(
    () => items.reduce((sum, i) => sum + i.hours * i.rate, 0),
    [items]
  );
  const discountedSum = subtotalSum - discount;
  const taxAmount = discountedSum * (taxRate / 100);
  const grandTotal = Math.max(0, discountedSum + taxAmount);

  function handleSave() {
    if (!title.trim()) return;
    const payload = {
      projectId,
      clientId,
      title: title.trim(),
      summary: summary.trim(),
      items,
      taxRate,
      discount: discount > 0 ? discount : undefined,
      status,
      validUntil: validUntil ? new Date(validUntil).getTime() : undefined,
      notes: notes.trim() || undefined,
    };
    if (isNew) {
      addProposal(payload);
    } else {
      updateProposal(initial.id, payload);
    }
    onBack();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          一覧に戻る
        </Button>
        <Button size="sm" onClick={handleSave} disabled={!title.trim()}>
          {isNew ? "作成" : "保存"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {isNew ? "新規提案書" : "提案書を編集"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Client & Project */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">クライアント</label>
              <Select value={clientId || "_none"} onValueChange={(v) => { setClientId(v === "_none" ? "" : v); setProjectId(""); }}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">-- 未選択 --</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">プロジェクト</label>
              <Select value={projectId || "_none"} onValueChange={(v) => setProjectId(v === "_none" ? "" : v)}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">-- 未選択 --</SelectItem>
                  {filteredProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium">タイトル</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="提案書タイトル"
              className="text-sm"
            />
          </div>

          {/* Summary */}
          <div className="space-y-1">
            <label className="text-xs font-medium">概要</label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="提案概要..."
              rows={2}
              className="text-sm"
            />
          </div>

          <Separator />

          {/* Items table */}
          <div className="space-y-2">
            <label className="text-xs font-medium">見積明細</label>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-2">作業内容</th>
                    <th className="pb-2 pr-2 w-20 text-right">工数(h)</th>
                    <th className="pb-2 pr-2 w-28 text-right">単価(\u00a5)</th>
                    <th className="pb-2 pr-2 w-28 text-right">小計</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-1.5 pr-2">
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          placeholder="作業内容..."
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <Input
                          type="number"
                          min={0}
                          value={item.hours || ""}
                          onChange={(e) => updateItem(item.id, "hours", Number(e.target.value) || 0)}
                          className="h-8 text-xs text-right"
                        />
                      </td>
                      <td className="py-1.5 pr-2">
                        <Input
                          type="number"
                          min={0}
                          value={item.rate || ""}
                          onChange={(e) => updateItem(item.id, "rate", Number(e.target.value) || 0)}
                          className="h-8 text-xs text-right"
                        />
                      </td>
                      <td className="py-1.5 pr-2 text-right font-mono text-xs whitespace-nowrap">
                        {formatCurrency(item.hours * item.rate)}
                      </td>
                      <td className="py-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length <= 1}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" onClick={addItem} className="gap-1 text-xs">
              <Plus className="h-3 w-3" />
              行を追加
            </Button>
          </div>

          <Separator />

          {/* Tax, Discount, Total */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">税率(%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">割引額(\u00a5)</label>
              <Input
                type="number"
                min={0}
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">ステータス</label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProposalStatus)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">下書き</SelectItem>
                  <SelectItem value="sent">送付済</SelectItem>
                  <SelectItem value="accepted">承認済</SelectItem>
                  <SelectItem value="rejected">却下</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Totals breakdown */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">小計合計</span>
                <span className="font-mono">{formatCurrency(subtotalSum)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">割引</span>
                  <span className="font-mono text-red-500">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">税額({taxRate}%)</span>
                <span className="font-mono">{formatCurrency(Math.round(taxAmount))}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-bold pt-1">
                <span>総合計</span>
                <span className="font-mono">{formatCurrency(Math.round(grandTotal))}</span>
              </div>
            </CardContent>
          </Card>

          {/* Valid Until & Notes */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">有効期限</label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">備考</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="備考・補足事項..."
              rows={3}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Preview View ───

function ProposalPreview({
  proposal,
  onBack,
  onEdit,
}: {
  proposal: Proposal;
  onBack: () => void;
  onEdit: () => void;
}) {
  const duplicateProposal = useProposalStore((s) => s.duplicateProposal);
  const clients = useClientStore((s) => s.clients);

  const client = clients.find((c) => c.id === proposal.clientId);
  const subtotalSum = proposal.items.reduce((s, i) => s + i.subtotal, 0);
  const discounted = subtotalSum - (proposal.discount ?? 0);
  const taxAmount = discounted * (proposal.taxRate / 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
          <ArrowLeft className="h-3.5 w-3.5" />
          一覧に戻る
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1">
            <Pencil className="h-3 w-3" />
            編集
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => duplicateProposal(proposal.id)}
            className="gap-1"
          >
            <Copy className="h-3 w-3" />
            複製
          </Button>
        </div>
      </div>

      {/* Formal preview card */}
      <Card className="mx-auto max-w-3xl">
        <CardContent className="py-8 px-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{proposal.title}</h2>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>作成日: {formatDate(proposal.createdAt)}</span>
              {proposal.validUntil && (
                <span>有効期限: {formatDate(proposal.validUntil)}</span>
              )}
            </div>
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[proposal.status]}`}
            >
              {STATUS_LABELS[proposal.status]}
            </span>
          </div>

          <Separator />

          {/* Client info */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-1">
              クライアント
            </h3>
            {client ? (
              <div className="space-y-0.5">
                <p className="text-sm font-medium">{client.companyName}</p>
                <p className="text-xs text-muted-foreground">
                  {client.contactName} 様
                </p>
                {client.email && (
                  <p className="text-xs text-muted-foreground">{client.email}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">不明</p>
            )}
          </div>

          {/* Summary */}
          {proposal.summary && (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground mb-1">
                概要
              </h3>
              <p className="text-sm leading-relaxed">{proposal.summary}</p>
            </div>
          )}

          <Separator />

          {/* Items table */}
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-2">
              見積明細
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded">
                <thead>
                  <tr className="bg-muted/50 text-xs">
                    <th className="border-b px-3 py-2 text-left">作業内容</th>
                    <th className="border-b px-3 py-2 text-right w-20">工数(h)</th>
                    <th className="border-b px-3 py-2 text-right w-28">単価</th>
                    <th className="border-b px-3 py-2 text-right w-28">小計</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.items.map((item, i) => (
                    <tr
                      key={item.id}
                      className={i % 2 === 1 ? "bg-muted/20" : ""}
                    >
                      <td className="border-b px-3 py-2">{item.description || "--"}</td>
                      <td className="border-b px-3 py-2 text-right font-mono">
                        {item.hours}
                      </td>
                      <td className="border-b px-3 py-2 text-right font-mono">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="border-b px-3 py-2 text-right font-mono">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">小計合計</span>
                <span className="font-mono">{formatCurrency(subtotalSum)}</span>
              </div>
              {(proposal.discount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">割引</span>
                  <span className="font-mono text-red-500">
                    -{formatCurrency(proposal.discount!)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  税額({proposal.taxRate}%)
                </span>
                <span className="font-mono">
                  {formatCurrency(Math.round(taxAmount))}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold pt-1">
                <span>総合計</span>
                <span className="font-mono">
                  {formatCurrency(Math.round(proposal.totalAmount))}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {proposal.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-xs font-medium text-muted-foreground mb-1">
                  備考
                </h3>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {proposal.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page Root ───

export default function ProposalsPage() {
  const [mode, setMode] = useState<ViewMode>("list");
  const [editing, setEditing] = useState<Proposal | null>(null);
  const [previewing, setPreviewing] = useState<Proposal | null>(null);

  // Re-fetch from store when returning to preview from edit
  const proposals = useProposalStore((s) => s.proposals);

  function handleEdit(p: Proposal) {
    setEditing(p);
    setMode("edit");
  }

  function handlePreview(p: Proposal) {
    setPreviewing(p);
    setMode("preview");
  }

  function handleBack() {
    setEditing(null);
    setPreviewing(null);
    setMode("list");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="戻る">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">提案書 / 見積書</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {mode === "list" && (
          <ProposalList onEdit={handleEdit} onPreview={handlePreview} />
        )}
        {mode === "edit" && editing && (
          <ProposalEditor initial={editing} onBack={handleBack} />
        )}
        {mode === "preview" && previewing && (
          <ProposalPreview
            proposal={
              proposals.find((p) => p.id === previewing.id) ?? previewing
            }
            onBack={handleBack}
            onEdit={() => {
              const fresh = proposals.find((p) => p.id === previewing.id);
              if (fresh) handleEdit(fresh);
            }}
          />
        )}
      </main>
    </div>
  );
}
