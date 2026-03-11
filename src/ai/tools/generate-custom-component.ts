import { tool } from "ai";
import { z } from "zod";

export const generateCustomComponent = tool({
  description:
    "Generate a custom React component with JSX and Tailwind CSS. Use when the user asks for a component that doesn't fit other specific tools (forms, tables, charts). The code should define a function component named App.",
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
