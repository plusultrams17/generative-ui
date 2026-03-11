export type GeneratedApiRoute = {
  filename: string;
  code: string;
  description: string;
  method: string;
};

function toTsType(fieldType: string): string {
  switch (fieldType) {
    case "number":
      return "number";
    case "checkbox":
      return "boolean";
    default:
      return "string";
  }
}

function labelForRequired(fieldName: string, label: string): string {
  return `${label}は必須です`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

export function generateFormApi(formData: {
  title: string;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
  }>;
}): GeneratedApiRoute {
  const slug = slugify(formData.title) || "form";

  const typeFields = formData.fields
    .map((f) => `  ${f.name}: ${toTsType(f.type)};`)
    .join("\n");

  const validationLines: string[] = [];
  for (const field of formData.fields) {
    if (field.required) {
      if (field.type === "checkbox") {
        // checkboxes don't need required validation in most cases
      } else {
        validationLines.push(
          `  if (!body.${field.name}) errors.${field.name} = "${labelForRequired(field.name, field.label)}";`
        );
      }
    }
    if (field.type === "email") {
      const prefix = field.required
        ? `  else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(body.${field.name}))`
        : `  if (body.${field.name} && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(body.${field.name}))`;
      validationLines.push(
        `${prefix} errors.${field.name} = "メールアドレスの形式が不正です";`
      );
    }
    if (field.type === "url") {
      const prefix = field.required
        ? `  else if (!/^https?:\\/\\/.+/.test(body.${field.name}))`
        : `  if (body.${field.name} && !/^https?:\\/\\/.+/.test(body.${field.name}))`;
      validationLines.push(
        `${prefix} errors.${field.name} = "URLの形式が不正です";`
      );
    }
    if (field.type === "number" && field.required) {
      validationLines.push(
        `  else if (isNaN(Number(body.${field.name}))) errors.${field.name} = "${field.label}は数値で入力してください";`
      );
    }
    if (field.type === "select" && field.options?.length) {
      const opts = field.options.map((o) => `"${o}"`).join(", ");
      validationLines.push(
        `  if (body.${field.name} && ![${opts}].includes(body.${field.name})) errors.${field.name} = "${field.label}の値が不正です";`
      );
    }
  }

  const code = `import { NextResponse } from "next/server";

type FormData = {
${typeFields}
};

export async function POST(request: Request) {
  const body = (await request.json()) as FormData;
  const errors: Record<string, string> = {};

${validationLines.join("\n")}

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 400 });
  }

  // TODO: データベースへの保存処理を追加
  return NextResponse.json({ success: true, data: body });
}
`;

  return {
    filename: `api/${slug}/route.ts`,
    code,
    description: `${formData.title}のフォーム送信を処理するAPIルート。バリデーション付き。`,
    method: "POST",
  };
}

export function generateTableApi(tableData: {
  title: string;
  columns: Array<{ key: string; label: string; type: string }>;
  rows: Record<string, string>[];
}): GeneratedApiRoute {
  const slug = slugify(tableData.title) || "table";

  const typeFields = tableData.columns
    .map((c) => `  ${c.key}: string;`)
    .join("\n");

  const rowsJson = JSON.stringify(tableData.rows, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : `  ${line}`))
    .join("\n");

  const code = `import { NextResponse } from "next/server";

type Row = {
${typeFields}
};

let data: Row[] = ${rowsJson};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const sortKey = searchParams.get("sort") || "";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const perPage = Math.max(1, Number(searchParams.get("perPage") || "20"));

  let result = [...data];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }

  if (sortKey && sortKey in result[0]!) {
    result.sort((a, b) => {
      const av = a[sortKey as keyof Row] ?? "";
      const bv = b[sortKey as keyof Row] ?? "";
      const cmp = av.localeCompare(bv, "ja");
      return order === "desc" ? -cmp : cmp;
    });
  }

  const total = result.length;
  const start = (page - 1) * perPage;
  const items = result.slice(start, start + perPage);

  return NextResponse.json({ items, total, page, perPage });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Row;
  data.push(body);
  return NextResponse.json({ success: true, data: body, index: data.length - 1 });
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const index = Number(searchParams.get("index"));

  if (isNaN(index) || index < 0 || index >= data.length) {
    return NextResponse.json(
      { success: false, error: "インデックスが不正です" },
      { status: 400 }
    );
  }

  const body = (await request.json()) as Partial<Row>;
  data[index] = { ...data[index], ...body };
  return NextResponse.json({ success: true, data: data[index] });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const index = Number(searchParams.get("index"));

  if (isNaN(index) || index < 0 || index >= data.length) {
    return NextResponse.json(
      { success: false, error: "インデックスが不正です" },
      { status: 400 }
    );
  }

  const deleted = data.splice(index, 1)[0];
  return NextResponse.json({ success: true, data: deleted });
}
`;

  return {
    filename: `api/${slug}/route.ts`,
    code,
    description: `${tableData.title}のCRUD操作を提供するAPIルート。検索・ソート・ページネーション対応。`,
    method: "GET, POST, PUT, DELETE",
  };
}
