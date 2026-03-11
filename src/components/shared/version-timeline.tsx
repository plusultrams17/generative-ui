"use client";

import { useState } from "react";
import { useVersionStore, type ComponentVersion } from "@/stores/version-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, GitCompareArrows, X } from "lucide-react";
import { DiffViewer } from "@/components/shared/diff-viewer";

type VersionTimelineProps = {
  componentId: string;
  currentVersionId?: string;
  onSelectVersion: (version: ComponentVersion) => void;
};

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  return `${days}日前`;
}

export function VersionTimeline({
  componentId,
  currentVersionId,
  onSelectVersion,
}: VersionTimelineProps) {
  const versions = useVersionStore((s) => s.getVersions(componentId));
  const [diffPair, setDiffPair] = useState<{
    old: ComponentVersion;
    new: ComponentVersion;
  } | null>(null);

  if (versions.length <= 1) return null;

  const handleDiff = (version: ComponentVersion, e: React.MouseEvent) => {
    e.stopPropagation();
    // Find the previous version
    const idx = versions.findIndex((v) => v.id === version.id);
    if (idx > 0) {
      setDiffPair({ old: versions[idx - 1], new: version });
    }
  };

  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          バージョン履歴
        </span>
        <Badge variant="secondary" className="text-[10px]">
          v{versions[versions.length - 1]?.version} / {versions.length}件
        </Badge>
      </div>
      <div className="space-y-1.5">
        {versions
          .slice()
          .reverse()
          .map((version) => {
            const isCurrent = version.id === currentVersionId;
            const isFirst = version.version === versions[0]?.version;
            return (
              <button
                key={version.id}
                onClick={() => !isCurrent && onSelectVersion(version)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                  isCurrent
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <Badge
                  variant={isCurrent ? "default" : "outline"}
                  className="shrink-0 text-[10px]"
                >
                  v{version.version}
                </Badge>
                <span className="min-w-0 flex-1 truncate">
                  {version.prompt || "初期バージョン"}
                </span>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {isCurrent ? "現在" : formatRelativeTime(version.timestamp)}
                </span>
                {!isFirst && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0"
                    onClick={(e) => handleDiff(version, e)}
                    title="差分を表示"
                  >
                    <GitCompareArrows className="h-3 w-3" />
                  </Button>
                )}
                {!isCurrent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVersion(version);
                    }}
                    title="ロールバック"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </button>
            );
          })}
      </div>

      {/* Diff viewer */}
      {diffPair && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-[10px]"
              onClick={() => setDiffPair(null)}
            >
              <X className="h-3 w-3" />
              閉じる
            </Button>
          </div>
          <DiffViewer
            oldCode={diffPair.old.code ?? ""}
            newCode={diffPair.new.code ?? ""}
            oldLabel={`v${diffPair.old.version}`}
            newLabel={`v${diffPair.new.version}`}
          />
        </div>
      )}
    </div>
  );
}
