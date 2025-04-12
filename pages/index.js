import Head from "next/head";
import Image from "next/image";
import Button from "../components/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 根據螢幕寬度決定布局
  const isMobile = windowSize.width < 768;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#B1D4E0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Head>
        <title>在地人AI導覽系統</title>
        <meta name="description" content="在地人AI導覽系統" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 雲朵背景圖 - 使用相對定位和響應式尺寸 */}
      <div
        style={{
          position: "absolute",
          top: isMobile ? "50%" : "335px",
          width: "100%",
          maxWidth: "1642px",
          zIndex: 1,
          transform: isMobile ? "translateY(-30%)" : "none",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "auto",
            aspectRatio: "1642/1088",
            margin: "0 auto",
          }}
        >
          <Image
            src="/images/all/cloud_updated.svg"
            alt="雲朵背景"
            width={3286}
            height={2177}
            priority
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </div>

      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          padding: "0 1rem",
          textAlign: "center",
          marginTop: "2rem",
          marginBottom: "2rem",
          position: "relative",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        {/* 歡迎使用 - 響應式字體大小 */}
        <h2
          style={{
            fontSize: isMobile ? "1.5rem" : "26px",
            fontWeight: 700,
            letterSpacing: "2.6px",
            marginBottom: "1.5rem",
            lineHeight: "1.3076923076923077em",
            fontFamily: "Inter, sans-serif",
            color: "#000000",
          }}
        >
          歡迎使用
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: isMobile ? "2rem" : "3rem",
            gap: "1rem",
          }}
        >
          {/* Logo */}
          <div
            style={{
              position: "relative",
              width: isMobile ? "24px" : "32px",
              height: "auto",
              aspectRatio: "32/44.064",
              flexShrink: 0,
              marginRight: "0.5rem",
            }}
          >
            <Image
              src="/images/all/logo_updated.svg"
              alt="在地人AI導覽系統 Logo"
              width={33}
              height={45}
              priority
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>

          {/* 在地人AI導覽系統 - 大標題 */}
          <h1
            style={{
              fontSize: isMobile ? "2.25rem" : "54px",
              fontWeight: 700,
              lineHeight: "1.2222222222222223em",
              fontFamily: "Inter, sans-serif",
              color: "#000000",
              textAlign: "center",
            }}
          >
            在地人AI導覽系統
          </h1>
        </div>

        {/* 跳躍女孩插圖 */}
        <div
          style={{
            position: "relative",
            width: isMobile ? "180px" : "250px",
            height: "auto",
            aspectRatio: "1/1",
            flexShrink: 0,
            marginBottom: isMobile ? "2rem" : "3rem",
          }}
        >
          <Image
            src="/images/all/jumping_girl.svg"
            alt="跳躍女孩"
            width={250}
            height={250}
            priority
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0px 2px 12px rgba(102,102,102,0.15))",
            }}
          />
        </div>

        {/* 按鈕 */}
        <div>
          <Button onClick={() => router.push("/place")} isMobile={isMobile} />
        </div>
      </main>
    </div>
  );
}
