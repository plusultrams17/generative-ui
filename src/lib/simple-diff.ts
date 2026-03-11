export type DiffLine = {
  type: "added" | "removed" | "unchanged";
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
};

export type DiffResult = {
  lines: DiffLine[];
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
};

function lcsTable(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

export function computeDiff(oldText: string, newText: string): DiffResult {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const dp = lcsTable(oldLines, newLines);

  const lines: DiffLine[] = [];
  let i = oldLines.length;
  let j = newLines.length;

  // Backtrack to build diff
  const stack: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      stack.push({
        type: "unchanged",
        content: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({
        type: "added",
        content: newLines[j - 1],
        newLineNumber: j,
      });
      j--;
    } else {
      stack.push({
        type: "removed",
        content: oldLines[i - 1],
        oldLineNumber: i,
      });
      i--;
    }
  }

  // Reverse since we built it backwards
  for (let k = stack.length - 1; k >= 0; k--) {
    lines.push(stack[k]);
  }

  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  for (const line of lines) {
    if (line.type === "added") addedCount++;
    else if (line.type === "removed") removedCount++;
    else unchangedCount++;
  }

  return { lines, addedCount, removedCount, unchangedCount };
}
