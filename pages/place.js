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

  // 請求相機權限並處理結果
  const requestCameraPermission = async () => {
    try {
      // 顯示確認對話框
      const confirmResult = window.confirm("是否允許開啟相機進行掃描？");

      if (confirmResult) {
        // 如果用戶同意對話框，嘗試請求相機權限
        await navigator.mediaDevices.getUserMedia({ video: true });
        // 權限已獲得，跳轉到掃描頁面
        router.push("/scan");
      } else {
        // 用戶在對話框中選擇取消，保持在當前頁面
        console.log("用戶拒絕開啟相機權限");
      }
    } catch (error) {
      // 用戶拒絕權限或發生其他錯誤
      console.error("相機權限請求失敗:", error);
      alert("無法獲取相機權限，請確認您的瀏覽器設定允許使用相機。");
    }
  };

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
              fontSize: isMobile ? "2rem" : "54px",
              fontWeight: 700,
              lineHeight: "1.2222222222222223em",
              fontFamily: "Inter, sans-serif",
              color: "#000000",
              textAlign: "center",
            }}
          >
            確認您要導覽地點
          </h1>
          <div style={{ marginLeft: "10px" }}>
            <Image
              src="/images/all/interrogation.svg"
              alt="問號圖標"
              width={isMobile ? 30 : 72}
              height={isMobile ? 30 : 72}
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
            onClick={requestCameraPermission}
            isMobile={isMobile}
          />
          <PlaceButton
            text="GPS偵測位置"
            icon="icon_marker"
            onClick={() => router.push("/teahouse")}
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
