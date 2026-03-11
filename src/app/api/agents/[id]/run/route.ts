import { NextRequest } from "next/server";

// AG-UI event types (server-side definition to avoid importing "use client" module)
type AGUIEventType =
  | "RUN_STARTED"
  | "RUN_FINISHED"
  | "RUN_ERROR"
  | "TEXT_MESSAGE_START"
  | "TEXT_MESSAGE_CONTENT"
  | "TEXT_MESSAGE_END"
  | "TOOL_CALL_START"
  | "TOOL_CALL_ARGS"
  | "TOOL_CALL_END"
  | "TOOL_CALL_RESULT"
  | "STATE_SNAPSHOT"
  | "STATE_DELTA"
  | "STEP_STARTED"
  | "STEP_FINISHED"
  | "MESSAGES_SNAPSHOT"
  | "RAW"
  | "CUSTOM";

// SSRF prevention - same patterns as /api/webhook/route.ts
const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
];

const PRIVATE_HOSTNAMES = ["localhost", "[::1]"];

function isPrivateUrl(url: URL): boolean {
  const hostname = url.hostname;
  if (PRIVATE_HOSTNAMES.includes(hostname)) return true;
  return PRIVATE_IP_PATTERNS.some((p) => p.test(hostname));
}

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function errorEvent(message: string, runId: string): string {
  return sseEvent({
    type: "RUN_ERROR" satisfies AGUIEventType,
    runId,
    error: message,
    timestamp: Date.now(),
  });
}

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;
  const runId = `run-${agentId}-${Date.now()}`;

  // Parse request body
  let body: { message: string; threadId?: string; tools?: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(
      sseEvent({
        type: "RUN_ERROR" as AGUIEventType,
        runId,
        error: "Invalid JSON in request body",
        timestamp: Date.now(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }

  if (!body.message || typeof body.message !== "string") {
    return new Response(
      sseEvent({
        type: "RUN_ERROR" as AGUIEventType,
        runId,
        error: "message field is required",
        timestamp: Date.now(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }

  // Get agent URL from header
  const agentUrl = request.headers.get("X-Agent-URL");
  if (!agentUrl) {
    return new Response(
      sseEvent({
        type: "RUN_ERROR" as AGUIEventType,
        runId,
        error: "X-Agent-URL header is required",
        timestamp: Date.now(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }

  // Validate URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(agentUrl);
  } catch {
    return new Response(
      sseEvent({
        type: "RUN_ERROR" as AGUIEventType,
        runId,
        error: "Invalid agent URL",
        timestamp: Date.now(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return new Response(
      sseEvent({
        type: "RUN_ERROR" as AGUIEventType,
        runId,
        error: "Only HTTP/HTTPS URLs are allowed",
        timestamp: Date.now(),
      }),
      {
        status: 400,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }

  // SSRF prevention
  if (isPrivateUrl(parsedUrl)) {
    return new Response(
      sseEvent({
        type: "RUN_ERROR" as AGUIEventType,
        runId,
        error: "Private/internal URLs are not allowed",
        timestamp: Date.now(),
      }),
      {
        status: 403,
        headers: { "Content-Type": "text/event-stream" },
      }
    );
  }

  // Build upstream request headers
  const upstreamHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    upstreamHeaders["Authorization"] = authHeader;
  }

  // Abort controller with 5-minute timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const stream = new ReadableStream({
    async start(streamController) {
      const encoder = new TextEncoder();

      function enqueue(data: string) {
        try {
          streamController.enqueue(encoder.encode(data));
        } catch {
          // Stream already closed
        }
      }

      try {
        const upstreamRes = await fetch(agentUrl, {
          method: "POST",
          headers: upstreamHeaders,
          body: JSON.stringify({
            message: body.message,
            threadId: body.threadId,
            tools: body.tools,
            runId,
          }),
          signal: controller.signal,
        });

        if (!upstreamRes.ok) {
          enqueue(
            errorEvent(
              `Upstream agent returned ${upstreamRes.status}: ${upstreamRes.statusText}`,
              runId
            )
          );
          streamController.close();
          return;
        }

        if (!upstreamRes.body) {
          enqueue(errorEvent("Upstream agent returned empty body", runId));
          streamController.close();
          return;
        }

        const reader = upstreamRes.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from buffer
          const lines = buffer.split("\n");
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() ?? "";

          let currentData = "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              currentData += line.slice(6);
            } else if (line === "" && currentData) {
              // Empty line = end of event, forward it
              enqueue(`data: ${currentData}\n\n`);
              currentData = "";
            }
          }
        }

        // Flush any remaining data in buffer
        if (buffer.startsWith("data: ")) {
          enqueue(`data: ${buffer.slice(6)}\n\n`);
        }
      } catch (err) {
        const message =
          err instanceof DOMException && err.name === "AbortError"
            ? "Request timed out (5 minutes)"
            : err instanceof Error
              ? err.message
              : "Unknown error";
        enqueue(errorEvent(message, runId));
      } finally {
        clearTimeout(timeout);
        try {
          streamController.close();
        } catch {
          // Already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Run-Id": runId,
    },
  });
}
