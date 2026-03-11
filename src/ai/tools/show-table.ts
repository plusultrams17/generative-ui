import { tool } from "ai";
import { z } from "zod";

export const showTable = tool({
  description:
    "Generate and display a data table. Use when the user asks for tables, data grids, lists of data, or structured data display.",
  inputSchema: z.object({
    title: z.string().describe("Table title"),
    description: z.string().optional(),
    columns: z.array(
      z.object({
        key: z.string().describe("Column identifier"),
        label: z.string().describe("Column header label"),
        type: z
          .enum(["text", "number", "date", "badge", "link"])
          .default("text"),
        align: z.enum(["left", "center", "right"]).default("left"),
      })
    ),
    rows: z.array(z.record(z.string(), z.string())).describe("Array of row data objects"),
    striped: z.boolean().default(true),
  }),
  execute: async (input) => {
    return {
      ...input,
      generatedAt: Date.now(),
      rowCount: input.rows.length,
      columnCount: input.columns.length,
      summary: input.columns
        .filter((c) => c.type === "number")
        .map((c) => ({
          column: c.key,
          total: input.rows.reduce(
            (sum, r) => sum + (parseFloat(r[c.key]) || 0),
            0
          ),
          average:
            input.rows.length > 0
              ? input.rows.reduce(
                  (sum, r) => sum + (parseFloat(r[c.key]) || 0),
                  0
                ) / input.rows.length
              : 0,
        })),
    };
  },
});
