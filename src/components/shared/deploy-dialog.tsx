"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rocket, ExternalLink, Settings, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useDeployStore, type DeployRecord } from "@/stores/deploy-store";
import { generateDeployFiles } from "@/lib/deploy-helpers";
import { slugify } from "@/lib/project-exporter";

type DeployDialogProps = {
  open: boolean;
  onClose: () => void;
  data: Record<string, unknown>;
  componentType: string;
};

export function DeployDialog({
  open,
  onClose,
  data,
  componentType,
}: DeployDialogProps) {
  const {
    vercelToken,
    setVercelToken,
    recentDeploys,
    addDeploy,
    updateDeployStatus,
  } = useDeployStore();

  const [tokenInput, setTokenInput] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    id: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTokenEdit, setShowTokenEdit] = useState(false);

  if (!open) return null;

  const hasToken = vercelToken.length > 0;
  const maskedToken = hasToken
    ? `vercel_****${vercelToken.slice(-4)}`
    : "";

  function handleSaveToken() {
    if (!tokenInput.trim()) return;
    setVercelToken(tokenInput.trim());
    setTokenInput("");
    setShowTokenEdit(false);
    toast.success("トークンを保存しました");
  }

  async function handleDeploy() {
    setDeploying(true);
    setError(null);
    setResult(null);

    const projectName = slugify((data.title as string) || componentType);
    const files = generateDeployFiles({
      title: (data.title as string) || componentType,
      description: (data.description as string) || "",
      code: (data.code as string) || "",
      toolName: componentType,
      toolData: data,
    });

    const deployId = addDeploy({
      url: "",
      projectName,
      timestamp: Date.now(),
      status: "building",
    });

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: vercelToken,
          projectName,
          files,
        }),
      });

      const responseData = (await response.json()) as {
        id?: string;
        url?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(responseData.error || "デプロイに失敗しました");
      }

      setResult({ url: responseData.url!, id: responseData.id! });
      updateDeployStatus(deployId, "ready", responseData.url);
      toast.success("デプロイ完了");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "デプロイに失敗しました";
      setError(message);
      updateDeployStatus(deployId, "error");
      toast.error(message);
    } finally {
      setDeploying(false);
    }
  }

  const statusLabel: Record<DeployRecord["status"], string> = {
    building: "ビルド中",
    ready: "完了",
    error: "エラー",
  };

  const statusColor: Record<DeployRecord["status"], string> = {
    building: "text-yellow-600",
    ready: "text-green-600",
    error: "text-red-600",
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-xl border bg-popover p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Rocket className="h-5 w-5" />
              Vercelにデプロイ
            </h2>
            <Button variant="ghost" size="icon-xs" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Token section */}
            {!hasToken || showTokenEdit ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">APIトークン</label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="vercel_..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveToken();
                    }}
                  />
                  <Button size="sm" onClick={handleSaveToken}>
                    保存
                  </Button>
                </div>
                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  トークンを取得
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <span className="text-sm text-muted-foreground">
                  {maskedToken}
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowTokenEdit(true)}
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Deploy button */}
            {hasToken && !showTokenEdit && (
              <Button
                className="w-full"
                onClick={handleDeploy}
                disabled={deploying}
              >
                {deploying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    デプロイ中...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    デプロイ
                  </>
                )}
              </Button>
            )}

            {/* Result */}
            {result && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  デプロイ完了
                </p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-green-700 hover:underline dark:text-green-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  開く
                </a>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            )}

            {/* Recent deploys */}
            {recentDeploys.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  デプロイ履歴
                </h3>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {recentDeploys.slice(0, 5).map((deploy) => (
                    <div
                      key={deploy.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">
                          {deploy.projectName}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(deploy.timestamp).toLocaleString("ja-JP")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={statusColor[deploy.status]}>
                          {statusLabel[deploy.status]}
                        </span>
                        {deploy.status === "ready" && deploy.url && (
                          <a
                            href={deploy.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
