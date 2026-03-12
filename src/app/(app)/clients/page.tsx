"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  useClientStore,
  STATUS_LABELS,
  type Client,
  type ClientStatus,
} from "@/stores/client-store";
import { ProGate } from "@/components/shared/pro-gate";
import {
  ArrowLeft,
  Building2,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  Check,
  Users,
} from "lucide-react";

function StatusBadge({ status }: { status: ClientStatus }) {
  const variants: Record<ClientStatus, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    prospect: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${variants[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function AddClientDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const addClient = useClientStore((s) => s.addClient);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<ClientStatus>("prospect");
  const [error, setError] = useState("");

  function reset() {
    setCompanyName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setIndustry("");
    setNotes("");
    setStatus("prospect");
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !email.trim()) return;
    const result = addClient({
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      industry: industry.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
    });
    if (!result) {
      setError("クライアント数が上限（200件）に達しています");
      return;
    }
    reset();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">新規クライアント追加</h2>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">会社名 *</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="株式会社..."
                className="text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">担当者名 *</label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="山田太郎"
                className="text-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">メールアドレス *</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="text-sm"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">電話番号</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03-1234-5678"
                className="text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">業種</label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="IT・通信"
                className="text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">ステータス</label>
              <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">アクティブ</SelectItem>
                  <SelectItem value="inactive">非アクティブ</SelectItem>
                  <SelectItem value="prospect">見込み</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">メモ</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="備考があれば入力..."
              className="text-sm"
              rows={2}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
              キャンセル
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!companyName.trim() || !contactName.trim() || !email.trim()}
            >
              <Plus className="mr-1 h-3 w-3" />
              追加
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditableRow({
  client,
  onCancel,
}: {
  client: Client;
  onCancel: () => void;
}) {
  const updateClient = useClientStore((s) => s.updateClient);
  const [companyName, setCompanyName] = useState(client.companyName);
  const [contactName, setContactName] = useState(client.contactName);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone ?? "");
  const [industry, setIndustry] = useState(client.industry ?? "");
  const [notes, setNotes] = useState(client.notes ?? "");
  const [status, setStatus] = useState<ClientStatus>(client.status);

  function handleSave() {
    if (!companyName.trim() || !contactName.trim() || !email.trim()) return;
    updateClient(client.id, {
      companyName: companyName.trim(),
      contactName: contactName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      industry: industry.trim() || undefined,
      notes: notes.trim() || undefined,
      status,
    });
    onCancel();
  }

  return (
    <tr className="border-b last:border-0 bg-muted/30">
      <td className="py-2 pr-2">
        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="h-7 text-xs" />
      </td>
      <td className="py-2 pr-2">
        <Input value={contactName} onChange={(e) => setContactName(e.target.value)} className="h-7 text-xs" />
      </td>
      <td className="py-2 pr-2">
        <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">アクティブ</SelectItem>
            <SelectItem value="inactive">非アクティブ</SelectItem>
            <SelectItem value="prospect">見込み</SelectItem>
          </SelectContent>
        </Select>
      </td>
      <td className="py-2 pr-2">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-7 text-xs" />
      </td>
      <td className="py-2 pr-2 text-xs text-muted-foreground whitespace-nowrap">
        {new Date(client.updatedAt).toLocaleDateString("ja-JP")}
      </td>
      <td className="py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-green-600"
            onClick={handleSave}
            disabled={!companyName.trim() || !contactName.trim() || !email.trim()}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function ClientsPage() {
  const clients = useClientStore((s) => s.clients);
  const removeClient = useClientStore((s) => s.removeClient);
  const searchClients = useClientStore((s) => s.searchClients);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      searchClients(query, statusFilter).sort(
        (a, b) => b.updatedAt - a.updatedAt
      ),
    [clients, query, statusFilter, searchClients]
  );

  const counts = useMemo(() => {
    const all = clients.length;
    const active = clients.filter((c) => c.status === "active").length;
    const inactive = clients.filter((c) => c.status === "inactive").length;
    const prospect = clients.filter((c) => c.status === "prospect").length;
    return { all, active, inactive, prospect };
  }, [clients]);

  function handleDelete(id: string) {
    if (deleteConfirm === id) {
      removeClient(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  }

  return (
    <ProGate feature="clients" fallbackTitle="クライアント管理" fallbackDescription="クライアント管理はProプランでご利用いただけます。顧客情報の一元管理、ステータス追跡が可能です。">
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label="戻る">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Building2 className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">クライアント管理</h1>
          <div className="flex-1" />
          <Button size="sm" onClick={() => setShowDialog(true)} className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            新規追加
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">全クライアント</p>
              <p className="text-lg font-bold">{counts.all}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">アクティブ</p>
              <p className="text-lg font-bold text-green-600">{counts.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">見込み</p>
              <p className="text-lg font-bold text-blue-600">{counts.prospect}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">非アクティブ</p>
              <p className="text-lg font-bold text-gray-500">{counts.inactive}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="会社名・担当者・メールで検索..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 w-64 pl-8 text-xs"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ClientStatus | "all")}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">アクティブ</SelectItem>
                <SelectItem value="inactive">非アクティブ</SelectItem>
                <SelectItem value="prospect">見込み</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-muted-foreground">
            {filtered.length}件表示
          </span>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="pt-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {clients.length === 0
                    ? "クライアントがまだ登録されていません"
                    : "条件に一致するクライアントがありません"}
                </p>
                {clients.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-1.5 text-xs"
                    onClick={() => setShowDialog(true)}
                  >
                    <Plus className="h-3 w-3" />
                    最初のクライアントを追加
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 pr-4">会社名</th>
                      <th className="pb-2 pr-4">担当者</th>
                      <th className="pb-2 pr-4">ステータス</th>
                      <th className="pb-2 pr-4">メール</th>
                      <th className="pb-2 pr-4">最終更新</th>
                      <th className="pb-2 text-right">アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((client) =>
                      editingId === client.id ? (
                        <EditableRow
                          key={client.id}
                          client={client}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : (
                        <tr key={client.id} className="border-b last:border-0">
                          <td className="py-2.5 pr-4 font-medium">{client.companyName}</td>
                          <td className="py-2.5 pr-4 text-muted-foreground">{client.contactName}</td>
                          <td className="py-2.5 pr-4">
                            <StatusBadge status={client.status} />
                          </td>
                          <td className="py-2.5 pr-4 text-xs text-muted-foreground">{client.email}</td>
                          <td className="py-2.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(client.updatedAt).toLocaleDateString("ja-JP")}
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => {
                                  setEditingId(client.id);
                                  setDeleteConfirm(null);
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-7 w-7 p-0 ${deleteConfirm === client.id ? "text-red-500" : ""}`}
                                onClick={() => handleDelete(client.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AddClientDialog open={showDialog} onClose={() => setShowDialog(false)} />
    </div>
    </ProGate>
  );
}
