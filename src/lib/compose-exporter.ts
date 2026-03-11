import JSZip from "jszip";
import type { ComposerItem } from "@/stores/composer-store";
import { slugify } from "./project-exporter";
import { TOOL_LABELS, escapeJsx } from "./shared-constants";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderFormHtml(data: Record<string, unknown>): string {
  const title = (data.title as string) || "";
  const description = (data.description as string) || "";
  const submitLabel = (data.submitLabel as string) || "送信";
  const fields = (data.fields as Array<Record<string, unknown>>) || [];

  let html = `<div style="max-width:32rem;margin:0 auto;border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;background:#fff;">`;
  html += `<h2 style="font-size:1.25rem;font-weight:700;color:#111;">${escapeHtml(title)}</h2>`;
  if (description) {
    html += `<p style="margin-top:0.25rem;font-size:0.875rem;color:#6b7280;">${escapeHtml(description)}</p>`;
  }
  html += `<form style="margin-top:1.5rem;display:flex;flex-direction:column;gap:1rem;">`;
  for (const field of fields) {
    const label = (field.label as string) || "";
    const name = (field.name as string) || "";
    const type = (field.type as string) || "text";
    const placeholder = (field.placeholder as string) || "";
    const required = field.required ? "required" : "";
    html += `<div style="display:flex;flex-direction:column;gap:0.375rem;">`;
    html += `<label style="font-size:0.875rem;font-weight:500;color:#374151;">${escapeHtml(label)}</label>`;
    if (type === "textarea") {
      html += `<textarea name="${escapeHtml(name)}" placeholder="${escapeHtml(placeholder)}" ${required} rows="3" style="border:1px solid #d1d5db;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;"></textarea>`;
    } else if (type === "select") {
      const options = (field.options as string[]) || [];
      html += `<select name="${escapeHtml(name)}" ${required} style="border:1px solid #d1d5db;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;">`;
      html += `<option value="">選択してください</option>`;
      for (const opt of options) {
        html += `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`;
      }
      html += `</select>`;
    } else {
      html += `<input type="${escapeHtml(type)}" name="${escapeHtml(name)}" placeholder="${escapeHtml(placeholder)}" ${required} style="border:1px solid #d1d5db;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;" />`;
    }
    html += `</div>`;
  }
  html += `<button type="submit" style="width:100%;padding:0.625rem 1rem;background:#111;color:#fff;border:none;border-radius:0.5rem;font-size:0.875rem;font-weight:500;cursor:pointer;">${escapeHtml(submitLabel)}</button>`;
  html += `</form></div>`;
  return html;
}

