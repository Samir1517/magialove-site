import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fdf6f4 0%, #f9eef2 55%, #f4eefa 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #d48ca6, #a2698a)",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #d6bd98, #b99d74)",
              marginLeft: -22,
            }}
          />
        </div>
        <div style={{ fontSize: 60, color: "#4a3a4d", fontWeight: 600, textAlign: "center" }}>
          Совместимость мужчины и женщины
        </div>
        <div style={{ fontSize: 28, color: "#7a6a7d", marginTop: 20, textAlign: "center" }}>
          Матрица судьбы · Нумерология · Дизайн человека · Джйотиш
        </div>
      </div>
    ),
    { ...size }
  );
}
