/**
 * 前端頁面：與印表機API交互
 * 說明如何使用應用程序令牌和設備令牌
 */
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function PrinterAPIClient() {
  const router = useRouter();

  // 狀態管理
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("initial");

  // 存儲令牌和授權碼
  const [applicationToken, setApplicationToken] = useState(null);
  const [deviceToken, setDeviceToken] = useState(null);
  const [authorizationCode, setAuthorizationCode] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [clientId, setClientId] = useState("");
  const [showAuthUrl, setShowAuthUrl] = useState(false);

  // 從 URL 參數中提取授權碼
  useEffect(() => {
    // 檢查 URL 是否包含授權碼
    if (router.isReady && router.query.code) {
      console.log("從 URL 獲取到授權碼:", router.query.code);
      setAuthorizationCode(router.query.code);
      setStep("code_received");

      // 如果是從授權頁面重定向回來的，可以直接觸發獲取設備令牌
      if (applicationToken) {
        handleGetDeviceToken(router.query.code);
      }
    }
  }, [router.isReady, router.query]);

  // 清除結果和錯誤
  const resetState = () => {
    setResult(null);
    setError(null);
  };

  // 獲取應用程序令牌
  const handleGetApplicationToken = async () => {
    resetState();
    setLoading(true);

    try {
      const response = await fetch("/api/get-printer-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getApplicationToken" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "獲取應用程序令牌失敗");
      }

      setResult(data);
      setApplicationToken(data.tokenInfo.access_token);
      setStep("application_token_received");

      // 如果已經有授權碼，自動獲取設備令牌
      if (authorizationCode) {
        handleGetDeviceToken(authorizationCode);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 產生授權 URL（需要用戶訪問該 URL 以獲取授權碼）
  const generateAuthorizationUrl = () => {
    if (!clientId || !redirectUri) {
      return "";
    }

    return `https://auth.epsonconnect.com/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=device`;
  };

  // 處理連線按鈕點擊
  const handleConnect = () => {
    if (!clientId || !redirectUri) {
      setError("請輸入 Client ID 和重定向 URL");
      return;
    }

    setShowAuthUrl(true);
    resetState();
  };

  // 使用授權碼獲取設備令牌
  const handleGetDeviceToken = async (code = null) => {
    const codeToUse = code || authorizationCode;

    if (!codeToUse) {
      setError("請輸入授權碼");
      return;
    }

    resetState();
    setLoading(true);

    try {
      const response = await fetch("/api/get-printer-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getDeviceToken",
          authorizationCode: codeToUse,
          redirectUri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 顯示詳細錯誤信息
        const errorMessage = data.note
          ? `${data.error}: ${data.note}`
          : data.error || "獲取設備令牌失敗";

        throw new Error(errorMessage);
      }

      setResult(data);
      setDeviceToken(data.tokenInfo.access_token);
      setStep("device_token_received");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 獲取印表機資訊
  const handleGetPrinterInfo = async () => {
    if (!deviceToken) {
      setError("需要先獲取設備令牌");
      return;
    }

    resetState();
    setLoading(true);

    try {
      const response = await fetch("/api/get-printer-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getPrinterInfo",
          deviceToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 顯示詳細錯誤信息
        const errorMessage = data.note
          ? `${data.error}: ${data.note}`
          : data.error || "獲取印表機資訊失敗";

        throw new Error(errorMessage);
      }

      setResult(data);
      setStep("printer_info_received");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Epson 印表機 API 測試工具</title>
        <meta
          name="description"
          content="測試 Epson Connect 印表機 API 的工具"
        />
      </Head>

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Epson 印表機 API 測試工具</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            步驟 1: 獲取應用程序令牌
          </h2>
          <p className="mb-2">
            使用 Basic Auth 和 client_credentials 授權類型獲取應用程序令牌。
          </p>
          <button
            onClick={handleGetApplicationToken}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading && step === "initial" ? "載入中..." : "獲取應用程序令牌"}
          </button>

          {applicationToken && (
            <div className="mt-2 p-2 bg-green-100 rounded">
              <p className="text-green-800">✓ 已獲取應用程序令牌</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">步驟 2: 獲取設備令牌</h2>
          <div className="mb-4">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label htmlFor="clientId" className="block mb-1">
                  Client ID：
                </label>
                <input
                  type="text"
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="請輸入 Client ID"
                  className="w-full p-2 border rounded mb-2"
                />
              </div>

              <div>
                <label htmlFor="redirectUri" className="block mb-1">
                  重定向 URL：
                </label>
                <input
                  type="text"
                  id="redirectUri"
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                  placeholder="請輸入重定向 URL"
                  className="w-full p-2 border rounded mb-2"
                />
              </div>

              <button
                onClick={handleConnect}
                disabled={loading || !clientId || !redirectUri}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                連線
              </button>
            </div>

            {showAuthUrl && (
              <div>
                <p className="mb-2">
                  請訪問以下 URL 進行授權，系統將自動從重定向的 URL
                  中獲取授權碼：
                </p>
                <a
                  href={generateAuthorizationUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {generateAuthorizationUrl()}
                </a>
                <p className="mt-2 text-sm text-gray-600">
                  授權後將重定向至: {redirectUri}
                </p>
              </div>
            )}

            {router.query.code && (
              <div className="mt-2 p-2 bg-green-100 rounded">
                <p className="text-green-800">
                  ✓ 已從 URL 參數中自動獲取授權碼:{" "}
                  {router.query.code.substring(0, 10)}...
                </p>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="authCode" className="block mb-1">
              授權碼：
            </label>
            <input
              type="text"
              id="authCode"
              value={authorizationCode}
              onChange={(e) => setAuthorizationCode(e.target.value)}
              placeholder="請輸入從授權頁面獲得的授權碼 (如未自動獲取)"
              className="w-full p-2 border rounded mb-2"
            />

            <button
              onClick={() => handleGetDeviceToken()}
              disabled={loading || !authorizationCode}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading &&
              (step === "application_token_received" ||
                step === "code_received")
                ? "載入中..."
                : "獲取設備令牌"}
            </button>
            <p className="mt-1 text-sm text-gray-600">
              注意：授權碼只能使用一次，且有效期很短
            </p>
          </div>

          {deviceToken && (
            <div className="mt-2 p-2 bg-green-100 rounded">
              <p className="text-green-800">✓ 已獲取設備令牌</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">步驟 3: 獲取印表機資訊</h2>
          <p className="mb-2">使用設備令牌獲取印表機的詳細資訊。</p>
          <button
            onClick={handleGetPrinterInfo}
            disabled={loading || !deviceToken}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading && step === "device_token_received"
              ? "載入中..."
              : "獲取印表機資訊"}
          </button>
        </div>

        {/* 顯示結果或錯誤 */}
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded mb-4">
            <h3 className="font-semibold">錯誤：</h3>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">回應結果：</h3>
            <pre className="whitespace-pre-wrap break-all overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </>
  );
}
