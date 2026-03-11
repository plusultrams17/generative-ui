import { NextRequest, NextResponse } from "next/server";

function isPrivateIP(hostname: string): boolean {
  const privateRanges = [
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^127\./,
    /^0\./,
    /^localhost$/i,
    /^::1$/,
    /^fe80:/i,
    /^fc00:/i,
    /^fd00:/i,
  ];
  return privateRanges.some((r) => r.test(hostname));
}

type MCPProxyRequest = {
  serverUrl: string;
  method: string;
  params: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MCPProxyRequest;

    if (!body.serverUrl || !body.params) {
      return NextResponse.json(
        { error: "serverUrl and params are required" },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(body.serverUrl);
    } catch {
      return NextResponse.json({ error: "Invalid server URL" }, { status: 400 });
    }

    // SSRF prevention
    if (isPrivateIP(parsedUrl.hostname)) {
      return NextResponse.json(
        { error: "Private/internal URLs are not allowed" },
        { status: 403 }
      );
    }

    // Only allow http/https
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP/HTTPS protocols are allowed" },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(body.serverUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body.params),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        return NextResponse.json(
          {
            error: `MCP server responded with ${response.status}`,
            details: errorText.slice(0, 500),
          },
          { status: 502 }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
        return NextResponse.json(
          { error: "MCP server request timed out (30s)" },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "MCP proxy request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
