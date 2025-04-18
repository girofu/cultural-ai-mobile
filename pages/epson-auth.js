import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/EpsonAuth.module.css";

export default function EpsonAuth() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("準備授權");
  const [authCode, setAuthCode] = useState("");
  const [tokenData, setTokenData] = useState(null);
  const [manualAuthCode, setManualAuthCode] = useState("");
  const router = useRouter();

  // 當URL中有code參數時自動獲取
  useEffect(() => {
    // 檢查是否有認證碼
    if (router.query.code) {
      setAuthCode(router.query.code);
      setStatus("已獲取授權碼");
      setMessage("成功獲取授權碼！您現在可以獲取Token了。");

      // 自動保存授權碼到數據庫
      saveAuthCode(router.query.code);
    }
  }, [router.query]);

  // 保存授權碼到數據庫
  const saveAuthCode = async (code) => {
    try {
      const response = await fetch("/api/epson-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "saveAuthCode", code }),
      });

      if (response.ok) {
        console.log("授權碼已保存到數據庫");
      } else {
        console.error("保存授權碼失敗");
      }
    } catch (error) {
      console.error("保存授權碼時出錯:", error);
    }
  };

  // 開始Epson授權流程
  const startAuthorization = () => {
    const clientId = process.env.NEXT_PUBLIC_EPSON_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      setMessage("環境變數不完整，請檢查設定。");
      return;
    }

    const authUrl = `https://auth.epsonconnect.com/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=device`;

    // 在新分頁開啟授權頁面
    window.open(authUrl, "_blank");
    setMessage(
      "授權頁面已在新分頁中開啟，請完成授權後將獲得的授權碼輸入下方。"
    );
  };

  // 處理手動輸入的授權碼
  const handleManualAuthCodeSubmit = (e) => {
    e.preventDefault();
    if (!manualAuthCode.trim()) {
      setMessage("請輸入授權碼");
      return;
    }

    setAuthCode(manualAuthCode);
    setStatus("已獲取授權碼");
    setMessage("已成功設置授權碼！您現在可以獲取Token了。");

    // 保存授權碼到數據庫
    saveAuthCode(manualAuthCode);
  };

  // 獲取令牌
  const getToken = async () => {
    if (!authCode) {
      setMessage("請先獲取授權碼");
      return;
    }

    setLoading(true);
    setMessage("正在獲取令牌...");

    try {
      // 在實際應用中，這個請求應該在服務器端進行以保護密鑰
      const response = await fetch("/api/epson-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: authCode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTokenData(data);
        setStatus("授權成功");
        setMessage("成功獲取令牌！");

        // 保存令牌到數據庫
        await saveTokens(
          data.access_token,
          data.refresh_token,
          data.expires_in
        );
      } else {
        const errorData = await response.json();
        setStatus("授權失敗");
        setMessage(`獲取令牌失敗: ${errorData.error}`);
      }
    } catch (error) {
      setStatus("發生錯誤");
      setMessage(`發生錯誤: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 保存令牌到數據庫
  const saveTokens = async (accessToken, refreshToken, expiresIn) => {
    try {
      const response = await fetch("/api/epson-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "saveTokens",
          accessToken,
          refreshToken,
          expiresIn,
        }),
      });

      if (response.ok) {
        console.log("令牌已保存到數據庫");
      } else {
        console.error("保存令牌失敗");
      }
    } catch (error) {
      console.error("保存令牌時出錯:", error);
    }
  };

  // 返回首頁
  const goToHome = () => {
    router.push("/");
  };

  // 在建立列印任務前驗證列印設定
  const validatePrintSettings = (capability, settings) => {
    // 驗證紙張大小
    const supportedPaperSize = capability.paperSizes.find(
      (p) => p.paperSize === settings.paperSize
    );
    if (!supportedPaperSize) {
      throw new Error(`不支援的紙張大小: ${settings.paperSize}`);
    }

    // 驗證紙張類型和其他設定
    const paperType = supportedPaperSize.paperTypes.find(
      (t) => t.paperType === settings.paperType
    );
    if (!paperType) {
      throw new Error(`不支援的紙張類型: ${settings.paperType}`);
    }

    // 驗證其他設定...
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Epson 印表機授權</title>
        <meta name="description" content="Epson 印表機授權頁面" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Epson 印表機授權</h1>

        <div className={styles.status}>
          <p>
            狀態: <span className={styles.statusText}>{status}</span>
          </p>
        </div>

        {message && (
          <div className={styles.message}>
            <p>{message}</p>
          </div>
        )}

        <div className={styles.buttonContainer}>
          <button
            className={styles.button}
            onClick={startAuthorization}
            disabled={loading || status === "授權成功"}
          >
            開始授權流程
          </button>

          {/* 手動輸入授權碼表單 */}
          <div className={styles.manualCodeContainer}>
            <form onSubmit={handleManualAuthCodeSubmit}>
              <label className={styles.codeLabel}>
                手動輸入授權碼：
                <input
                  type="text"
                  className={styles.codeInput}
                  value={manualAuthCode}
                  onChange={(e) => setManualAuthCode(e.target.value)}
                  placeholder="輸入授權碼..."
                  disabled={loading || status === "授權成功"}
                />
              </label>
              <button
                type="submit"
                className={styles.button}
                disabled={
                  loading || status === "授權成功" || !manualAuthCode.trim()
                }
              >
                設定授權碼
              </button>
            </form>
          </div>

          {authCode && (
            <button
              className={styles.button}
              onClick={getToken}
              disabled={loading || status === "授權成功"}
            >
              獲取Token
            </button>
          )}

          <button
            className={styles.buttonSecondary}
            onClick={goToHome}
            disabled={loading}
          >
            返回首頁
          </button>
        </div>

        {tokenData && (
          <div className={styles.tokenInfo}>
            <h2>Token 資訊</h2>
            <div className={styles.tokenData}>
              <p>
                <strong>Access Token:</strong>{" "}
                {tokenData.access_token.substring(0, 15)}...
              </p>
              <p>
                <strong>Refresh Token:</strong>{" "}
                {tokenData.refresh_token.substring(0, 15)}...
              </p>
              <p>
                <strong>過期時間:</strong> {tokenData.expires_in} 秒
              </p>
              <p>
                <strong>Token 類型:</strong> {tokenData.token_type}
              </p>
              <p>
                <strong>範圍:</strong> {tokenData.scope}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
