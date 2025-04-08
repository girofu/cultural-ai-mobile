import React, { useState } from "react";

const Button = ({ text = "現在就開始探索！", onClick, isMobile = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "#1E1E1E",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: isMobile ? "90%" : "330px",
        maxWidth: "330px",
        height: isMobile ? "60px" : "70px",
        padding: isMobile ? "1rem" : "24px 86px",
        gap: "10px",
        cursor: "pointer",
        border: "none",
        transition: "transform 0.2s ease-in-out",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        transform: isHovered ? "scale(1.03)" : "scale(1)",
      }}
    >
      <span
        style={{
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: isMobile ? "1.2rem" : "24px",
          letterSpacing: "2.4px",
          lineHeight: "0.92em",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </span>
    </button>
  );
};

export default Button;
