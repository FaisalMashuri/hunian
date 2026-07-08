import { ImageResponse } from "next/og";

// OG image dinamis untuk landing (dibagikan di WA/Telegram/LinkedIn/Twitter).
export const alt = "Optio — Pahami Pilihanmu, Putuskan dengan Yakin";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 800, opacity: 0.9 }}>Optio</div>
        <div style={{ marginTop: 24, fontSize: 68, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          Pahami Pilihanmu. Putuskan dengan Yakin.
        </div>
        <div style={{ marginTop: 28, fontSize: 30, fontWeight: 500, opacity: 0.85, maxWidth: 880 }}>
          Tempel listing dari WA/OLX, Optio rapikan jadi fakta yang jelas dan bantu kamu memilih hunian sewa dengan lebih yakin.
        </div>
      </div>
    ),
    { ...size },
  );
}
