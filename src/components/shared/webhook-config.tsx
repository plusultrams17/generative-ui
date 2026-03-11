"use client";

import { useState } from "react";
import { Link2, Trash2, Send, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWebhookStore, type WebhookConfig } from "@/stores/webhook-store";

type WebhookConfigPanelProps = {
  formTitle: string;
  open: boolean;
  onClose: () => void;
};

const typeLabels: Record<WebhookConfig["type"], string> = {
  generic: "汎用",
  slack: "Slack",
  discord: "Discord",
};

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WebhookConfigPanel({
  formTitle,
  open,
  onClose,
}: WebhookConfigPanelProps) {
  const { webhooks, addWebhook, removeWebhook, updateWebhook, testWebhook } =
    useWebhookStore();
  const formWebhooks = webhooks.filter((w) => w.formTitle === formTitle);

  const [newType, setNewType] = useState<WebhookConfig["type"]>("generic");
  const [newUrl, setNewUrl] = useState("");
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, boolean>>({});

  if (!open) return null;

  function handleAdd() {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    addWebhook({
      formTitle,
      url: trimmed,
      type: newType,
      enabled: true,
    });
    setNewUrl("");
    setNewType("generic");
  }

  async function handleTest(id: string) {
    setTesting(id);
    setTestResult((prev) => ({ ...prev, [id]: false }));
    const success = await testWebhook(id);
    setTestResult((prev) => ({ ...prev, [id]: success }));
    setTesting(null);
  }

  return (
    <Card className="w-full mt-3 border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Webhook設定
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {formWebhooks.length > 0 && (
          <div className="space-y-3">
            {formWebhooks.map((wh) => (
              <div
                key={wh.id}
                className="rounded-md border p-3 space-y-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                      {typeLabels[wh.type]}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {wh.url}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        updateWebhook(wh.id, { enabled: !wh.enabled })
                      }
                      title={wh.enabled ? "無効にする" : "有効にする"}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${wh.enabled ? "bg-green-500" : "bg-gray-300"}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleTest(wh.id)}
                      disabled={testing === wh.id}
                      title="テスト送信"
                    >
                      {testing === wh.id ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                      ) : testResult[wh.id] !== undefined ? (
                        testResult[wh.id] ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )
                      ) : (
                        <Send className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => removeWebhook(wh.id)}
                      title="削除"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {wh.lastTriggered && (
                  <p className="text-[10px] text-muted-foreground">
                    最終実行: {formatTimestamp(wh.lastTriggered)}{" "}
                    {wh.lastStatus === "success" ? (
                      <span className="text-green-600">成功</span>
                    ) : (
                      <span className="text-red-500">失敗</span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 rounded-md border border-dashed p-3">
          <p className="text-xs font-medium">新しいWebhookを追加</p>
          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <Label className="text-[10px]">タイプ</Label>
              <Select
                value={newType}
                onValueChange={(v) =>
                  setNewType(v as WebhookConfig["type"])
                }
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generic">汎用</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="discord">Discord</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-[10px]">エンドポイントURL</Label>
              <Input
                className="h-8 text-xs"
                placeholder="https://..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />
            </div>
            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={handleAdd}
              disabled={!newUrl.trim()}
            >
              追加
            </Button>
          </div>
        </div>

        {webhooks.length >= 20 && (
          <p className="text-[10px] text-muted-foreground">
            Webhook登録数の上限(20件)に達しています
          </p>
        )}
      </CardContent>
    </Card>
  );
}
