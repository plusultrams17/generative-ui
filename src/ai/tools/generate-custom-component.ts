import { tool } from "ai";
import { z } from "zod";

export const generateCustomComponent = tool({
  description:
    "Generate a React component with JSX and Tailwind CSS. Use this tool for ALL UI generation requests including forms, tables, charts, dashboards, landing pages, cards, and any other UI. Always produce visually rich, unique designs with creative layouts, colors, and styling. The code should define a function component named App.",
  inputSchema: z.object({
    title: z.string().describe("Component title/name"),
    description: z.string().describe("What this component does"),
    code: z
      .string()
      .describe(
        "Complete React component code using JSX and Tailwind CSS. Must define a function component named App. Use React.useState for state. Do not use import statements."
      ),
  }),
  execute: async (input) => {
    return {
      ...input,
      generatedAt: Date.now(),
      codeLength: input.code.length,
      warnings: [
        ...(input.code.includes("eval(")
          ? ["eval()の使用が検出されました"]
          : []),
        ...(input.code.includes("dangerouslySetInnerHTML")
          ? ["dangerouslySetInnerHTMLの使用が検出されました"]
          : []),
        ...(input.code.includes("document.cookie")
          ? ["document.cookieへのアクセスが検出されました"]
          : []),
      ],
    };
  },
});
