function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type ShareableData = {
  toolName: string;
  data: Record<string, unknown>;
};

function generateFormHtml(data: Record<string, unknown>): string {
  const fields = (data.fields as Array<Record<string, string>>) || [];
  const fieldHtml = fields
    .map(
      (f) => `
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 4px; font-weight: 500; font-size: 14px;">${escapeHtml(f.label)}${f.required !== "false" ? '<span style="color: #ef4444; margin-left: 2px;">*</span>' : ""}</label>
        ${
          f.type === "textarea"
            ? `<textarea name="${escapeHtml(f.name)}" placeholder="${escapeHtml(f.placeholder || "")}" style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; min-height: 80px; resize: vertical;"></textarea>`
            : f.type === "select"
              ? `<select name="${escapeHtml(f.name)}" style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;"><option value="">選択してください</option>${(f.options || "").split(",").map((o: string) => `<option value="${escapeHtml(o.trim())}">${escapeHtml(o.trim())}</option>`).join("")}</select>`
              : `<input type="${escapeHtml(f.type || "text")}" name="${escapeHtml(f.name)}" placeholder="${escapeHtml(f.placeholder || "")}" style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;" />`
        }
      </div>`
    )
    .join("");

  return `
    <div style="max-width: 480px; margin: 0 auto;">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">${escapeHtml(String(data.title || ""))}</h2>
      ${data.description ? `<p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">${escapeHtml(String(data.description))}</p>` : ""}
      <form onsubmit="event.preventDefault(); alert('送信完了!');">
        ${fieldHtml}
        <button type="submit" style="width: 100%; padding: 10px; background: #0f172a; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">${escapeHtml(String(data.submitLabel || "送信"))}</button>
      </form>
    </div>`;
}

function generateTableHtml(data: Record<string, unknown>): string {
  const columns = (data.columns as Array<Record<string, string>>) || [];
  const rows = (data.rows as Array<Record<string, string>>) || [];

  const headerHtml = columns
    .map(
      (c) =>
        `<th style="padding: 12px 16px; text-align: ${escapeHtml(c.align || "left")}; font-weight: 500; color: #64748b; border-bottom: 2px solid #e2e8f0;">${escapeHtml(c.label)}</th>`
    )
    .join("");

  const bodyHtml = rows
    .map(
      (row, i) =>
        `<tr style="background: ${i % 2 === 1 ? "#f8fafc" : "transparent"};">${columns.map((c) => `<td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">${escapeHtml(row[c.key] || "")}</td>`).join("")}</tr>`
    )
    .join("");

  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 4px;">${escapeHtml(String(data.title || ""))}</h2>
      ${data.description ? `<p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">${escapeHtml(String(data.description))}</p>` : ""}
      <div style="overflow-x: auto; border-radius: 8px; border: 1px solid #e2e8f0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </div>
    </div>`;
}

function generateChartHtml(data: Record<string, unknown>): string {
  const items = (data.data as Array<{ label: string; value: number; color?: string }>) || [];
  const maxVal = Math.max(...items.map((d) => d.value), 1);
  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

  const type = data.type as string;

  if (type === "pie" || type === "donut") {
    const total = items.reduce((sum, d) => sum + d.value, 0);
    const legendHtml = items
      .map(
        (d, i) =>
          `<div style="display: flex; align-items: center; gap: 8px;"><div style="width: 12px; height: 12px; border-radius: 50%; background: ${escapeHtml(d.color || colors[i % colors.length])};"></div><span style="font-size: 13px;">${escapeHtml(d.label)}: ${d.value} (${Math.round((d.value / total) * 100)}%)</span></div>`
      )
      .join("");
    return `
      <div style="max-width: 600px; margin: 0 auto; text-align: center;">
        <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">${escapeHtml(String(data.title || ""))}</h2>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 16px;">${legendHtml}</div>
        <p style="color: #64748b; font-size: 13px;">合計: ${total}</p>
      </div>`;
  }

  const barsHtml = items
    .map(
      (d, i) => `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <span style="width: 80px; font-size: 13px; text-align: right; flex-shrink: 0;">${escapeHtml(d.label)}</span>
        <div style="flex: 1; background: #f1f5f9; border-radius: 4px; height: 28px; overflow: hidden;">
          <div style="width: ${(d.value / maxVal) * 100}%; height: 100%; background: ${escapeHtml(d.color || colors[i % colors.length])}; border-radius: 4px; transition: width 0.3s;"></div>
        </div>
        <span style="width: 50px; font-size: 13px; font-weight: 500;">${d.value}</span>
      </div>`
    )
    .join("");

  return `
    <div style="max-width: 600px; margin: 0 auto;">
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">${escapeHtml(String(data.title || ""))}</h2>
      ${barsHtml}
    </div>`;
}

function generateCustomHtml(data: Record<string, unknown>): string {
  if (typeof data.code === "string") {
    return `
    <div id="root"></div>
    <script src="https://unpkg.com/react@19/umd/react.production.min.js"><\/script>
    <script src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"><\/script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
    <script type="text/babel">
      ${data.code}
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(App));
    <\/script>`;
  }
  return `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
}

const GENERATORS: Record<string, (data: Record<string, unknown>) => string> = {
  showForm: generateFormHtml,
  showTable: generateTableHtml,
  showChart: generateChartHtml,
  generateCustomComponent: generateCustomHtml,
};

export function generateShareableHtml({ toolName, data }: ShareableData): string {
  const generator = GENERATORS[toolName];
  const bodyContent = generator ? generator(data) : `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml((data.title as string) || "Generated UI")} — 生成UI</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      padding: 32px 24px;
      background: #ffffff;
      color: #0f172a;
      min-height: 100vh;
    }
    @media (prefers-color-scheme: dark) {
      body { background: #0f172a; color: #f8fafc; }
      input, select, textarea { background: #1e293b; border-color: #334155; color: #f8fafc; }
      table { color: #f8fafc; }
      th { color: #94a3b8; border-color: #334155; }
      td { border-color: #1e293b; }
      tr:nth-child(even) { background: #1e293b !important; }
    }
  </style>
</head>
<body>
  ${bodyContent}
  <footer style="margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
    <p style="font-size: 12px; color: #94a3b8;">Generated by 生成UI — AIドリブンUIジェネレーター</p>
  </footer>
</body>
</html>`;
}
