"use client";

import { useMemo, useState } from "react";
import { computeDiff, type DiffLine } from "@/lib/simple-diff";

type DiffViewerProps = {
  oldCode: string;
  newCode: string;
  oldLabel: string;
  newLabel: string;
};

const CONTEXT_LINES = 3;

type DisplayBlock =
  | { type: "lines"; lines: DiffLine[] }
  | { type: "collapsed"; count: number; index: number };

function buildDisplayBlocks(
  lines: DiffLine[],
  expandedSections: Set<number>
): DisplayBlock[] {
  const blocks: DisplayBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    // Find consecutive unchanged ranges
    if (lines[i].type === "unchanged") {
      let end = i;
      while (end < lines.length && lines[end].type === "unchanged") {
        end++;
      }

      const unchangedCount = end - i;

      if (unchangedCount > CONTEXT_LINES * 2 + 1 && !expandedSections.has(i)) {
        // Show first CONTEXT_LINES
        blocks.push({
          type: "lines",
          lines: lines.slice(i, i + CONTEXT_LINES),
        });
        // Collapsed section
        const collapsedCount = unchangedCount - CONTEXT_LINES * 2;
        blocks.push({ type: "collapsed", count: collapsedCount, index: i });
        // Show last CONTEXT_LINES
        blocks.push({
          type: "lines",
          lines: lines.slice(end - CONTEXT_LINES, end),
        });
      } else {
        blocks.push({ type: "lines", lines: lines.slice(i, end) });
      }

      i = end;
    } else {
      // Changed line - add individually
      blocks.push({ type: "lines", lines: [lines[i]] });
      i++;
    }
  }

  return blocks;
}

export function DiffViewer({
  oldCode,
  newCode,
  oldLabel,
  newLabel,
}: DiffViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set()
  );

  const diff = useMemo(() => computeDiff(oldCode, newCode), [oldCode, newCode]);

  const displayBlocks = useMemo(
    () => buildDisplayBlocks(diff.lines, expandedSections),
    [diff.lines, expandedSections]
  );

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="rounded-lg border bg-muted/20 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="font-medium text-muted-foreground">
          コード差分: {oldLabel} → {newLabel}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-green-600 dark:text-green-400">
            +{diff.addedCount}行追加
          </span>
          <span className="text-red-600 dark:text-red-400">
            -{diff.removedCount}行削除
          </span>
        </div>
      </div>

      {/* Diff content */}
      <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[11px] leading-5">
          <tbody>
            {displayBlocks.map((block, blockIdx) => {
              if (block.type === "collapsed") {
                return (
                  <tr key={`collapsed-${blockIdx}`}>
                    <td
                      colSpan={3}
                      className="cursor-pointer bg-muted/40 px-3 py-1 text-center text-muted-foreground hover:bg-muted/60"
                      onClick={() => toggleSection(block.index)}
                    >
                      ··· {block.count}行 変更なし ···
                    </td>
                  </tr>
                );
              }

              return block.lines.map((line, lineIdx) => {
                const key = `${blockIdx}-${lineIdx}`;
                const prefix =
                  line.type === "added"
                    ? "+"
                    : line.type === "removed"
                      ? "-"
                      : " ";
                const bgClass =
                  line.type === "added"
                    ? "bg-green-500/10"
                    : line.type === "removed"
                      ? "bg-red-500/10"
                      : "";
                const textClass =
                  line.type === "added"
                    ? "text-green-600 dark:text-green-400"
                    : line.type === "removed"
                      ? "text-red-600 dark:text-red-400"
                      : "";

                return (
                  <tr key={key} className={bgClass}>
                    <td className="w-8 select-none px-1 text-right text-muted-foreground/50">
                      {line.oldLineNumber ?? ""}
                    </td>
                    <td className="w-8 select-none px-1 text-right text-muted-foreground/50">
                      {line.newLineNumber ?? ""}
                    </td>
                    <td className={`whitespace-pre px-2 ${textClass}`}>
                      {prefix} {line.content}
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
