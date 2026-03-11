"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  content: string;
};

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            return (
              <code className="block overflow-x-auto rounded-lg bg-background/50 p-3 text-xs font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className="rounded bg-background/50 px-1.5 py-0.5 text-xs font-mono">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="my-2">{children}</pre>,
        ul: ({ children }) => (
          <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => (
          <h1 className="mb-2 text-base font-bold">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-2 text-sm font-bold">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-1 text-sm font-semibold">{children}</h3>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="my-2 overflow-x-auto">
            <table className="w-full text-xs border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-border/50 bg-background/30 px-2 py-1 text-left font-medium">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-border/50 px-2 py-1">{children}</td>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-2 border-l-2 border-border pl-3 italic opacity-80">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-3 border-border/50" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
