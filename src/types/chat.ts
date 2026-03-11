export type MessageRole = "user" | "assistant";

export type ToolRendererProps<T = Record<string, unknown>> = {
  data: T;
  isLoading?: boolean;
};
