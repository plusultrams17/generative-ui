"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, FileJson, FileCode, FileText, Share2, Link, FolderDown, Rocket, GitBranch } from "lucide-react";
import { toast } from "sonner";
import { generateShareableHtml } from "@/lib/share-generator";
import { generateProjectZip, slugify } from "@/lib/project-exporter";
import { useShareStore } from "@/stores/share-store";
import { DeployDialog } from "./deploy-dialog";
import { GitHubDialog } from "./github-dialog";

type ExportMenuProps = {
  data: Record<string, unknown>;
  componentType: string;
};

export function ExportMenu({ data, componentType }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [deployOpen, setDeployOpen] = useState(false);
  const [githubOpen, setGithubOpen] = useState(false);
  const addShare = useShareStore((s) => s.addShare);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedType(label);
    toast.success(`${label}をコピーしました`);
    setTimeout(() => setCopiedType(null), 2000);
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${filename}をダウンロードしました`);
  }

  function handleShareHtml() {
    const html = generateShareableHtml({ toolName: componentType, data });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    toast.success("共有HTMLをプレビューで開きました");
    setOpen(false);
  }

  async function handleProjectDownload() {
    try {
      const blob = await generateProjectZip({
        title: (data.title as string) || componentType,
        description: (data.description as string) || "",
        code: (data.code as string) || "",
        toolName: componentType,
        toolData: data,
      });
      const slug = slugify((data.title as string) || componentType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("プロジェクトをダウンロードしました");
    } catch {
      toast.error("プロジェクトの生成に失敗しました");
    }
    setOpen(false);
  }

  const jsonStr = JSON.stringify(data, null, 2);
  const slug = ((data.title as string) || componentType)
    .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, "-")
    .slice(0, 30);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => setOpen(!open)}
        aria-label="エクスポート"
      >
        <Download className="h-3.5 w-3.5" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border bg-popover p-1 shadow-lg">
            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                setOpen(false);
                setDeployOpen(true);
              }}
            >
              <Rocket className="h-3.5 w-3.5" />
              Vercelにデプロイ
            </button>

            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                setOpen(false);
                setGithubOpen(true);
              }}
            >
              <GitBranch className="h-3.5 w-3.5" />
              GitHubにプッシュ
            </button>

            <div className="my-1 border-t" />

            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                const id = addShare(componentType, data);
                const url = `${window.location.origin}/share/${id}`;
                navigator.clipboard.writeText(url);
                toast.success("共有リンクをコピーしました");
                setOpen(false);
              }}
            >
              <Link className="h-3.5 w-3.5" />
              共有リンクを作成
            </button>

            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={handleShareHtml}
            >
              <Share2 className="h-3.5 w-3.5" />
              プレビューで開く
            </button>

            <div className="my-1 border-t" />

            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                copyToClipboard(jsonStr, "JSON");
                setOpen(false);
              }}
            >
              {copiedType === "JSON" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <FileJson className="h-3.5 w-3.5" />
              )}
              JSONをコピー
            </button>

            {typeof data.code === "string" && (
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                onClick={() => {
                  copyToClipboard(data.code as string, "コード");
                  setOpen(false);
                }}
              >
                {copiedType === "コード" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <FileCode className="h-3.5 w-3.5" />
                )}
                コードをコピー
              </button>
            )}

            <div className="my-1 border-t" />

            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                downloadFile(jsonStr, `${slug}.json`, "application/json");
                setOpen(false);
              }}
            >
              <FileJson className="h-3.5 w-3.5" />
              JSON保存
            </button>

            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                const html = generateShareableHtml({ toolName: componentType, data });
                downloadFile(html, `${slug}.html`, "text/html");
                setOpen(false);
              }}
            >
              <FileText className="h-3.5 w-3.5" />
              HTML保存
            </button>

            <div className="my-1 border-t" />

            <button
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={handleProjectDownload}
            >
              <FolderDown className="h-3.5 w-3.5" />
              プロジェクトとしてダウンロード
            </button>
          </div>
        </>
      )}

      <DeployDialog
        open={deployOpen}
        onClose={() => setDeployOpen(false)}
        data={data}
        componentType={componentType}
      />

      <GitHubDialog
        open={githubOpen}
        onClose={() => setGithubOpen(false)}
        data={data}
        componentType={componentType}
      />
    </div>
  );
}
