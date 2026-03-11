import { tool } from "ai";
import { z } from "zod";

export const showChart = tool({
  description:
    "Generate and display a chart or data visualization. Use when the user asks for charts, graphs, visualizations, or data plots.",
  inputSchema: z.object({
    title: z.string().describe("Chart title"),
    description: z.string().optional(),
    type: z
      .enum(["bar", "line", "pie", "donut"])
      .describe("Chart type"),
    data: z.array(
      z.object({
        label: z.string(),
        value: z.number(),
        color: z.string().optional(),
      })
    ),
    xAxisLabel: z.string().optional(),
    yAxisLabel: z.string().optional(),
  }),
  execute: async (input) => {
    const values = input.data.map((d) => d.value);
    return {
      ...input,
      generatedAt: Date.now(),
      dataPointCount: input.data.length,
      statistics: {
        min: Math.min(...values),
        max: Math.max(...values),
        total: values.reduce((a, b) => a + b, 0),
        average:
          values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0,
      },
    };
  },
});
