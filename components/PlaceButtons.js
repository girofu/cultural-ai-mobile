import Image from "next/image";
import { useState } from "react";

// Figma 中的按鈕元件
export const PlaceButton = ({ text, icon, onClick, isMobile = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "#FFFFFF",
        opacity: 0.8,
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: isMobile ? "90%" : "300px",
        maxWidth: "300px",
        height: isMobile ? "auto" : "300px",
        minHeight: isMobile ? "200px" : "300px",
        padding: isMobile ? "1.5rem" : "20px",
        gap: isMobile ? "1rem" : "20px",
        cursor: "pointer",
        border: "6px solid #000000",
        transition: "transform 0.2s ease-in-out",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        transform: isHovered ? "scale(1.03)" : "scale(1)",
      }}
    >
      <div style={{ marginBottom: isMobile ? "1rem" : "20px" }}>
        {icon === "icon_qr_code" ? (
          <div
            style={{
              width: isMobile ? "150px" : "200px",
              height: isMobile ? "150px" : "200px",
              position: "relative",
            }}
          >
            <Image
              src="/images/all/qrcode.svg"
              alt="QR Code Icon"
              width={isMobile ? 150 : 200}
              height={isMobile ? 150 : 200}
            />
          </div>
        ) : icon === "icon_marker" ? (
          <div
            style={{
              width: isMobile ? "150px" : "200px",
              height: isMobile ? "150px" : "200px",
              position: "relative",
            }}
          >
            <Image
              src="/images/all/icon_marker.svg"
              alt="Marker Icon"
              width={isMobile ? 150 : 200}
              height={isMobile ? 150 : 200}
            />
          </div>
        ) : null}
      </div>
      <span
        style={{
          color: "#000000",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: isMobile ? "1.8rem" : "38px",
          letterSpacing: "10%",
          lineHeight: "1.3157894736842106em",
          textAlign: "center",
        }}
      >
        {text}
      </span>
    </button>
  );
};
