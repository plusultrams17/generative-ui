import { useMemo } from "react";
import { tokenize, type TokenType } from "@/lib/syntax-highlighter";

type HighlightedCodeProps = {
  code: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
};

const TOKEN_CLASSES: Record<TokenType, string> = {
  keyword: "text-purple-500 dark:text-purple-400",
  string: "text-green-600 dark:text-green-400",
  number: "text-orange-500 dark:text-orange-400",
  comment: "text-gray-400 dark:text-gray-500 italic",
  tag: "text-red-500 dark:text-red-400",
  attribute: "text-yellow-600 dark:text-yellow-400",
  operator: "text-cyan-500 dark:text-cyan-400",
  function: "text-blue-500 dark:text-blue-400",
  className: "text-yellow-600 dark:text-yellow-400",
  punctuation: "text-gray-500 dark:text-gray-400",
  plain: "text-zinc-200",
};

export function HighlightedCode({
  code,
  showLineNumbers = true,
  maxHeight,
}: HighlightedCodeProps) {
  const tokens = useMemo(() => tokenize(code), [code]);

  const lines = useMemo(() => {
    const result: { type: TokenType; content: string }[][] = [[]];
    for (const token of tokens) {
      // Split token content by newlines to distribute across lines
      const parts = token.content.split("\n");
      for (let p = 0; p < parts.length; p++) {
        if (p > 0) {
          result.push([]);
        }
        if (parts[p].length > 0) {
          result[result.length - 1].push({
            type: token.type,
            content: parts[p],
          });
        }
      }
    }
    return result;
  }, [tokens]);

  const lineNumberWidth = String(lines.length).length;

  return (
    <pre
      className="overflow-x-auto overflow-y-auto rounded-lg bg-zinc-950 p-4 text-sm leading-relaxed"
      style={maxHeight ? { maxHeight } : undefined}
    >
      <code>
        {lines.map((lineTokens, lineIndex) => (
          <div key={lineIndex} className="flex">
            {showLineNumbers && (
              <span
                className="mr-4 inline-block select-none text-right text-zinc-500"
                style={{ minWidth: `${lineNumberWidth}ch` }}
              >
                {lineIndex + 1}
              </span>
            )}
            <span>
              {lineTokens.length > 0 ? (
                lineTokens.map((token, tokenIndex) => (
                  <span key={tokenIndex} className={TOKEN_CLASSES[token.type]}>
                    {token.content}
                  </span>
                ))
              ) : (
                "\n"
              )}
            </span>
          </div>
        ))}
      </code>
    </pre>
  );
}
