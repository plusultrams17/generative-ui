"use client";

import { useState, useEffect } from "react";
import {
  useApprovalStore,
  type ApprovalRequest,
} from "@/stores/approval-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Pencil,
} from "lucide-react";

type ApprovalDialogProps = {
  request: ApprovalRequest;
  onResolved: () => void;
};

export function ApprovalDialog({ request, onResolved }: ApprovalDialogProps) {
  const approve = useApprovalStore((s) => s.approve);
  const reject = useApprovalStore((s) => s.reject);
  const modifyAndApprove = useApprovalStore((s) => s.modifyAndApprove);
  const setPolicy = useApprovalStore((s) => s.setPolicy);

  const [editMode, setEditMode] = useState(false);
  const [argsText, setArgsText] = useState(
    JSON.stringify(request.args, null, 2)
  );
  const [argsError, setArgsError] = useState<string | null>(null);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [autoApproveChecked, setAutoApproveChecked] = useState(false);
  const [visible, setVisible] = useState(false);

  // Slide-in animation
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  function handleApprove() {
    approve(request.id);
    if (autoApproveChecked) {
      setPolicy(request.toolName, "auto-approve");
    }
    onResolved();
  }

  function handleReject() {
    reject(request.id, rejectReason || undefined);
    onResolved();
  }

  function handleModifyAndApprove() {
    try {
      const parsed = JSON.parse(argsText);
      setArgsError(null);
      modifyAndApprove(request.id, parsed);
      if (autoApproveChecked) {
        setPolicy(request.toolName, "auto-approve");
      }
      onResolved();
    } catch (e) {
      setArgsError(
        e instanceof Error ? e.message : "JSONの解析に失敗しました"
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`w-full max-w-lg mx-4 rounded-xl border bg-background shadow-2xl transition-all duration-300 ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">ツール実行の承認</h3>
            <p className="text-xs text-muted-foreground">
              エージェントがツールの実行を要求しています
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Tool name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              ツール名
            </label>
            <div className="mt-1">
              <Badge
                variant="outline"
                className="text-sm font-mono px-2.5 py-1"
              >
                {request.toolName}
              </Badge>
            </div>
          </div>

          {/* Arguments */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                引数
              </label>
              {!editMode && !rejectMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 text-xs"
                  onClick={() => setEditMode(true)}
                >
                  <Pencil className="h-3 w-3" />
                  編集
                </Button>
              )}
            </div>
            {editMode ? (
              <div className="mt-1">
                <textarea
                  className="w-full rounded-lg border bg-muted/50 p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y min-h-[120px]"
                  value={argsText}
                  onChange={(e) => {
                    setArgsText(e.target.value);
                    setArgsError(null);
                  }}
                  rows={8}
                />
                {argsError && (
                  <p className="mt-1 text-xs text-destructive">{argsError}</p>
                )}
              </div>
            ) : (
              <pre className="mt-1 rounded-lg border bg-muted/50 p-3 font-mono text-xs leading-relaxed overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
                {JSON.stringify(request.args, null, 2)}
              </pre>
            )}
          </div>

          {/* Reject reason */}
          {rejectMode && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                拒否理由（任意）
              </label>
              <input
                type="text"
                className="mt-1 w-full rounded-lg border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="拒否する理由を入力..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Auto-approve checkbox */}
          {!rejectMode && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-muted-foreground/50"
                checked={autoApproveChecked}
                onChange={(e) => setAutoApproveChecked(e.target.checked)}
              />
              <span className="text-xs text-muted-foreground">
                このツールを今後自動承認する
              </span>
            </label>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
          {rejectMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectMode(false)}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5"
                onClick={handleReject}
              >
                <ShieldX className="h-3.5 w-3.5" />
                拒否する
              </Button>
            </>
          ) : editMode ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditMode(false);
                  setArgsText(JSON.stringify(request.args, null, 2));
                  setArgsError(null);
                }}
              >
                キャンセル
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleModifyAndApprove}
              >
                <Pencil className="h-3.5 w-3.5" />
                修正して承認
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setRejectMode(true)}
              >
                <ShieldX className="h-3.5 w-3.5 mr-1" />
                拒否
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setEditMode(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                修正して承認
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApprove}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                承認
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
