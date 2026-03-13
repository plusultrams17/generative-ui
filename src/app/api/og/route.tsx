import { ImageResponse } from "@vercel/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") || "生成UI";
  const description = searchParams.get("description") || "AIに話しかけるだけでUIが作れる";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 24, opacity: 0.7, marginBottom: 16 }}>
          ✨ 生成UI
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: "bold",
            textAlign: "center",
            maxWidth: "80%",
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 24,
            opacity: 0.7,
            marginTop: 16,
            textAlign: "center",
            maxWidth: "70%",
          }}
        >
          {description}
        </div>
        <div
          style={{
            marginTop: 40,
            padding: "12px 32px",
            borderRadius: 8,
            backgroundColor: "#2563eb",
            fontSize: 20,
          }}
        >
          無料で試す →
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
