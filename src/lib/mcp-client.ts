// MCP (Model Context Protocol) lightweight client
// Communicates via /api/mcp proxy to avoid CORS issues

export type MCPTool = {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
};

export type MCPResource = {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
};

export type MCPPrompt = {
  name: string;
  description?: string;
  arguments?: { name: string; description?: string; required?: boolean }[];
};

export type MCPServerInfo = {
  name: string;
  version: string;
  protocolVersion?: string;
};

export type MCPCapabilities = {
  tools?: Record<string, unknown>;
  resources?: Record<string, unknown>;
  prompts?: Record<string, unknown>;
};

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: Record<string, unknown>;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};

let requestIdCounter = 0;

function nextId(): number {
  return ++requestIdCounter;
}

async function rpcCall(
  serverUrl: string,
  method: string,
  params?: Record<string, unknown>
): Promise<unknown> {
  const payload: JsonRpcRequest = {
    jsonrpc: "2.0",
    id: nextId(),
    method,
    ...(params ? { params } : {}),
  };

  const res = await fetch("/api/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ serverUrl, method, params: payload }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      (errBody as { error?: string }).error ||
        `MCP proxy error: ${res.status}`
    );
  }

  const data = (await res.json()) as JsonRpcResponse;

  if (data.error) {
    throw new Error(data.error.message || `JSON-RPC error: ${data.error.code}`);
  }

  return data.result;
}

export type ConnectResult = {
  serverInfo: MCPServerInfo;
  capabilities: MCPCapabilities;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
};

export async function connect(serverUrl: string): Promise<ConnectResult> {
  // 1. Initialize handshake
  const initResult = (await rpcCall(serverUrl, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "generative-ui", version: "1.0.0" },
  })) as {
    serverInfo?: MCPServerInfo;
    capabilities?: MCPCapabilities;
  };

  const serverInfo: MCPServerInfo = initResult?.serverInfo ?? {
    name: "unknown",
    version: "0.0.0",
  };
  const capabilities: MCPCapabilities = initResult?.capabilities ?? {};

  // 2. Send initialized notification (no response expected, but we call it)
  await rpcCall(serverUrl, "notifications/initialized").catch(() => {});

  // 3. Discover tools, resources, prompts in parallel
  const [toolsResult, resourcesResult, promptsResult] = await Promise.all([
    capabilities.tools
      ? rpcCall(serverUrl, "tools/list").catch(() => ({ tools: [] }))
      : Promise.resolve({ tools: [] }),
    capabilities.resources
      ? rpcCall(serverUrl, "resources/list").catch(() => ({ resources: [] }))
      : Promise.resolve({ resources: [] }),
    capabilities.prompts
      ? rpcCall(serverUrl, "prompts/list").catch(() => ({ prompts: [] }))
      : Promise.resolve({ prompts: [] }),
  ]);

  const tools = ((toolsResult as { tools?: MCPTool[] })?.tools ?? []) as MCPTool[];
  const resources = ((resourcesResult as { resources?: MCPResource[] })?.resources ?? []) as MCPResource[];
  const prompts = ((promptsResult as { prompts?: MCPPrompt[] })?.prompts ?? []) as MCPPrompt[];

  return { serverInfo, capabilities, tools, resources, prompts };
}

export async function callTool(
  serverUrl: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const result = await rpcCall(serverUrl, "tools/call", {
    name: toolName,
    arguments: args,
  });
  return result;
}

export async function readResource(
  serverUrl: string,
  uri: string
): Promise<unknown> {
  const result = await rpcCall(serverUrl, "resources/read", { uri });
  return result;
}

export async function getPrompt(
  serverUrl: string,
  name: string,
  args?: Record<string, string>
): Promise<unknown> {
  const result = await rpcCall(serverUrl, "prompts/get", {
    name,
    arguments: args,
  });
  return result;
}
