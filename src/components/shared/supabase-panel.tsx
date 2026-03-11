"use client";

import { useState, useMemo } from "react";
import { Database, Copy, Check, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HighlightedCode } from "@/components/shared/highlighted-code";
import { toast } from "sonner";
import { useSupabaseStore } from "@/stores/supabase-store";
import {
  inferColumnsFromCode,
  generateSupabaseCode,
  type ColumnDef,
} from "@/lib/supabase-generator";

type SupabasePanelProps = {
  code: string;
  componentType: string;
  open: boolean;
  onClose: () => void;
};

const COLUMN_TYPES: ColumnDef["type"][] = [
  "text",
  "integer",
  "boolean",
  "timestamp",
  "jsonb",
  "uuid",
];

type Tab = "sql" | "client" | "crud";

export function SupabasePanel({
  code,
  componentType,
  open,
  onClose,
}: SupabasePanelProps) {
  const { config, setConfig, addMapping } = useSupabaseStore();

  const [tableName, setTableName] = useState("my_table");
  const [columns, setColumns] = useState<ColumnDef[]>(() =>
    inferColumnsFromCode(code)
  );
  const [activeTab, setActiveTab] = useState<Tab>("sql");
  const [copied, setCopied] = useState<string | null>(null);

  const generated = useMemo(
    () => generateSupabaseCode(tableName, columns),
    [tableName, columns]
  );

  if (!open) return null;

  function handleCopy(label: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast.success("コピーしました");
  }

  function updateColumn(index: number, updates: Partial<ColumnDef>) {
    setColumns((prev) =>
      prev.map((col, i) => (i === index ? { ...col, ...updates } : col))
    );
  }

  function removeColumn(index: number) {
    setColumns((prev) => prev.filter((_, i) => i !== index));
  }

  function addColumn() {
    setColumns((prev) => [
      ...prev,
      { name: "new_column", type: "text", nullable: true },
    ]);
  }

  function handleSaveMapping() {
    if (!tableName.trim()) {
      toast.error("テーブル名を入力してください");
      return;
    }
    addMapping({
      componentType,
      tableName: tableName.trim(),
      columns: columns.map((c) => ({
        name: c.name,
        type: c.type,
        nullable: c.nullable,
      })),
    });
    toast.success("マッピングを保存しました");
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "sql", label: "SQL" },
    { key: "client", label: "Client" },
    { key: "crud", label: "CRUD" },
  ];

  function CopyButton({ label, text }: { label: string; text: string }) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => handleCopy(label, text)}
        title="コピー"
      >
        {copied === label ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l bg-background shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span className="text-sm font-semibold">Supabase連携</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onClose}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Connection Config */}
        <section className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">接続設定</p>
          <div className="space-y-2">
            <Input
              className="h-8 text-xs font-mono"
              placeholder="https://xxxxx.supabase.co"
              value={config.url}
              onChange={(e) => setConfig({ url: e.target.value })}
            />
            <Input
              className="h-8 text-xs font-mono"
              type="password"
              placeholder="anon key"
              value={config.anonKey}
              onChange={(e) => setConfig({ anonKey: e.target.value })}
            />
          </div>
        </section>

        {/* Table Name */}
        <section className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            テーブル名
          </p>
          <Input
            className="h-8 text-xs font-mono"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
        </section>

        {/* Columns */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">カラム</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={addColumn}
              title="カラム追加"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-1.5">
            {columns.map((col, i) => {
              const isSystem = col.name === "id" || col.name === "created_at";
              return (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded border px-2 py-1.5"
                >
                  <input
                    className="h-6 flex-1 min-w-0 rounded border-none bg-transparent px-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
                    value={col.name}
                    onChange={(e) => updateColumn(i, { name: e.target.value })}
                    disabled={isSystem}
                  />
                  <select
                    className="h-6 rounded border bg-transparent px-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-ring"
                    value={col.type}
                    onChange={(e) =>
                      updateColumn(i, {
                        type: e.target.value as ColumnDef["type"],
                      })
                    }
                    disabled={isSystem}
                  >
                    {COLUMN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    className={`h-5 rounded px-1 text-[10px] ${
                      col.nullable
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                    onClick={() => updateColumn(i, { nullable: !col.nullable })}
                    disabled={isSystem}
                    title={col.nullable ? "NULL可" : "NOT NULL"}
                  >
                    {col.nullable ? "NULL" : "NOT NULL"}
                  </button>
                  {!isSystem && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      onClick={() => removeColumn(i)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Generated Code Tabs */}
        <section className="space-y-2">
          <div className="flex items-center gap-1 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "sql" && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="secondary" className="text-[10px]">
                    CREATE TABLE
                  </Badge>
                  <CopyButton label="create" text={generated.createTableSQL} />
                </div>
                <HighlightedCode
                  code={generated.createTableSQL}
                  maxHeight="200px"
                  showLineNumbers={false}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="secondary" className="text-[10px]">
                    RLS Policy
                  </Badge>
                  <CopyButton label="rls" text={generated.rlsSQL} />
                </div>
                <HighlightedCode
                  code={generated.rlsSQL}
                  maxHeight="200px"
                  showLineNumbers={false}
                />
              </div>
            </div>
          )}

          {activeTab === "client" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary" className="text-[10px]">
                  Client Setup
                </Badge>
                <CopyButton label="client" text={generated.clientSetup} />
              </div>
              <HighlightedCode
                code={generated.clientSetup}
                maxHeight="300px"
                showLineNumbers={false}
              />
            </div>
          )}

          {activeTab === "crud" && (
            <div className="space-y-3">
              {(
                [
                  ["INSERT", "insert", generated.insertCode],
                  ["SELECT", "select", generated.selectCode],
                  ["UPDATE", "update", generated.updateCode],
                  ["DELETE", "delete", generated.deleteCode],
                ] as const
              ).map(([label, key, codeSnippet]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {label}
                    </Badge>
                    <CopyButton label={key} text={codeSnippet} />
                  </div>
                  <HighlightedCode
                    code={codeSnippet}
                    maxHeight="160px"
                    showLineNumbers={false}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="border-t p-3">
        <Button size="sm" className="w-full text-xs" onClick={handleSaveMapping}>
          マッピングを保存
        </Button>
      </div>
    </div>
  );
}
