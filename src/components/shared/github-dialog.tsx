"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GitBranch, ExternalLink, Lock, Unlock, Loader2, Settings, X } from "lucide-react";
import { toast } from "sonner";
import { useGitHubStore } from "@/stores/github-store";
import { generateDeployFiles } from "@/lib/deploy-helpers";
import { slugify } from "@/lib/project-exporter";

type GitHubDialogProps = {
  open: boolean;
  onClose: () => void;
  data: Record<string, unknown>;
  componentType: string;
};

export function GitHubDialog({
  open,
  onClose,
  data,
  componentType,
}: GitHubDialogProps) {
  const { githubToken, setGithubToken, recentRepos, addRepo } =
    useGitHubStore();

  const [tokenInput, setTokenInput] = useState("");
  const [showTokenEdit, setShowTokenEdit] = useState(false);
  const [repoName, setRepoName] = useState(
    slugify((data.title as string) || componentType)
  );
  const [description, setDescription] = useState(
    (data.description as string) || ""
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [result, setResult] = useState<{ repoUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const hasToken = githubToken.length > 0;
  const maskedToken = hasToken
    ? `ghp_****${githubToken.slice(-4)}`
    : "";

  function handleSaveToken() {
    if (!tokenInput.trim()) return;
    setGithubToken(tokenInput.trim());
    setTokenInput("");
    setShowTokenEdit(false);
    toast.success("トークンを保存しました");
  }

  async function handlePush() {
    setPushing(true);
    setError(null);
    setResult(null);

    const files = generateDeployFiles({
      title: (data.title as string) || componentType,
      description: (data.description as string) || "",
      code: (data.code as string) || "",
      toolName: componentType,
      toolData: data,
    });

    // Convert deploy file format {file, data} to github format {path, content}
    const githubFiles = files.map((f) => ({
      path: f.file,
      content: f.data,
    }));

    // Add README.md
    const readmeTitle = (data.title as string) || componentType;
    githubFiles.push({
      path: "README.md",
      content: `# ${readmeTitle}\n\n${description || "Generated UI Component"}\n\n## セットアップ\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。\n\n---\n\n> このプロジェクトは **生成UI** -- AIドリブンUIジェネレーター で生成されました。\n`,
    });

    try {
      const response = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: githubToken,
          repoName,
          description: description || `Generated UI: ${readmeTitle}`,
          files: githubFiles,
          isPrivate,
        }),
      });

      const responseData = (await response.json()) as {
        repoUrl?: string;
        repoName?: string;
        owner?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(responseData.error || "GitHubへのプッシュに失敗しました");
      }

      setResult({ repoUrl: responseData.repoUrl! });
      addRepo(responseData.repoName!, responseData.repoUrl!);
      toast.success("プッシュ完了");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "GitHubへのプッシュに失敗しました";
      setError(message);
      toast.error(message);
    } finally {
      setPushing(false);
    }
  }

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
              <GitBranch className="h-5 w-5" />
              GitHubにプッシュ
            </h2>
            <Button variant="ghost" size="icon-xs" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Token section */}
            {!hasToken || showTokenEdit ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  パーソナルアクセストークン
                </label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="ghp_..."
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
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  トークンを取得（repoスコープが必要）
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

            {/* Repo settings */}
            {hasToken && !showTokenEdit && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">リポジトリ名</label>
                  <Input
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="my-generated-ui"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">説明</label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Generated UI Component"
                  />
                </div>

                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted w-full"
                  onClick={() => setIsPrivate(!isPrivate)}
                >
                  {isPrivate ? (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      プライベート
                    </>
                  ) : (
                    <>
                      <Unlock className="h-3.5 w-3.5" />
                      パブリック
                    </>
                  )}
                </button>

                <Button
                  className="w-full"
                  onClick={handlePush}
                  disabled={pushing || !repoName.trim()}
                >
                  {pushing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      プッシュ中...
                    </>
                  ) : (
                    <>
                      <GitBranch className="h-4 w-4" />
                      GitHubにプッシュ
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Result */}
            {result && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  プッシュ完了
                </p>
                <a
                  href={result.repoUrl}
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

            {/* Recent repos */}
            {recentRepos.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  最近のリポジトリ
                </h3>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {recentRepos.slice(0, 5).map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-xs"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{repo.repoName}</span>
                        <span className="text-muted-foreground">
                          {new Date(repo.timestamp).toLocaleString("ja-JP")}
                        </span>
                      </div>
                      <a
                        href={repo.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </a>
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
