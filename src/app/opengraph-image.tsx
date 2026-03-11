import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "生成UI - AIドリブンUIジェネレーター";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}
          >
            ✨
          </div>
          <span style={{ fontSize: 56, fontWeight: 800 }}>生成UI</span>
        </div>
        <div style={{ fontSize: 28, opacity: 0.9, maxWidth: 700, textAlign: "center", lineHeight: 1.4 }}>
          AIに話しかけるだけで、UIが生まれる
        </div>
        <div style={{ fontSize: 18, opacity: 0.7, marginTop: 16 }}>
          フォーム・テーブル・チャート・カスタムUI を自然言語で生成
        </div>
      </div>
    ),
    { ...size }
  );
}
