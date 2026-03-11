export type ColumnDef = {
  name: string;
  type: "text" | "integer" | "boolean" | "timestamp" | "jsonb" | "uuid";
  nullable: boolean;
  defaultValue?: string;
};

export type SupabaseGeneratedCode = {
  createTableSQL: string;
  rlsSQL: string;
  clientSetup: string;
  insertCode: string;
  selectCode: string;
  updateCode: string;
  deleteCode: string;
};

const PG_TYPE_MAP: Record<ColumnDef["type"], string> = {
  text: "TEXT",
  integer: "INTEGER",
  boolean: "BOOLEAN",
  timestamp: "TIMESTAMPTZ",
  jsonb: "JSONB",
  uuid: "UUID",
};

export function inferColumnsFromCode(code: string): ColumnDef[] {
  const columns: ColumnDef[] = [
    { name: "id", type: "uuid", nullable: false, defaultValue: "gen_random_uuid()" },
    { name: "created_at", type: "timestamp", nullable: false, defaultValue: "now()" },
  ];

  const seen = new Set<string>(["id", "created_at"]);

  // Match input elements with name attributes
  const inputRegex = /<input[^>]*name=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = inputRegex.exec(code)) !== null) {
    const name = match[1];
    if (seen.has(name)) continue;
    seen.add(name);

    const tag = match[0].toLowerCase();
    let colType: ColumnDef["type"] = "text";

    if (tag.includes('type="number"') || tag.includes("type='number'")) {
      colType = "integer";
    } else if (tag.includes('type="checkbox"') || tag.includes("type='checkbox'")) {
      colType = "boolean";
    } else if (tag.includes('type="date"') || tag.includes("type='date'")) {
      colType = "timestamp";
    }
    // email, text, password, tel, url etc. -> text

    columns.push({ name, type: colType, nullable: true });
  }

  // Match textarea elements with name attributes
  const textareaRegex = /<textarea[^>]*name=["']([^"']+)["'][^>]*/gi;
  while ((match = textareaRegex.exec(code)) !== null) {
    const name = match[1];
    if (seen.has(name)) continue;
    seen.add(name);
    columns.push({ name, type: "text", nullable: true });
  }

  // Match select elements with name attributes
  const selectRegex = /<select[^>]*name=["']([^"']+)["'][^>]*/gi;
  while ((match = selectRegex.exec(code)) !== null) {
    const name = match[1];
    if (seen.has(name)) continue;
    seen.add(name);
    columns.push({ name, type: "text", nullable: true });
  }

  // Also handle JSON-style field definitions (e.g. { name: "xxx", type: "email" })
  const fieldRegex = /name:\s*["']([^"']+)["'][^}]*type:\s*["']([^"']+)["']/gi;
  while ((match = fieldRegex.exec(code)) !== null) {
    const name = match[1];
    if (seen.has(name)) continue;
    seen.add(name);

    const fieldType = match[2].toLowerCase();
    let colType: ColumnDef["type"] = "text";
    if (fieldType === "number") colType = "integer";
    else if (fieldType === "checkbox") colType = "boolean";
    else if (fieldType === "date") colType = "timestamp";

    columns.push({ name, type: colType, nullable: true });
  }

  // Reverse order match: type before name
  const fieldRegex2 = /type:\s*["']([^"']+)["'][^}]*name:\s*["']([^"']+)["']/gi;
  while ((match = fieldRegex2.exec(code)) !== null) {
    const name = match[2];
    if (seen.has(name)) continue;
    seen.add(name);

    const fieldType = match[1].toLowerCase();
    let colType: ColumnDef["type"] = "text";
    if (fieldType === "number") colType = "integer";
    else if (fieldType === "checkbox") colType = "boolean";
    else if (fieldType === "date") colType = "timestamp";

    columns.push({ name, type: colType, nullable: true });
  }

  return columns;
}

export function generateSupabaseCode(
  tableName: string,
  columns: ColumnDef[]
): SupabaseGeneratedCode {
  const sanitized = tableName.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();

  // CREATE TABLE
  const colDefs = columns.map((col) => {
    const pgType = PG_TYPE_MAP[col.type];
    const parts = [`  "${col.name}" ${pgType}`];
    if (!col.nullable) parts.push("NOT NULL");
    if (col.defaultValue) parts.push(`DEFAULT ${col.defaultValue}`);
    if (col.name === "id") parts.push("PRIMARY KEY");
    return parts.join(" ");
  });

  const createTableSQL = `CREATE TABLE IF NOT EXISTS "${sanitized}" (\n${colDefs.join(",\n")}\n);`;

  // RLS
  const rlsSQL = `-- Row Level Security
ALTER TABLE "${sanitized}" ENABLE ROW LEVEL SECURITY;

-- anon: 読み取りのみ
CREATE POLICY "anon_select_${sanitized}" ON "${sanitized}"
  FOR SELECT TO anon USING (true);

-- authenticated: CRUD
CREATE POLICY "auth_all_${sanitized}" ON "${sanitized}"
  FOR ALL TO authenticated USING (true) WITH CHECK (true);`;

  // Client setup
  const clientSetup = `import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);`;

  // Data columns (exclude id and created_at for insert)
  const dataCols = columns.filter(
    (c) => c.name !== "id" && c.name !== "created_at"
  );
  const insertFields = dataCols.map((c) => `  ${c.name}: ${exampleValue(c)}`).join(",\n");

  const insertCode = `const { data, error } = await supabase
  .from("${sanitized}")
  .insert({
${insertFields}
  })
  .select();

if (error) console.error("Insert error:", error);`;

  const selectCode = `const { data, error } = await supabase
  .from("${sanitized}")
  .select("*")
  .order("created_at", { ascending: false });

if (error) console.error("Select error:", error);`;

  const updateCode = `const { data, error } = await supabase
  .from("${sanitized}")
  .update({
${dataCols.length > 0 ? `  ${dataCols[0].name}: ${exampleValue(dataCols[0])}` : "  // update fields here"}
  })
  .eq("id", targetId)
  .select();

if (error) console.error("Update error:", error);`;

  const deleteCode = `const { error } = await supabase
  .from("${sanitized}")
  .delete()
  .eq("id", targetId);

if (error) console.error("Delete error:", error);`;

  return {
    createTableSQL,
    rlsSQL,
    clientSetup,
    insertCode,
    selectCode,
    updateCode,
    deleteCode,
  };
}

function exampleValue(col: ColumnDef): string {
  switch (col.type) {
    case "text":
      return `"値"`;
    case "integer":
      return "0";
    case "boolean":
      return "false";
    case "timestamp":
      return "new Date().toISOString()";
    case "jsonb":
      return "{}";
    case "uuid":
      return `"uuid-here"`;
    default:
      return `""`;
  }
}
