export type PerfCategory = "rendering" | "bundle" | "runtime" | "memory";

export type PerfIssue = {
  category: PerfCategory;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  suggestion: string;
  impact: number;
};

export type PerfMetrics = {
  estimatedDOMNodes: number;
  estimatedBundleSize: number;
  complexityScore: number;
  renderCost: "low" | "medium" | "high";
};

export type PerfResult = {
  score: number;
  metrics: PerfMetrics;
  issues: PerfIssue[];
  grade: "A" | "B" | "C" | "D" | "F";
};

function countMatches(code: string, pattern: RegExp): number {
  const matches = code.match(pattern);
  return matches ? matches.length : 0;
}

function countJSXTags(code: string): number {
  return countMatches(code, /<[A-Z][a-zA-Z]*|<[a-z][a-z-]*/g);
}

function countUseState(code: string): number {
  return countMatches(code, /useState\s*[<(]/g);
}

function countNestingDepth(code: string): number {
  let maxDepth = 0;
  let currentDepth = 0;
  for (const ch of code) {
    if (ch === "{") {
      currentDepth++;
      if (currentDepth > maxDepth) maxDepth = currentDepth;
    } else if (ch === "}") {
      currentDepth--;
    }
  }
  return maxDepth;
}

function countConditions(code: string): number {
  return (
    countMatches(code, /\bif\s*\(/g) +
    countMatches(code, /\?\s/g) +
    countMatches(code, /\bswitch\s*\(/g) +
    countMatches(code, /&&/g)
  );
}

function countLoops(code: string): number {
  return (
    countMatches(code, /\bfor\s*\(/g) +
    countMatches(code, /\bwhile\s*\(/g) +
    countMatches(code, /\.map\s*\(/g) +
    countMatches(code, /\.forEach\s*\(/g) +
    countMatches(code, /\.reduce\s*\(/g)
  );
}

function detectIssues(code: string): PerfIssue[] {
  const issues: PerfIssue[] = [];

  // --- rendering ---
  if (/style=\{\{/.test(code)) {
    issues.push({
      category: "rendering",
      severity: "warning",
      title: "インラインスタイルの使用",
      description: "再レンダリング毎にオブジェクトが再生成されます",
      suggestion:
        "スタイルをコンポーネント外の定数に抽出するか、CSS クラスを使用してください",
      impact: 5,
    });
  }

  if (/onClick=\{\(\)\s*=>/.test(code) || /onChange=\{\(\)\s*=>/.test(code)) {
    issues.push({
      category: "rendering",
      severity: "info",
      title: "インライン関数ハンドラー",
      description:
        "イベントハンドラーがインラインで定義されており、毎レンダリングで再生成されます",
      suggestion: "useCallback でメモ化を検討してください",
      impact: 3,
    });
  }

  const jsxTagCount = countJSXTags(code);
  if (jsxTagCount > 50) {
    issues.push({
      category: "rendering",
      severity: "warning",
      title: "大量のDOM要素",
      description: `約${jsxTagCount}個のJSX要素が検出されました`,
      suggestion: "仮想化やコンポーネント分割を検討してください",
      impact: 7,
    });
  }

  if (/key=\{index\}|key=\{i\}/.test(code)) {
    issues.push({
      category: "rendering",
      severity: "warning",
      title: "インデックスをkeyに使用",
      description:
        "配列のインデックスをkeyに使用するとリスト変更時にパフォーマンスに影響します",
      suggestion: "一意なIDをkeyとして使用してください",
      impact: 5,
    });
  }

  const useStateCount = countUseState(code);
  if (useStateCount > 5) {
    issues.push({
      category: "rendering",
      severity: "info",
      title: "多数のuseState",
      description: `${useStateCount}個のuseStateが検出されました。不要な再レンダリングが発生する可能性があります`,
      suggestion:
        "useReducer への統合やカスタムフックへの分離を検討してください",
      impact: 4,
    });
  }

  // --- bundle ---
  if (/import\s+moment\b|from\s+['"]moment['"]/.test(code)) {
    issues.push({
      category: "bundle",
      severity: "critical",
      title: "moment.js のインポート",
      description: "moment.js は非常に大きなバンドルサイズになります",
      suggestion: "date-fns や dayjs など軽量な代替ライブラリを使用してください",
      impact: 9,
    });
  }

  if (
    /import\s+_\s+from\s+['"]lodash['"]|import\s+lodash\b/.test(code) ||
    /from\s+['"]lodash['"]/.test(code)
  ) {
    issues.push({
      category: "bundle",
      severity: "critical",
      title: "lodash の全体インポート",
      description: "lodash 全体をインポートするとバンドルサイズが大きくなります",
      suggestion:
        "lodash/specific-function のように個別インポートを使用してください",
      impact: 8,
    });
  }

  if (/data:image\/[^;]+;base64,/.test(code)) {
    issues.push({
      category: "bundle",
      severity: "warning",
      title: "Base64画像の埋め込み",
      description: "画像がBase64でコードに埋め込まれています",
      suggestion:
        "外部ファイルとして配置し、next/image などで最適化してください",
      impact: 6,
    });
  }

  const classPatterns = code.match(/className="([^"]+)"/g);
  if (classPatterns) {
    const counts = new Map<string, number>();
    for (const p of classPatterns) {
      counts.set(p, (counts.get(p) || 0) + 1);
    }
    const duplicates = Array.from(counts.values()).filter((c) => c > 5);
    if (duplicates.length > 0) {
      issues.push({
        category: "bundle",
        severity: "info",
        title: "CSSクラスの重複定義",
        description: "同じクラス名パターンが繰り返し使われています",
        suggestion:
          "共通スタイルをユーティリティクラスやコンポーネントに抽出してください",
        impact: 2,
      });
    }
  }

  const lineCount = code.split("\n").length;
  if (lineCount > 200) {
    issues.push({
      category: "bundle",
      severity: "info",
      title: "大きなコンポーネント",
      description: `${lineCount}行のコードがあります`,
      suggestion: "コンポーネント分割を検討してください",
      impact: 3,
    });
  }

  // --- runtime ---
  if (/setInterval\s*\(|setTimeout\s*\(/.test(code)) {
    issues.push({
      category: "runtime",
      severity: "info",
      title: "タイマーの使用",
      description: "setInterval / setTimeout が使用されています",
      suggestion:
        "useEffect 内でクリーンアップ関数を使ってタイマーをクリアしてください",
      impact: 4,
    });
  }

  if (/\bfetch\s*\(|\basync\b/.test(code)) {
    issues.push({
      category: "runtime",
      severity: "info",
      title: "非同期処理",
      description: "fetch / async 呼び出しが検出されました",
      suggestion: "エラーハンドリングとローディング状態を確認してください",
      impact: 3,
    });
  }

  if (countMatches(code, /new RegExp|\/[^/\n]+\/[gimsuy]*/g) > 3) {
    issues.push({
      category: "runtime",
      severity: "info",
      title: "正規表現の多用",
      description: "複数の正規表現が使用されています",
      suggestion:
        "正規表現をコンポーネント外の定数に移動して再生成を防いでください",
      impact: 2,
    });
  }

  const nestingDepth = countNestingDepth(code);
  if (nestingDepth > 5) {
    issues.push({
      category: "runtime",
      severity: "warning",
      title: "深いネスト構造",
      description: `ネストの深さが${nestingDepth}レベルです`,
      suggestion: "早期リターンやヘルパー関数で構造をフラットにしてください",
      impact: 5,
    });
  }

  // --- memory ---
  if (/addEventListener\s*\(/.test(code)) {
    issues.push({
      category: "memory",
      severity: "warning",
      title: "イベントリスナーの登録",
      description: "addEventListener が使用されています",
      suggestion:
        "useEffect のクリーンアップで removeEventListener を呼んでください",
      impact: 6,
    });
  }

  if (/\[([^[\]]*,){20,}/.test(code)) {
    issues.push({
      category: "memory",
      severity: "info",
      title: "大きな配列リテラル",
      description: "20要素以上の配列リテラルが検出されました",
      suggestion:
        "外部データファイルや遅延読み込みを検討してください",
      impact: 3,
    });
  }

  if (
    /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\bconst\b[\s\S]*?\bfunction\b/m.test(
      code
    ) ||
    countMatches(code, /=>\s*\{[^}]*\blet\b[^}]*\}/g) > 3
  ) {
    issues.push({
      category: "memory",
      severity: "info",
      title: "クロージャ内のデータ保持",
      description: "クロージャ内で変数が保持されている可能性があります",
      suggestion: "不要なクロージャを避け、メモリリークに注意してください",
      impact: 3,
    });
  }

  return issues;
}

function calculateMetrics(code: string): PerfMetrics {
  const domNodes = countJSXTags(code);
  const bundleSize = Math.round(new Blob([code]).size * 1.3);
  const nestingDepth = countNestingDepth(code);
  const conditions = countConditions(code);
  const loops = countLoops(code);
  const rawComplexity = nestingDepth * 3 + conditions * 2 + loops * 2;
  const complexityScore = Math.min(100, rawComplexity);
  const stateCount = countUseState(code);
  const renderCost: PerfMetrics["renderCost"] =
    domNodes > 50 || stateCount > 5
      ? "high"
      : domNodes > 20 || stateCount > 3
        ? "medium"
        : "low";

  return {
    estimatedDOMNodes: domNodes,
    estimatedBundleSize: bundleSize,
    complexityScore,
    renderCost,
  };
}

function calculateGrade(score: number): PerfResult["grade"] {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function analyzePerformance(code: string): PerfResult {
  const issues = detectIssues(code);
  const metrics = calculateMetrics(code);

  let score = 100;
  for (const issue of issues) {
    switch (issue.severity) {
      case "critical":
        score -= 15;
        break;
      case "warning":
        score -= 8;
        break;
      case "info":
        score -= 3;
        break;
    }
  }
  score = Math.max(0, score);

  return {
    score,
    metrics,
    issues,
    grade: calculateGrade(score),
  };
}
