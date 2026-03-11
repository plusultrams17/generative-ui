import { NextResponse } from "next/server";

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

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 10;
}

export async function POST(request: Request) {
  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { success: false, error: "Rate limit exceeded" },
      { status: 429 }
    );
  }

  let body: {
    url: string;
    payload: unknown;
    type: "generic" | "slack" | "discord";
    headers?: Record<string, string>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json(
      { success: false, error: "URL is required" },
      { status: 400 }
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(body.url);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid URL" },
      { status: 400 }
    );
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json(
      { success: false, error: "Only HTTP/HTTPS URLs are allowed" },
      { status: 400 }
    );
  }

  if (isPrivateUrl(parsedUrl)) {
    return NextResponse.json(
      { success: false, error: "Private/internal URLs are not allowed" },
      { status: 400 }
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...body.headers,
  };

  try {
    const res = await fetch(body.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body.payload),
      signal: AbortSignal.timeout(10000),
    });

    return NextResponse.json({
      success: res.ok,
      status: res.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    );
  }
}
