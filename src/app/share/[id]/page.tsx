"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useShareStore } from "@/stores/share-store";
import {
  useFeedbackStore,
  type FeedbackType,
} from "@/stores/feedback-store";
import {
  FormRenderer,
  TableRenderer,
  ChartRenderer,
  CustomComponentRenderer,
} from "@/components/chat/tool-renderers";
import { ToolErrorBoundary } from "@/components/shared/error-boundary";
import { ExportMenu } from "@/components/shared/export-menu";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
const TOOL_RENDERERS: Record<string, React.ComponentType<any>> = {
  showForm: FormRenderer,
  showTable: TableRenderer,
  showChart: ChartRenderer,
  generateCustomComponent: CustomComponentRenderer,
};

function StatusBanner({
  status,
}: {
  status: "pending" | "approved" | "revision_requested" | "no_feedback";
}) {
  if (status === "no_feedback") return null;

  const config = {
    approved: {
      bg: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
      text: "text-green-800 dark:text-green-300",
      icon: CheckCircle2,
      label: "クライアント承認済み",
    },
    revision_requested: {
      bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
      text: "text-red-800 dark:text-red-300",
      icon: AlertCircle,
      label: "修正依頼があります",
    },
    pending: {
      bg: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-800 dark:text-yellow-300",
      icon: Clock,
      label: "フィードバック待ち",
    },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <div className={`mb-6 flex items-center gap-2 rounded-lg border p-3 ${c.bg}`}>
      <Icon className={`h-4 w-4 ${c.text}`} />
      <span className={`text-sm font-medium ${c.text}`}>{c.label}</span>
    </div>
  );
}

function FeedbackPanel({ shareId }: { shareId: string }) {
  const { addComment, resolveComment, getCommentsByShareId } =
    useFeedbackStore();
  const comments = useFeedbackStore(() => getCommentsByShareId(shareId));

  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("feedback-author-name");
    if (saved) setAuthor(saved);
  }, []);

  const handleSubmit = (type: FeedbackType) => {
    if (!content.trim() || !author.trim()) return;
    addComment({
      shareId,
      author: author.trim(),
      content: content.trim(),
      type,
      status: "pending",
    });
    localStorage.setItem("feedback-author-name", author.trim());
    setContent("");
  };

  const typeBadge = (type: FeedbackType) => {
    const styles = {
      comment: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
      approval:
        "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
      revision_request:
        "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
    };
    const labels = {
      comment: "コメント",
      approval: "承認",
      revision_request: "修正依頼",
    };
    return (
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[type]}`}
      >
        {labels[type]}
      </span>
    );
  };

  return (
    <div className="mt-8 rounded-lg border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold">フィードバック</h3>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="名前"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
        <textarea
          placeholder="コメントを入力..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSubmit("comment")}
            disabled={!content.trim() || !author.trim()}
          >
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
            コメント
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSubmit("approval")}
            disabled={!content.trim() || !author.trim()}
            className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/30"
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            承認
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSubmit("revision_request")}
            disabled={!content.trim() || !author.trim()}
            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
            修正依頼
          </Button>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        {comments.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            まだフィードバックはありません
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-md border p-3 ${
                  comment.status === "resolved"
                    ? "opacity-60"
                    : ""
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.author}
                    </span>
                    {typeBadge(comment.type)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>
                <p className="mb-2 text-sm">{comment.content}</p>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={comment.status === "resolved"}
                    onChange={() => resolveComment(comment.id)}
                    className="rounded"
                  />
                  対応済み
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const share = useShareStore((s) => s.getShare(id));
  const approvalStatus = useFeedbackStore((s) => s.getApprovalStatus(id));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>生成UI</span>
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              チャットで作る
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {share ? (
          <>
            <StatusBanner status={approvalStatus} />
            <div className="relative group">
              <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExportMenu
                  data={share.toolData}
                  componentType={share.toolName}
                />
              </div>
              <ToolErrorBoundary>
                {(() => {
                  const Renderer = TOOL_RENDERERS[share.toolName];
                  if (!Renderer) {
                    return (
                      <div className="rounded-lg border p-8 text-center text-muted-foreground">
                        <p>このUIタイプは表示できません</p>
                      </div>
                    );
                  }
                  return <Renderer {...share.toolData} />;
                })()}
              </ToolErrorBoundary>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                {new Date(share.createdAt).toLocaleString("ja-JP")} に作成
              </p>
            </div>
            <FeedbackPanel shareId={id} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 text-6xl">404</div>
            <h1 className="mb-2 text-xl font-bold">
              共有UIが見つかりません
            </h1>
            <p className="mb-6 text-muted-foreground">
              このリンクは無効か、共有データが削除された可能性があります。
            </p>
            <Button asChild>
              <Link href="/">チャットでUIを作る</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
