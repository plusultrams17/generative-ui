export type A11ySeverity = "error" | "warning" | "info";

export type A11yIssue = {
  rule: string;
  severity: A11ySeverity;
  message: string;
  line?: number;
  wcag?: string;
};

type A11yRule = {
  check: (code: string, lines: string[], issues: A11yIssue[]) => void;
};

const A11Y_RULES: A11yRule[] = [
  // 1. Missing img alt (WCAG 1.1.1)
  {
    check: (_code, lines, issues) => {
      for (let i = 0; i < lines.length; i++) {
        if (/<img\b/i.test(lines[i]) && !/\balt\s*=/i.test(lines[i])) {
          issues.push({
            rule: "img-alt",
            severity: "error",
            message: "<img>要素にalt属性がありません。代替テキストを追加してください。",
            line: i + 1,
            wcag: "1.1.1",
          });
        }
      }
    },
  },
  // 2. Empty alt on decorative img (WCAG 1.1.1)
  {
    check: (_code, lines, issues) => {
      for (let i = 0; i < lines.length; i++) {
        if (/<img\b/i.test(lines[i]) && /\balt\s*=\s*["']\s*["']/i.test(lines[i])) {
          issues.push({
            rule: "img-alt-empty",
            severity: "info",
            message:
              '<img>のalt属性が空です。装飾画像の場合は問題ありませんが、意味のある画像にはalt=""を避けてください。',
            line: i + 1,
            wcag: "1.1.1",
          });
        }
      }
    },
  },
  // 3. Missing form labels (WCAG 1.3.1)
  {
    check: (_code, lines, issues) => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          /<(input|select|textarea)\b/i.test(line) &&
          !/type\s*=\s*["'](?:hidden|submit|button|reset|image)["']/i.test(line) &&
          !/aria-label\s*=/i.test(line) &&
          !/aria-labelledby\s*=/i.test(line) &&
          !/id\s*=/.test(line)
        ) {
          issues.push({
            rule: "form-label",
            severity: "error",
            message:
              "フォーム要素にラベルが関連付けられていません。<label>、aria-label、またはaria-labelledbyを追加してください。",
            line: i + 1,
            wcag: "1.3.1",
          });
        }
      }
    },
  },
  // 4. Missing button text (WCAG 4.1.2)
  {
    check: (code, _lines, issues) => {
      const buttonRegex = /<(?:button|Button)\b[^>]*>\s*<(?:svg|img|Icon)\b[^>]*\/?\s*>\s*<\/(?:button|Button)>/gi;
      let match;
      while ((match = buttonRegex.exec(code)) !== null) {
        const beforeMatch = code.slice(0, match.index);
        const lineNum = beforeMatch.split("\n").length;
        if (!/aria-label\s*=/.test(match[0])) {
          issues.push({
            rule: "button-text",
            severity: "error",
            message:
              "ボタンにテキストコンテンツがありません。アイコンのみのボタンにはaria-labelを追加してください。",
            line: lineNum,
            wcag: "4.1.2",
          });
        }
      }
    },
  },
  // 5. Heading hierarchy skip (WCAG 1.3.1)
  {
    check: (_code, lines, issues) => {
      let lastLevel = 0;
      for (let i = 0; i < lines.length; i++) {
        const headingMatch = lines[i].match(/<h([1-6])\b/i);
        if (headingMatch) {
          const level = parseInt(headingMatch[1], 10);
          if (lastLevel > 0 && level > lastLevel + 1) {
            issues.push({
              rule: "heading-order",
              severity: "warning",
              message: `見出しレベルが飛んでいます（h${lastLevel}→h${level}）。見出しは順序通りに使用してください。`,
              line: i + 1,
              wcag: "1.3.1",
            });
          }
          lastLevel = level;
        }
      }
    },
  },
  // 6. Missing lang attribute (WCAG 3.1.1)
  {
    check: (_code, lines, issues) => {
      for (let i = 0; i < lines.length; i++) {
        if (/<html\b/i.test(lines[i]) && !/\blang\s*=/i.test(lines[i])) {
          issues.push({
            rule: "html-lang",
            severity: "warning",
            message: "<html>要素にlang属性がありません。ページの言語を指定してください。",
            line: i + 1,
            wcag: "3.1.1",
          });
        }
      }
    },
  },
  // 7. Positive tabindex (WCAG 2.4.3)
  {
    check: (_code, lines, issues) => {
      for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/tabIndex\s*=\s*\{?\s*["']?(\d+)["']?\s*\}?/i);
        if (match && parseInt(match[1], 10) > 0) {
          issues.push({
            rule: "no-positive-tabindex",
            severity: "warning",
            message: `tabIndex={${match[1]}}が検出されました。正の値はフォーカス順序を乱します。0または-1を使用してください。`,
            line: i + 1,
            wcag: "2.4.3",
          });
        }
      }
    },
  },
  // 8. Missing focus indicator (WCAG 2.4.7)
  {
    check: (code, _lines, issues) => {
      const hasInteractive =
        /<(button|a|input|select|textarea)\b/i.test(code) ||
        /onClick\s*=/i.test(code);
      if (hasInteractive) {
        const hasFocusStyles =
          /focus-visible:/i.test(code) ||
          /focus:/i.test(code) ||
          /:focus/i.test(code) ||
          /outline/i.test(code);
        if (!hasFocusStyles) {
          issues.push({
            rule: "focus-visible",
            severity: "info",
            message:
              "インタラクティブ要素にフォーカススタイルが検出されませんでした。focus-visibleスタイルの追加を検討してください。",
            wcag: "2.4.7",
          });
        }
      }
    },
  },
  // 9. Color-only information (WCAG 1.4.1)
  {
    check: (_code, lines, issues) => {
      for (let i = 0; i < lines.length; i++) {
        if (/(?:red|赤)\s*(?:means?|は|=|indicates?|表す)/i.test(lines[i]) ||
            /(?:color|色)\s*(?:only|のみ|だけ)/i.test(lines[i])) {
          issues.push({
            rule: "color-only",
            severity: "info",
            message:
              "色のみで情報を伝えている可能性があります。テキストやアイコンなど追加の手がかりを提供してください。",
            line: i + 1,
            wcag: "1.4.1",
          });
        }
      }
    },
  },
  // 10. Missing aria-label on icon buttons (WCAG 4.1.2)
  {
    check: (_code, lines, issues) => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          /<(?:button|Button)\b/i.test(line) &&
          /size\s*=\s*["']icon["']/i.test(line) &&
          !/aria-label\s*=/i.test(line)
        ) {
          issues.push({
            rule: "icon-button-label",
            severity: "error",
            message:
              "アイコンボタンにaria-labelがありません。スクリーンリーダー用のラベルを追加してください。",
            line: i + 1,
            wcag: "4.1.2",
          });
        }
      }
    },
  },
  // 11. Auto-playing media (WCAG 1.4.2)
  {
    check: (_code, lines, issues) => {
      for (let i = 0; i < lines.length; i++) {
        if (/<(audio|video)\b/i.test(lines[i]) && /\bautoplay\b/i.test(lines[i])) {
          issues.push({
            rule: "no-autoplay",
            severity: "warning",
            message:
              "メディアの自動再生が検出されました。ユーザーが制御できるようにしてください。",
            line: i + 1,
            wcag: "1.4.2",
          });
        }
      }
    },
  },
  // 12. Missing role on clickable div (WCAG 4.1.2)
  {
    check: (_code, lines, issues) => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          /<div\b/i.test(line) &&
          /onClick\s*=/i.test(line) &&
          !/\brole\s*=/i.test(line)
        ) {
          issues.push({
            rule: "clickable-div-role",
            severity: "info",
            message:
              "クリック可能な<div>にrole属性がありません。role=\"button\"の追加を検討してください。",
            line: i + 1,
            wcag: "4.1.2",
          });
        }
      }
    },
  },
];

export function scanA11y(code: string): A11yIssue[] {
  const issues: A11yIssue[] = [];
  const lines = code.split("\n");

  for (const rule of A11Y_RULES) {
    rule.check(code, lines, issues);
  }

  return issues;
}

export function getHighestA11ySeverity(
  issues: A11yIssue[]
): A11ySeverity | null {
  if (issues.some((i) => i.severity === "error")) return "error";
  if (issues.some((i) => i.severity === "warning")) return "warning";
  if (issues.some((i) => i.severity === "info")) return "info";
  return null;
}
