import JSZip from "jszip";
import { escapeJsx, generateLayout } from "./shared-constants";

type ExportableComponent = {
  title: string;
  description: string;
  code: string;
  toolName: string;
  toolData: Record<string, unknown>;
};

export async function generateProjectZip(
  component: ExportableComponent
): Promise<Blob> {
  const zip = new JSZip();

  zip.file(
    "package.json",
    JSON.stringify(
      {
        name: slugify(component.title),
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

  zip.file("src/app/layout.tsx", generateLayout(component.title));

  zip.file("src/app/page.tsx", generatePage(component));

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

  zip.file("README.md", generateReadme(component));

  return zip.generateAsync({ type: "blob" });
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "generated-ui"
  );
}

export { slugify };

function generatePage(component: ExportableComponent): string {
  if (component.toolName === "generateCustomComponent" && component.code) {
    return generateCustomPage(component);
  }
  if (component.toolName === "showForm") {
    return generateFormPage(component.toolData);
  }
  if (component.toolName === "showTable") {
    return generateTablePage(component.toolData);
  }
  if (component.toolName === "showChart") {
    return generateChartPage(component.toolData);
  }
  return generateCustomPage(component);
}

function generateCustomPage(component: ExportableComponent): string {
  const code = component.code || "";
  // Check if the code already has an App function/component defined
  const hasAppExport = /export\s+default\s+function|export\s+default\s+class|function\s+App\s*\(|const\s+App\s*=/m.test(code);

  if (hasAppExport) {
    // The code defines its own component, wrap it as a module
    return `"use client";

${code}
`;
  }

  // Treat the code as JSX content to embed in a page
  return `"use client";

export default function Page() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        ${code}
      </div>
    </main>
  );
}
`;
}

function generateFormPage(data: Record<string, unknown>): string {
  const title = (data.title as string) || "";
  const description = (data.description as string) || "";
  const submitLabel = (data.submitLabel as string) || "送信";
  const layout = (data.layout as string) || "vertical";
  const fields = (data.fields as Array<Record<string, unknown>>) || [];

  const fieldsJson = JSON.stringify(fields, null, 2);

  return `"use client";

import { useState } from "react";

type FormField = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

const fields: FormField[] = ${fieldsJson};

export default function Page() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Form data:", data);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">${escapeJsx(title)}</h1>
        ${description ? `<p className="mt-1 text-sm text-gray-500">${escapeJsx(description)}</p>` : ""}
        <form onSubmit={handleSubmit} className="${layout === "grid" ? "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2" : "mt-6 flex flex-col gap-4"}">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label htmlFor={field.name} className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="ml-0.5 text-red-500">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <div className="flex items-center gap-2">
                  <input
                    id={field.name}
                    name={field.name}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-600">{field.placeholder || field.label}</span>
                </div>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              )}
            </div>
          ))}
          <div className="${layout === "grid" ? "col-span-full" : ""}">
            <button
              type="submit"
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              ${escapeJsx(submitLabel)}
            </button>
          </div>
        </form>
        {submitted && (
          <p className="mt-4 text-center text-sm text-green-600">送信が完了しました</p>
        )}
      </div>
    </main>
  );
}
`;
}

function generateTablePage(data: Record<string, unknown>): string {
  const title = (data.title as string) || "";
  const description = (data.description as string) || "";
  const columns = (data.columns as Array<Record<string, string>>) || [];
  const rows = (data.rows as Array<Record<string, string>>) || [];
  const striped = data.striped !== false;

  const columnsJson = JSON.stringify(columns, null, 2);
  const rowsJson = JSON.stringify(rows, null, 2);

  return `"use client";

type Column = {
  key: string;
  label: string;
  type: string;
  align: "left" | "center" | "right";
};

const columns: Column[] = ${columnsJson};
const rows: Record<string, string>[] = ${rowsJson};

const alignClass: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function Page() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">${escapeJsx(title)}</h1>
        ${description ? `<p className="mt-1 text-sm text-gray-500">${escapeJsx(description)}</p>` : ""}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={\`px-4 py-3 font-medium text-gray-500 \${alignClass[col.align] || "text-left"}\`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={\`border-b border-gray-100 last:border-0 ${striped ? "${i % 2 === 1 ? \"bg-gray-50\" : \"\"}" : ""}\`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={\`px-4 py-3 \${alignClass[col.align] || "text-left"}\`}
                    >
                      {col.type === "badge" ? (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          {row[col.key]}
                        </span>
                      ) : (
                        row[col.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
`;
}

function generateChartPage(data: Record<string, unknown>): string {
  const title = (data.title as string) || "";
  const description = (data.description as string) || "";
  const chartType = (data.type as string) || "bar";
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

  const itemsWithColors = items.map((item, i) => ({
    ...item,
    color: item.color || COLORS[i % COLORS.length],
  }));

  const dataJson = JSON.stringify(itemsWithColors, null, 2);
  const maxVal = Math.max(...items.map((d) => d.value), 1);
  const total = items.reduce((sum, d) => sum + d.value, 0);

  if (chartType === "pie" || chartType === "donut") {
    return `export default function Page() {
  const data = ${dataJson};
  const total = ${total};

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">${escapeJsx(title)}</h1>
        ${description ? `<p className="mt-1 text-sm text-gray-500">${escapeJsx(description)}</p>` : ""}
        <div className="mt-6 space-y-3">
          {data.map((item: { label: string; value: number; color: string }, i: number) => {
            const pct = Math.round((item.value / total) * 100);
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="flex-1 text-sm text-gray-700">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
                <span className="text-xs text-gray-400 w-10 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-sm text-gray-400">合計: {total}</p>
      </div>
    </main>
  );
}
`;
  }

  if (chartType === "line") {
    return `export default function Page() {
  const data = ${dataJson};
  const maxVal = ${maxVal};
  const svgWidth = 600;
  const svgHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const points = data.map((d: { label: string; value: number; color: string }, i: number) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padding.top + chartH - (d.value / maxVal) * chartH,
    ...d,
  }));

  const linePath = points.map((p: { x: number; y: number }, i: number) => \`\${i === 0 ? "M" : "L"}\${p.x},\${p.y}\`).join(" ");

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">${escapeJsx(title)}</h1>
        ${description ? `<p className="mt-1 text-sm text-gray-500">${escapeJsx(description)}</p>` : ""}
        <div className="mt-6">
          <svg viewBox={\`0 0 \${svgWidth} \${svgHeight}\`} className="w-full">
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = padding.top + chartH * (1 - t);
              return (
                <g key={t}>
                  <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="#e5e7eb" />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" className="text-xs fill-gray-400">
                    {Math.round(maxVal * t)}
                  </text>
                </g>
              );
            })}
            <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinejoin="round" />
            {points.map((p: { x: number; y: number; label: string; value: number }, i: number) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
                <text x={p.x} y={svgHeight - 8} textAnchor="middle" className="text-xs fill-gray-500">
                  {p.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </main>
  );
}
`;
  }

  // Default: bar chart
  return `export default function Page() {
  const data = ${dataJson};
  const maxVal = ${maxVal};

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">${escapeJsx(title)}</h1>
        ${description ? `<p className="mt-1 text-sm text-gray-500">${escapeJsx(description)}</p>` : ""}
        <div className="mt-6 space-y-2">
          {data.map((item: { label: string; value: number; color: string }, i: number) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-20 text-right text-sm text-gray-600 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-7 rounded bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{ width: \`\${(item.value / maxVal) * 100}%\`, background: item.color }}
                />
              </div>
              <span className="w-12 text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
`;
}

function generateReadme(component: ExportableComponent): string {
  const escaped = component.title.replace(/`/g, "\\`");
  return `# ${escaped}

${component.description || "Generated UI Component"}

## セットアップ

\`\`\`bash
npm install
npm run dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド

\`\`\`bash
npm run build
npm start
\`\`\`

---

> このプロジェクトは **生成UI** — AIドリブンUIジェネレーター で生成されました。
`;
}

