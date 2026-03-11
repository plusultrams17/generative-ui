export type OptimizationCategory =
  | "performance"
  | "bestPractice"
  | "accessibility"
  | "maintainability";

export type OptimizationSeverity = "suggestion" | "recommended" | "important";

export type OptimizationItem = {
  rule: string;
  category: OptimizationCategory;
  severity: OptimizationSeverity;
  message: string;
  suggestion: string;
  line?: number;
};

type OptimizationRule = {
  check: (code: string, lines: string[], items: OptimizationItem[]) => void;
};

const RULES: OptimizationRule[] = [
  // ── Performance ──

  // 1. Inline function in JSX event handlers
  {
    check: (_code, lines, items) => {
      for (let i = 0; i < lines.length; i++) {
        if (
          /\b(?:onClick|onChange|onSubmit|onBlur|onFocus|onKeyDown|onKeyUp|onMouseEnter|onMouseLeave)\s*=\s*\{\s*\(/.test(
            lines[i]
          )
        ) {
          items.push({
            rule: "no-inline-handler",
            category: "performance",
            severity: "recommended",
            message:
              "JSXイベントハンドラにインライン関数が使用されています。レンダー毎に新しい参照が生成されます。",
            suggestion: "useCallbackまたは関数定義を外に出す",
            line: i + 1,
          });
        }
      }
    },
  },

  // 2. Large inline styles
  {
    check: (_code, lines, items) => {
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/style\s*=\s*\{\s*\{([^}]*)\}\s*\}/);
        if (match && match[1].split(",").length >= 3) {
          items.push({
            rule: "no-large-inline-style",
            category: "performance",
            severity: "recommended",
            message:
              "複数のプロパティを持つインラインスタイルが使用されています。レンダー毎にオブジェクトが再生成されます。",
            suggestion: "Tailwindクラスを使用する",
            line: i + 1,
          });
        }
      }
    },
  },

  // 3. Missing key prop in .map()
  {
    check: (code, _lines, items) => {
      const mapRegex = /\.map\s*\(\s*(?:\([^)]*\)|[a-zA-Z_$]\w*)\s*=>\s*(?:\(?\s*<[A-Z]|<[a-z])/g;
      let match;
      while ((match = mapRegex.exec(code)) !== null) {
        const afterMap = code.slice(match.index, match.index + 300);
        const jsxStart = afterMap.indexOf("<");
        if (jsxStart === -1) continue;
        const tagEnd = afterMap.indexOf(">", jsxStart);
        if (tagEnd === -1) continue;
        const tagContent = afterMap.slice(jsxStart, tagEnd + 1);
        if (!/\bkey\s*=/.test(tagContent)) {
          const beforeMatch = code.slice(0, match.index);
          const lineNum = beforeMatch.split("\n").length;
          items.push({
            rule: "missing-key",
            category: "performance",
            severity: "important",
            message:
              ".map()で生成されたJSX要素にkey属性がありません。",
            suggestion: "ユニークなkey属性を追加する",
            line: lineNum,
          });
        }
      }
    },
  },

  // 4. Index used as key
  {
    check: (_code, lines, items) => {
      for (let i = 0; i < lines.length; i++) {
        if (
          /\.map\s*\(\s*\(\s*\w+\s*,\s*(\w+)\s*\)/.test(lines[i])
        ) {
          const indexName = lines[i].match(
            /\.map\s*\(\s*\(\s*\w+\s*,\s*(\w+)\s*\)/
          )?.[1];
          if (indexName) {
            // Check current and next few lines for key={indexName}
            const searchRange = lines.slice(i, i + 5).join("\n");
            const keyPattern = new RegExp(
              `key\\s*=\\s*\\{\\s*${indexName}\\s*\\}`
            );
            if (keyPattern.test(searchRange)) {
              items.push({
                rule: "no-index-key",
                category: "performance",
                severity: "recommended",
                message:
                  "配列のインデックスがkeyとして使用されています。リスト変更時にパフォーマンス問題が発生します。",
                suggestion: "安定したユニークIDをkeyに使用する",
                line: i + 1,
              });
            }
          }
        }
      }
    },
  },

  // 5. State that could be derived
  {
    check: (code, _lines, items) => {
      const stateMatches = code.match(/useState/g);
      if (stateMatches && stateMatches.length > 5) {
        items.push({
          rule: "too-many-states",
          category: "performance",
          severity: "suggestion",
          message: `useState が${stateMatches.length}回使用されています。不要な再レンダリングの原因になる可能性があります。`,
          suggestion: "状態をより下位のコンポーネントに移動する",
        });
      }
    },
  },

  // ── Best Practices ──

  // 6. console.log left in code
  {
    check: (_code, lines, items) => {
      for (let i = 0; i < lines.length; i++) {
        if (/\bconsole\.(log|debug|info|warn)\s*\(/.test(lines[i])) {
          items.push({
            rule: "no-console",
            category: "bestPractice",
            severity: "recommended",
            message: "console出力が残っています。",
            suggestion: "本番コードからconsole.logを削除する",
            line: i + 1,
          });
        }
      }
    },
  },

  // 7. var instead of const/let
  {
    check: (_code, lines, items) => {
      for (let i = 0; i < lines.length; i++) {
        if (/\bvar\s+\w/.test(lines[i])) {
          items.push({
            rule: "no-var",
            category: "bestPractice",
            severity: "important",
            message: "varが使用されています。スコープの問題が発生する可能性があります。",
            suggestion: "constまたはletを使用する",
            line: i + 1,
          });
        }
      }
    },
  },

  // 8. Any type usage
  {
    check: (_code, lines, items) => {
      for (let i = 0; i < lines.length; i++) {
        if (/:\s*any\b/.test(lines[i]) || /as\s+any\b/.test(lines[i])) {
          items.push({
            rule: "no-any",
            category: "bestPractice",
            severity: "recommended",
            message: "any型が使用されています。型安全性が失われます。",
            suggestion: "具体的な型定義を使用する",
            line: i + 1,
          });
        }
      }
    },
  },

  // 9. Empty catch block
  {
    check: (code, _lines, items) => {
      const catchRegex = /catch\s*\([^)]*\)\s*\{\s*\}/g;
      let match;
      while ((match = catchRegex.exec(code)) !== null) {
        const beforeMatch = code.slice(0, match.index);
        const lineNum = beforeMatch.split("\n").length;
        items.push({
          rule: "no-empty-catch",
          category: "bestPractice",
          severity: "important",
          message:
            "空のcatchブロックが検出されました。エラーが無視されます。",
          suggestion: "エラーハンドリングを追加する",
          line: lineNum,
        });
      }
    },
  },

  // 10. Magic numbers
  {
    check: (_code, lines, items) => {
      const reported = new Set<number>();
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip imports, common values (0, 1, 2, 100), array indices, and CSS-like values
        if (/^\s*(import|\/\/|\/\*|\*)/.test(line)) continue;
        const magicMatch = line.match(
          /(?<![.\w"'`-])\b(\d{2,})\b(?!\s*[:%pxremvhw])/g
        );
        if (magicMatch) {
          for (const num of magicMatch) {
            const n = parseInt(num, 10);
            // Skip common harmless numbers and small numbers
            if (n <= 10 || n === 100 || n === 1000 || reported.has(i)) continue;
            // Skip if in a string context, className, or tailwind
            if (/className|"[^"]*"|'[^']*'|`[^`]*`/.test(line)) continue;
            reported.add(i);
            items.push({
              rule: "no-magic-number",
              category: "bestPractice",
              severity: "suggestion",
              message: `マジックナンバー ${num} が検出されました。意味が不明確です。`,
              suggestion: "定数に名前をつけて定義する",
              line: i + 1,
            });
          }
        }
      }
    },
  },

  // ── Maintainability ──

  // 11. Very long function (>50 lines)
  {
    check: (_code, lines, items) => {
      let funcStart = -1;
      let braceDepth = 0;
      let funcName = "";

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const funcMatch = line.match(
          /(?:function\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:\([^)]*\)|[a-zA-Z_$]\w*)\s*=>|(?:const|let)\s+(\w+)\s*=\s*function)/
        );

        if (funcMatch && funcStart === -1) {
          funcStart = i;
          funcName = funcMatch[1] || funcMatch[2] || funcMatch[3] || "anonymous";
          braceDepth = 0;
        }

        if (funcStart !== -1) {
          for (const ch of line) {
            if (ch === "{") braceDepth++;
            if (ch === "}") braceDepth--;
          }

          if (braceDepth <= 0 && i > funcStart) {
            const length = i - funcStart + 1;
            if (length > 50) {
              items.push({
                rule: "function-too-long",
                category: "maintainability",
                severity: "suggestion",
                message: `関数「${funcName}」が${length}行あります。可読性が低下します。`,
                suggestion: "小さなコンポーネントに分割する",
                line: funcStart + 1,
              });
            }
            funcStart = -1;
            braceDepth = 0;
          }
        }
      }
    },
  },

  // 12. Too many props (>7)
  {
    check: (code, _lines, items) => {
      const propsRegex =
        /(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:function\s*)?\()\s*\(\s*\{([^}]{100,})\}/g;
      let match;
      while ((match = propsRegex.exec(code)) !== null) {
        const propsContent = match[1];
        const propCount = propsContent.split(",").filter((p) => p.trim()).length;
        if (propCount > 7) {
          const beforeMatch = code.slice(0, match.index);
          const lineNum = beforeMatch.split("\n").length;
          items.push({
            rule: "too-many-props",
            category: "maintainability",
            severity: "suggestion",
            message: `${propCount}個のpropsが渡されています。コンポーネントの責務が大きすぎる可能性があります。`,
            suggestion:
              "コンポーネントを分割するか、propsオブジェクトを使用する",
            line: lineNum,
          });
        }
      }
    },
  },

  // 13. Deeply nested ternary
  {
    check: (_code, lines, items) => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Count ? operators in a single line, excluding optional chaining (?.)
        const ternaries = line.replace(/\?\./g, "").match(/\?/g);
        if (ternaries && ternaries.length >= 2) {
          items.push({
            rule: "no-nested-ternary",
            category: "maintainability",
            severity: "recommended",
            message:
              "ネストされた三項演算子が検出されました。可読性が低下します。",
            suggestion: "条件分岐をシンプルにする",
            line: i + 1,
          });
        }
      }
    },
  },

  // 14. Hardcoded strings in JSX
  {
    check: (_code, lines, items) => {
      let hardcodedCount = 0;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        // Match JSX text content (between > and <) that contains Japanese or significant text
        if (/>\s*[^\s<{][^<{]*[^\s<{]\s*</.test(line)) {
          hardcodedCount++;
        }
      }
      // Only flag if there are many hardcoded strings
      if (hardcodedCount > 10) {
        items.push({
          rule: "no-hardcoded-strings",
          category: "maintainability",
          severity: "suggestion",
          message: `${hardcodedCount}個のハードコードされた文字列が検出されました。i18n対応が困難になります。`,
          suggestion: "定数または翻訳キーに抽出する",
        });
      }
    },
  },

  // 15. Missing error boundary suggestion
  {
    check: (code, _lines, items) => {
      const hasAsyncOps =
        /\bfetch\s*\(/.test(code) ||
        /\bawait\b/.test(code) ||
        /\.then\s*\(/.test(code);
      const hasComplexState =
        (code.match(/useState/g)?.length ?? 0) >= 3 ||
        /useReducer/.test(code);

      if (
        (hasAsyncOps || hasComplexState) &&
        !/ErrorBoundary/i.test(code) &&
        !/error\s*boundary/i.test(code)
      ) {
        items.push({
          rule: "error-boundary",
          category: "maintainability",
          severity: "suggestion",
          message:
            "非同期処理や複雑な状態を含むコンポーネントですが、ErrorBoundaryが検出されませんでした。",
          suggestion: "エラーバウンダリで囲む",
        });
      }
    },
  },
];

export function analyzeCode(code: string): OptimizationItem[] {
  const items: OptimizationItem[] = [];
  const lines = code.split("\n");

  for (const rule of RULES) {
    rule.check(code, lines, items);
  }

  return items;
}

export function getOptimizationScore(items: OptimizationItem[]): number {
  let score = 100;

  for (const item of items) {
    switch (item.severity) {
      case "important":
        score -= 10;
        break;
      case "recommended":
        score -= 5;
        break;
      case "suggestion":
        score -= 2;
        break;
    }
  }

  return Math.max(0, score);
}
