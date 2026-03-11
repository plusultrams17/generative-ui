import { NextResponse } from "next/server";

const toolCatalog = [
  {
    name: "showForm",
    description: "フォームUIを生成・表示",
    parameters: {
      title: { type: "string", required: true },
      description: { type: "string", required: false },
      fields: {
        type: "array",
        required: true,
        items: {
          name: { type: "string", required: true },
          label: { type: "string", required: true },
          type: {
            type: "enum",
            values: [
              "text",
              "email",
              "password",
              "number",
              "textarea",
              "select",
              "checkbox",
              "date",
            ],
          },
          placeholder: { type: "string", required: false },
          required: { type: "boolean", default: true },
          options: { type: "array", required: false },
        },
      },
      submitLabel: { type: "string", default: "送信" },
      layout: {
        type: "enum",
        values: ["vertical", "horizontal", "grid"],
        default: "vertical",
      },
    },
  },
  {
    name: "showTable",
    description: "データテーブルを生成・表示",
    parameters: {
      title: { type: "string", required: true },
      description: { type: "string", required: false },
      columns: {
        type: "array",
        required: true,
        items: {
          key: { type: "string", required: true },
          label: { type: "string", required: true },
          type: {
            type: "enum",
            values: ["text", "number", "date", "badge", "link"],
            default: "text",
          },
          align: {
            type: "enum",
            values: ["left", "center", "right"],
            default: "left",
          },
        },
      },
      rows: { type: "array", required: true },
      striped: { type: "boolean", default: true },
    },
  },
  {
    name: "showChart",
    description: "チャート・データビジュアライゼーションを生成・表示",
    parameters: {
      title: { type: "string", required: true },
      description: { type: "string", required: false },
      type: {
        type: "enum",
        values: ["bar", "line", "pie", "donut"],
        required: true,
      },
      data: {
        type: "array",
        required: true,
        items: {
          label: { type: "string", required: true },
          value: { type: "number", required: true },
          color: { type: "string", required: false },
        },
      },
      xAxisLabel: { type: "string", required: false },
      yAxisLabel: { type: "string", required: false },
    },
  },
  {
    name: "generateCustomComponent",
    description: "カスタムReactコンポーネントを生成・表示",
    parameters: {
      title: { type: "string", required: true },
      description: { type: "string", required: true },
      code: { type: "string", required: true },
    },
  },
];

export async function GET() {
  return NextResponse.json({ tools: toolCatalog });
}
