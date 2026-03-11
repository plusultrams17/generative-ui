import { slugify } from "./project-exporter";
import { escapeJsx, generateLayout } from "./shared-constants";

type ExportableComponent = {
  title: string;
  description: string;
  code: string;
  toolName: string;
  toolData: Record<string, unknown>;
};

type DeployFile = {
  file: string;
  data: string;
};

export function generateDeployFiles(
  component: ExportableComponent
): DeployFile[] {
  const files: DeployFile[] = [];

  files.push({
    file: "package.json",
    data: JSON.stringify(
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
    ),
  });

  files.push({
    file: "next.config.ts",
    data: `import type { NextConfig } from "next";\nconst config: NextConfig = {};\nexport default config;\n`,
  });

  files.push({
    file: "postcss.config.mjs",
    data: `const config = {\n  plugins: {\n    "@tailwindcss/postcss": {},\n  },\n};\nexport default config;\n`,
  });

  files.push({
    file: "src/app/globals.css",
    data: `@import "tailwindcss";\n`,
  });

  files.push({
    file: "src/app/layout.tsx",
    data: generateLayout(component.title),
  });

  files.push({
    file: "src/app/page.tsx",
    data: generatePage(component),
  });

  files.push({
    file: "tsconfig.json",
    data: JSON.stringify(
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
    ),
  });

  return files;
}

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
  const hasAppExport =
    /export\s+default\s+function|export\s+default\s+class|function\s+App\s*\(|const\s+App\s*=/m.test(
      code
    );

  if (hasAppExport) {
    return `"use client";\n\n${code}\n`;
  }

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
              {field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">選択してください</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  required={field.required}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            ${escapeJsx(submitLabel)}
          </button>
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
  const columnsJson = JSON.stringify(columns, null, 2);
  const rowsJson = JSON.stringify(rows, null, 2);

  return `"use client";

type Column = { key: string; label: string; type: string; align: "left" | "center" | "right" };

const columns: Column[] = ${columnsJson};
const rows: Record<string, string>[] = ${rowsJson};

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
                  <th key={col.key} className="px-4 py-3 font-medium text-gray-500 text-left">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 last:border-0">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">{row[col.key]}</td>
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
  const items =
    (data.data as Array<{ label: string; value: number; color?: string }>) ||
    [];
  const COLORS = [
    "#3b82f6", "#22c55e", "#f59e0b", "#ef4444",
    "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16",
  ];
  const itemsWithColors = items.map((item, i) => ({
    ...item,
    color: item.color || COLORS[i % COLORS.length],
  }));
  const dataJson = JSON.stringify(itemsWithColors, null, 2);
  const maxVal = Math.max(...items.map((d) => d.value), 1);

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

