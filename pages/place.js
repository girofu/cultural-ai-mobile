import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { PlaceButton } from "../components/PlaceButtons";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function DesktopPlace() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  const router = useRouter();

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

  // 根據螢幕寬度決定布局方向
  const isMobile = windowSize.width < 768;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#EFEBE6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Head>
        <title>確認您要導覽地點 | 在地人AI導覽系統</title>
        <meta
          name="description"
          content="在地人AI導覽系統 - 確認您要導覽地點"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
        {/* headline 區塊 */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: isMobile ? "90%" : "580px",
            maxWidth: "100%",
            marginBottom: isMobile ? "2rem" : "60px",
            justifyContent: "center",
            padding: isMobile ? "0" : "0px 74px 0px 0px",
          }}
        >
          <h1
            style={{
              fontSize: isMobile ? "2.5rem" : "54px",
              fontWeight: 700,
              lineHeight: "1.2222222222222223em",
              fontFamily: "Inter, sans-serif",
              color: "#000000",
              textAlign: "center",
            }}
          >
            確認您要導覽地點
          </h1>
          <div style={{ marginLeft: "-22px" }}>
            <Image
              src="/images/all/interrogation.svg"
              alt="問號圖標"
              width={isMobile ? 50 : 72}
              height={isMobile ? 50 : 72}
            />
          </div>
        </div>

        {/* 按鈕區塊 */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? "2rem" : "60px",
            marginBottom: isMobile ? "2rem" : "40px",
            width: "100%",
          }}
        >
          <PlaceButton
            text="掃瞄啟動條碼"
            icon="icon_qr_code"
            onClick={() => router.push("/scan")}
            isMobile={isMobile}
          />
          <PlaceButton
            text="GPS偵測位置"
            icon="icon_marker"
            onClick={() => console.log("GPS偵測位置")}
            isMobile={isMobile}
          />
        </div>

        {/* 返回首頁連結 */}
        <Link href="/">
          <div
            style={{
              marginTop: isMobile ? "2rem" : "40px",
              color: "#000000",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              fontSize: isMobile ? "1rem" : "20px",
              fontWeight: 500,
              textDecoration: "underline",
            }}
          >
            返回首頁
          </div>
        </Link>
      </main>
    </div>
  );
}
