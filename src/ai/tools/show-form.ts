import { tool } from "ai";
import { z } from "zod";

export const showForm = tool({
  description:
    "Generate and display a form UI. Use when the user asks for any kind of form (login, registration, contact, survey, search, settings, etc.)",
  inputSchema: z.object({
    title: z.string().describe("Form title"),
    description: z.string().optional().describe("Form description text"),
    fields: z.array(
      z.object({
        name: z.string().describe("Field identifier"),
        label: z.string().describe("Display label"),
        type: z
          .enum([
            "text",
            "email",
            "password",
            "number",
            "textarea",
            "select",
            "checkbox",
            "date",
          ])
          .describe("Input type"),
        placeholder: z.string().optional(),
        required: z.boolean().default(true),
        options: z
          .array(z.string())
          .optional()
          .describe("Options for select type"),
      })
    ),
    submitLabel: z.string().default("送信"),
    layout: z.enum(["vertical", "horizontal", "grid"]).default("vertical"),
  }),
  execute: async (input) => {
    return {
      ...input,
      generatedAt: Date.now(),
      fieldCount: input.fields.length,
      hasRequiredFields: input.fields.some((f) => f.required),
      validationRules: input.fields.map((f) => ({
        name: f.name,
        required: f.required,
        type: f.type,
        pattern: f.type === "email" ? "^[^@]+@[^@]+\\.[^@]+$" : undefined,
      })),
    };
  },
});
