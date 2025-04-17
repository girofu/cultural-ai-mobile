import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import EpsonPrintService from "../services/epsonPrintService";

export default function PrintDemo() {
  const router = useRouter();
  const contentRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [authCode, setAuthCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [showAuthUrl, setShowAuthUrl] = useState(false);

  // 建立 Epson 列印服務實例
  const epsonPrintService = new EpsonPrintService();

  // 從 URL 參數中提取授權碼
  useEffect(() => {
    if (router.isReady && router.query.code) {
      console.log("從 URL 獲取到授權碼:", router.query.code);
      setAuthCode(router.query.code);
      epsonPrintService.setAuthorizationCode(router.query.code);
      setIsAuthorized(true);
    }
  }, [router.isReady, router.query]);

  // 產生授權 URL
  const generateAuthorizationUrl = () => {
    if (!clientId || !redirectUri) {
      return "";
    }

    return `https://auth.epsonconnect.com/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=device`;
  };

  // 處理連結按鈕點擊
  const handleConnect = () => {
    if (!clientId || !redirectUri) {
      setError("請輸入 Client ID 和重定向 URL");
      return;
    }

    setShowAuthUrl(true);
    setResult(null);
    setError(null);
  };

  // 處理列印按鈕點擊
  const handlePrint = async () => {
    if (!isAuthorized) {
      setError("請先獲取授權碼");
      return;
    }

    if (!contentRef.current) {
      setError("無法獲取列印內容");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const printResult = await epsonPrintService.printContent(
        contentRef.current
      );

      if (printResult.success) {
        setResult(printResult.message);
      } else {
        setError(printResult.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Epson 列印示範</title>
        <meta
          name="description"
          content="使用設備令牌進行 Epson 列印的示範頁面"
        />
      </Head>

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Epson 列印示範</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">第一步：獲取授權</h2>
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
              連接印表機
            </button>
          </div>

          {showAuthUrl && (
            <div className="mb-4 p-4 bg-gray-100 rounded">
              <p className="mb-2">
                請訪問以下 URL 進行授權，系統將自動從重定向的 URL 中獲取授權碼：
              </p>
              <a
                href={generateAuthorizationUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {generateAuthorizationUrl()}
              </a>
            </div>
          )}

          {isAuthorized && (
            <div className="mt-2 p-2 bg-green-100 rounded">
              <p className="text-green-800">✓ 已獲取授權碼，現在可以進行列印</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">第二步：列印內容</h2>

          <div ref={contentRef} className="p-8 border rounded mb-4 bg-white">
            <h1 className="text-xl font-bold mb-2">列印示範文件</h1>
            <p className="mb-2">
              這是一個用於測試 Epson Connect API 的示範文件。
            </p>
            <p className="mb-2">
              當您點擊「列印」按鈕時，此內容將被轉換為 PDF 並發送到您的 Epson
              印表機。
            </p>
            <div className="p-2 bg-gray-100 rounded">
              <p className="font-semibold">
                此功能使用了 Epson Connect API
                中的設備令牌功能，需要先獲取用戶授權。
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            disabled={loading || !isAuthorized}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "處理中..." : "列印內容"}
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
          <div className="p-4 bg-green-100 text-green-800 rounded">
            <h3 className="font-semibold">成功：</h3>
            <p>{result}</p>
          </div>
        )}
      </div>
    </>
  );
}
