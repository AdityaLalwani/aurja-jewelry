import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          background: "#282826",
          color: "#f6f4f0",
          fontFamily: "serif",
          fontSize: 106,
          border: "8px solid #c39655",
        }}
      >
        A
      </div>
    ),
    size,
  );
}