function renderTableHtml(data: Record<string, unknown>): string {
  const title = (data.title as string) || "";
  const description = (data.description as string) || "";
  const columns = (data.columns as Array<Record<string, string>>) || [];
  const rows = (data.rows as Array<Record<string, string>>) || [];

  let html = `<div style="max-width:56rem;margin:0 auto;border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;background:#fff;">`;
  html += `<h2 style="font-size:1.25rem;font-weight:700;color:#111;">${escapeHtml(title)}</h2>`;
  if (description) {
    html += `<p style="margin-top:0.25rem;font-size:0.875rem;color:#6b7280;">${escapeHtml(description)}</p>`;
  }
  html += `<div style="margin-top:1.5rem;overflow-x:auto;"><table style="width:100%;font-size:0.875rem;border-collapse:collapse;">`;
  html += `<thead><tr style="border-bottom:1px solid #e5e7eb;">`;
  for (const col of columns) {
    html += `<th style="padding:0.75rem 1rem;font-weight:500;color:#6b7280;text-align:${col.align || "left"};">${escapeHtml(col.label)}</th>`;
  }
  html += `</tr></thead><tbody>`;
  for (let i = 0; i < rows.length; i++) {
    const bg = i % 2 === 1 ? "background:#f9fafb;" : "";
    html += `<tr style="border-bottom:1px solid #f3f4f6;${bg}">`;
    for (const col of columns) {
      html += `<td style="padding:0.75rem 1rem;text-align:${col.align || "left"};">${escapeHtml(rows[i][col.key] || "")}</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table></div></div>`;
  return html;
}

function renderChartHtml(data: Record<string, unknown>): string {
  const title = (data.title as string) || "";
  const description = (data.description as string) || "";
  const items =
    (data.data as Array<{ label: string; value: number; color?: string }>) ||
    [];
  const COLORS = [
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
  ];
  const maxVal = Math.max(...items.map((d) => d.value), 1);

  let html = `<div style="max-width:40rem;margin:0 auto;border:1px solid #e5e7eb;border-radius:0.75rem;padding:1.5rem;background:#fff;">`;
  html += `<h2 style="font-size:1.25rem;font-weight:700;color:#111;">${escapeHtml(title)}</h2>`;
  if (description) {
    html += `<p style="margin-top:0.25rem;font-size:0.875rem;color:#6b7280;">${escapeHtml(description)}</p>`;
  }
  html += `<div style="margin-top:1.5rem;display:flex;flex-direction:column;gap:0.5rem;">`;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const color = item.color || COLORS[i % COLORS.length];
    const pct = Math.round((item.value / maxVal) * 100);
    html += `<div style="display:flex;align-items:center;gap:0.75rem;">`;
    html += `<span style="width:5rem;text-align:right;font-size:0.875rem;color:#4b5563;flex-shrink:0;">${escapeHtml(item.label)}</span>`;
    html += `<div style="flex:1;height:1.75rem;background:#f3f4f6;border-radius:0.25rem;overflow:hidden;">`;
    html += `<div style="height:100%;width:${pct}%;background:${color};border-radius:0.25rem;"></div>`;
    html += `</div>`;
    html += `<span style="width:3rem;font-size:0.875rem;font-weight:500;color:#111;">${item.value}</span>`;
    html += `</div>`;
  }
  html += `</div></div>`;
  return html;
}

function renderCustomHtml(data: Record<string, unknown>): string {
  const code = (data.code as string) || "";
  return `<div id="custom-${crypto.randomUUID().slice(0, 8)}">
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script src="https://unpkg.com/react@19/umd/react.production.min.js"><\/script>
    <script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"><\/script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    <div id="root-${crypto.randomUUID().slice(0, 8)}"></div>
    <script type="text/babel">
      try {
        ${code}
        const rootEl = document.currentScript.previousElementSibling;
        const root = ReactDOM.createRoot(rootEl);
        root.render(React.createElement(App));
      } catch(e) {
        console.error(e);
      }
    <\/script>
  </div>`;
}

function renderItemHtml(item: ComposerItem): string {
  const label = TOOL_LABELS[item.toolName] || item.toolName;

  switch (item.toolName) {
    case "showForm":
      return renderFormHtml(item.toolData);
    case "showTable":
      return renderTableHtml(item.toolData);
    case "showChart":
      return renderChartHtml(item.toolData);
    case "generateCustomComponent":
      return renderCustomHtml(item.toolData);
    default:
      return `<div style="padding:2rem;text-align:center;color:#6b7280;">${escapeHtml(label)}: ${escapeHtml(item.title)}</div>`;
  }
}

export function generateComposedHtml(items: ComposerItem[]): string {
  const sections = items
    .map(
      (item, i) => `
    <section style="margin-bottom:2rem;">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">
        <span style="font-size:0.75rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(TOOL_LABELS[item.toolName] || item.toolName)}</span>
        <span style="font-size:0.75rem;color:#9ca3af;">|</span>
        <span style="font-size:0.875rem;font-weight:600;color:#111;">${escapeHtml(item.title)}</span>
      </div>
      ${renderItemHtml(item)}
      ${i < items.length - 1 ? '<hr style="margin-top:2rem;border:none;border-top:1px solid #e5e7eb;" />' : ""}
    </section>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>コンポーズドページ</title>
  <style>
    body {
      margin: 0;
      padding: 2rem;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #f9fafb;
      color: #111827;
    }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  <div style="max-width:64rem;margin:0 auto;">
    ${sections}
  </div>
</body>
</html>`;
}

function generateComponentCode(item: ComposerItem, index: number): string {
  const componentName = `Section${index}`;

  if (item.toolName === "generateCustomComponent") {
    const code = (item.toolData.code as string) || "";
    const hasAppExport =
      /export\s+default\s+function|export\s+default\s+class|function\s+App\s*\(|const\s+App\s*=/m.test(
        code
      );
    if (hasAppExport) {
      // Rename App to SectionN to avoid conflicts
      const renamed = code
        .replace(/export\s+default\s+function\s+App/g, `function ${componentName}`)
        .replace(/function\s+App\s*\(/g, `function ${componentName}(`)
        .replace(/const\s+App\s*=/g, `const ${componentName} =`)
        .replace(/export\s+default\s+/g, "");
      return renamed;
    }
    return `function ${componentName}() {\n  return (\n    <div className="mx-auto max-w-4xl">\n      ${code}\n    </div>\n  );\n}`;
  }

  if (item.toolName === "showForm") {
    const data = item.toolData;
    const title = (data.title as string) || "";
    const description = (data.description as string) || "";
    const submitLabel = (data.submitLabel as string) || "送信";
    const fields = (data.fields as Array<Record<string, unknown>>) || [];
    const fieldsJson = JSON.stringify(fields, null, 2);

    return `function ${componentName}() {
  const [submitted, setSubmitted] = React.useState(false);
  const fields = ${fieldsJson};
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }
  return (
    <div className="w-full max-w-lg mx-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">${escapeJsx(title)}</h2>
      ${description ? `<p className="mt-1 text-sm text-gray-500">${escapeJsx(description)}</p>` : ""}
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {fields.map((field: any) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea name={field.name} placeholder={field.placeholder} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={3} />
            ) : field.type === "select" ? (
              <select name={field.name} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
                <option value="">選択してください</option>
                {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : (
              <input type={field.type || "text"} name={field.name} placeholder={field.placeholder} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            )}
          </div>
        ))}
        <button type="submit" className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">${escapeJsx(submitLabel)}</button>
      </form>
      {submitted && <p className="mt-4 text-center text-sm text-green-600">送信が完了しました</p>}
    </div>
  );
}`;
  }

  if (item.toolName === "showTable") {
    const data = item.toolData;
    const title = (data.title as string) || "";
    const description = (data.description as string) || "";
    const columns = (data.columns as Array<Record<string, string>>) || [];
    const rows = (data.rows as Array<Record<string, string>>) || [];

    return `function ${componentName}() {
  const columns = ${JSON.stringify(columns, null, 2)};
  const rows = ${JSON.stringify(rows, null, 2)};
  return (
    <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">${escapeJsx(title)}</h2>
      ${description ? `<p className="mt-1 text-sm text-gray-500">${escapeJsx(description)}</p>` : ""}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200">
            {columns.map((col: any) => <th key={col.key} className="px-4 py-3 font-medium text-gray-500 text-left">{col.label}</th>)}
          </tr></thead>
          <tbody>
            {rows.map((row: any, i: number) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                {columns.map((col: any) => <td key={col.key} className="px-4 py-3">{row[col.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`;
  }

  if (item.toolName === "showChart") {
    const data = item.toolData;
    const title = (data.title as string) || "";
    const description = (data.description as string) || "";
    const chartItems =
      (data.data as Array<{ label: string; value: number; color?: string }>) ||
      [];
    const COLORS = [
      "#3b82f6",
      "#22c55e",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
    ];
    const itemsWithColors = chartItems.map((d, i) => ({
      ...d,
      color: d.color || COLORS[i % COLORS.length],
    }));
    const maxVal = Math.max(...chartItems.map((d) => d.value), 1);

    return `function ${componentName}() {
  const data = ${JSON.stringify(itemsWithColors, null, 2)};
  const maxVal = ${maxVal};
  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900">${escapeJsx(title)}</h2>
      ${description ? `<p className="mt-1 text-sm text-gray-500">${escapeJsx(description)}</p>` : ""}
      <div className="mt-6 space-y-2">
        {data.map((item: any, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-20 text-right text-sm text-gray-600 flex-shrink-0">{item.label}</span>
            <div className="flex-1 h-7 rounded bg-gray-100 overflow-hidden">
              <div className="h-full rounded" style={{ width: \`\${(item.value / maxVal) * 100}%\`, background: item.color }} />
            </div>
            <span className="w-12 text-sm font-medium text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`;
  }

  return `function ${componentName}() {\n  return <div className="p-4 text-center text-gray-500">${escapeJsx(item.title)}</div>;\n}`;
}

export async function generateComposedProjectZip(
  items: ComposerItem[],
  title: string
): Promise<Blob> {
  const zip = new JSZip();

  zip.file(
    "package.json",
    JSON.stringify(
      {
        name: slugify(title),
        version: "1.0.0",
        private: true,
        scripts: {
          dev: "next dev",
          build: "next build",
          start: "next start",
        },
        dependencies: {
          next: "^15.0.0",
          react: "^19.0.0",
          "react-dom": "^19.0.0",
          tailwindcss: "^4.0.0",
          "@tailwindcss/postcss": "^4.0.0",
        },
      },
      null,
      2
    )
  );

  zip.file(
    "next.config.ts",
    `import type { NextConfig } from "next";\nconst config: NextConfig = {};\nexport default config;\n`
  );

  zip.file(
    "postcss.config.mjs",
    `const config = {\n  plugins: {\n    "@tailwindcss/postcss": {},\n  },\n};\nexport default config;\n`
  );

  zip.file("src/app/globals.css", `@import "tailwindcss";\n`);

  const escapedTitle = title.replace(/"/g, '\\"');
  zip.file(
    "src/app/layout.tsx",
    `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${escapedTitle}",
  description: "Composed UI Page",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
`
  );

  const componentCodes = items.map((item, i) => generateComponentCode(item, i));
  const componentNames = items.map((_, i) => `Section${i}`);

  const pageCode = `"use client";

import React from "react";

${componentCodes.join("\n\n")}

export default function Page() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-5xl space-y-12">
        <h1 className="text-2xl font-bold text-gray-900">${escapedTitle}</h1>
${componentNames.map((name) => `        <section>\n          <${name} />\n        </section>`).join("\n")}
      </div>
    </main>
  );
}
`;

  zip.file("src/app/page.tsx", pageCode);

  zip.file(
    "tsconfig.json",
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2017",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          paths: { "@/*": ["./src/*"] },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
        exclude: ["node_modules"],
      },
      null,
      2
    )
  );

  zip.file(
    "README.md",
    `# ${title}

コンポーズドUIページ (${items.length}コンポーネント)

## セットアップ

\`\`\`bash
npm install
npm run dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

---

> このプロジェクトは **生成UI** — AIドリブンUIジェネレーター で生成されました。
`
  );

  return zip.generateAsync({ type: "blob" });
}
