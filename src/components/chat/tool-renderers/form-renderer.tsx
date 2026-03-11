"use client";

import { useRef, useState, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Server, Globe, Database } from "lucide-react";
import { generateFormApi } from "@/lib/api-generator";
import { ApiRoutePreview } from "@/components/shared/api-route-preview";
import { useWebhookStore, formatPayload } from "@/stores/webhook-store";
import { WebhookConfigPanel } from "@/components/shared/webhook-config";
import { SupabasePanel } from "@/components/shared/supabase-panel";

type FormField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

type FormRendererProps = {
  title: string;
  description?: string;
  fields: FormField[];
  submitLabel: string;
  layout: "vertical" | "horizontal" | "grid";
};

export const FormRenderer = memo(function FormRenderer({
  title,
  description,
  fields,
  submitLabel,
  layout,
}: FormRendererProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [showApi, setShowApi] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [showSupabase, setShowSupabase] = useState(false);

  const { webhooks, updateWebhook } = useWebhookStore();
  const enabledWebhooks = webhooks.filter(
    (w) => w.formTitle === title && w.enabled
  );
  const hasWebhooks = webhooks.some((w) => w.formTitle === title);

  const apiRoute = useMemo(
    () => generateFormApi({ title, fields }),
    [title, fields]
  );

  const gridClass =
    layout === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
      : "flex flex-col gap-4";

  async function sendToWebhooks(data: Record<string, FormDataEntryValue>) {
    if (enabledWebhooks.length === 0) return;

    const results = await Promise.allSettled(
      enabledWebhooks.map(async (wh) => {
        const payload = formatPayload(wh.type, title, data);
        const res = await fetch("/api/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: wh.url,
            payload,
            type: wh.type,
            headers: wh.headers,
          }),
        });
        const result = await res.json();
        const success = result.success === true;
        updateWebhook(wh.id, {
          lastTriggered: Date.now(),
          lastStatus: success ? "success" : "error",
        });
        return success;
      })
    );

    const succeeded = results.filter(
      (r) => r.status === "fulfilled" && r.value
    ).length;
    const failed = results.length - succeeded;

    if (succeeded > 0) {
      toast.success("Webhook送信: 成功", {
        description: `${succeeded}件のWebhookに送信しました`,
      });
    }
    if (failed > 0) {
      toast.error("Webhook送信: 失敗", {
        description: `${failed}件のWebhookが失敗しました`,
      });
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    toast.success("送信完了", {
      description: `${Object.keys(data).length}件のフィールドが送信されました`,
    });
    sendToWebhooks(data);
  }

  return (
    <div className="w-full max-w-lg">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-7 w-7"
                onClick={() => {
                  setShowWebhook(!showWebhook);
                  if (!showWebhook) setShowApi(false);
                }}
                aria-label="Webhook設定"
                title="Webhook設定"
              >
                <Globe className="h-3.5 w-3.5" />
                {hasWebhooks && (
                  <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                )}
              </Button>
              <Button
                variant={showSupabase ? "default" : "ghost"}
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setShowSupabase(!showSupabase);
                  if (!showSupabase) {
                    setShowApi(false);
                    setShowWebhook(false);
                  }
                }}
                title="Supabase連携"
              >
                <Database className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => {
                  setShowApi(!showApi);
                  if (!showApi) {
                    setShowWebhook(false);
                    setShowSupabase(false);
                  }
                }}
                aria-label="API生成"
                title="API生成"
              >
                <Server className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <form ref={formRef} className={gridClass} onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </Label>
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                    required={field.required}
                  >
                    <option value="">選択してください</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <div className="flex items-center gap-2">
                    <input
                      id={field.name}
                      name={field.name}
                      type="checkbox"
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    <Label htmlFor={field.name} className="font-normal">
                      {field.placeholder || field.label}
                    </Label>
                  </div>
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
            <div className={layout === "grid" ? "col-span-full" : ""}>
              <Button type="submit" className="w-full">
                {submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {showWebhook && (
        <WebhookConfigPanel
          formTitle={title}
          open={showWebhook}
          onClose={() => setShowWebhook(false)}
        />
      )}
      {showApi && <ApiRoutePreview route={apiRoute} />}
      <SupabasePanel
        code={JSON.stringify(fields)}
        componentType="form"
        open={showSupabase}
        onClose={() => setShowSupabase(false)}
      />
    </div>
  );
});
