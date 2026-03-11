export type SecurityIssue = {
  severity: "high" | "medium" | "low";
  pattern: string;
  message: string;
  line?: number;
};

const RULES: {
  pattern: RegExp;
  severity: SecurityIssue["severity"];
  message: string;
}[] = [
  {
    pattern: /\beval\s*\(/,
    severity: "high",
    message: "eval()の使用を検出。任意コード実行のリスクがあります。",
  },
  {
    pattern: /\bFunction\s*\(/,
    severity: "high",
    message: "Function()コンストラクタを検出。コードインジェクションのリスクがあります。",
  },
  {
    pattern: /\.innerHTML\s*=/,
    severity: "high",
    message: "innerHTML代入を検出。XSS攻撃のリスクがあります。",
  },
  {
    pattern: /dangerouslySetInnerHTML/,
    severity: "high",
    message: "dangerouslySetInnerHTMLを検出。XSSリスクがあります。",
  },
  {
    pattern: /document\.cookie/,
    severity: "high",
    message: "document.cookieへのアクセスを検出。Cookie窃取のリスクがあります。",
  },
  {
    pattern: /document\.write/,
    severity: "medium",
    message: "document.write()を検出。DOM操作のリスクがあります。",
  },
  {
    pattern: /window\.location\s*=/,
    severity: "medium",
    message: "リダイレクト操作を検出。フィッシングリスクがあります。",
  },
  {
    pattern: /localStorage|sessionStorage/,
    severity: "low",
    message: "ストレージアクセスを検出。データ漏洩の可能性があります。",
  },
  {
    pattern: /fetch\s*\(|XMLHttpRequest|\.ajax\(/,
    severity: "medium",
    message: "外部通信を検出。データ送信リスクがあります。",
  },
  {
    pattern: /<script[\s>]/i,
    severity: "high",
    message: "scriptタグを検出。スクリプトインジェクションのリスクがあります。",
  },
  {
    pattern: /on(error|load|click|mouseover)\s*=/i,
    severity: "medium",
    message: "インラインイベントハンドラを検出。",
  },
  {
    pattern: /atob\s*\(|btoa\s*\(/,
    severity: "low",
    message: "Base64エンコード/デコードを検出。難読化の可能性があります。",
  },
];

export function scanCode(code: string): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const lines = code.split("\n");

  for (const rule of RULES) {
    for (let i = 0; i < lines.length; i++) {
      if (rule.pattern.test(lines[i])) {
        issues.push({
          severity: rule.severity,
          pattern: rule.pattern.source,
          message: rule.message,
          line: i + 1,
        });
      }
    }
  }

  return issues;
}

export function getHighestSeverity(
  issues: SecurityIssue[]
): SecurityIssue["severity"] | null {
  if (issues.some((i) => i.severity === "high")) return "high";
  if (issues.some((i) => i.severity === "medium")) return "medium";
  if (issues.some((i) => i.severity === "low")) return "low";
  return null;
}
