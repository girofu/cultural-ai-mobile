import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import epsonPrintService from "../services/epsonPrintService";

export default function PrintDemo() {
  const router = useRouter();
  const contentRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [authCode, setAuthCode] = useState("");
  const [manualAuthCode, setManualAuthCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [showAuthUrl, setShowAuthUrl] = useState(false);
  const [authUrl, setAuthUrl] = useState("");
  const [printerInfo, setPrinterInfo] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [printerStatus, setPrinterStatus] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [monitorActive, setMonitorActive] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(30); // 秒

  // 從 URL 參數中提取授權碼
  useEffect(() => {
    if (router.isReady && router.query.code) {
      console.log("從 URL 獲取到授權碼:", router.query.code);
      setAuthCode(router.query.code);
      // 設置客戶端ID、客戶端秘鑰和API Key
      // 注意: epsonPrintService 會在 constructor 中自動從 window 中獲取環境變數
      if (clientId && clientSecret) {
        window.ENV_EPSON_CLIENT_ID = clientId;
        window.ENV_EPSON_CLIENT_SECRET = clientSecret;
      }

      if (apiKey) {
        window.ENV_EPSON_API_KEY = apiKey;
      }

      // 設置授權碼
      epsonPrintService.authCode = router.query.code;
      setIsAuthorized(true);
    }
  }, [router.isReady, router.query, clientId, clientSecret, apiKey]);

  // 設置環境變數到 window 對象供客戶端使用
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.ENV_EPSON_CLIENT_ID = clientId;
      window.ENV_EPSON_CLIENT_SECRET = clientSecret;
      window.ENV_EPSON_API_KEY =
        apiKey || process.env.NEXT_PUBLIC_EPSON_API_KEY;

      // 添加調試日誌
      console.log(
        "已將客戶端 ID 設置到環境:",
        clientId ? `${clientId.substring(0, 6)}...` : "未設置"
      );
      console.log(
        "已將客戶端秘鑰設置到環境:",
        clientSecret ? `${clientSecret.substring(0, 6)}...` : "未設置"
      );
      console.log(
        "已將 API Key 設置到環境:",
        apiKey
          ? `${apiKey.substring(0, 6)}...`
          : process.env.NEXT_PUBLIC_EPSON_API_KEY
          ? "使用環境變數"
          : "未設置"
      );
    }
  }, [clientId, clientSecret, apiKey]);

  // 產生授權 URL
  const generateAuthorizationUrl = () => {
    if (!clientId || !redirectUri) {
      return "";
    }

    const url =
      epsonPrintService.generateAuthUrl(clientId, redirectUri) ||
      `https://auth.epsonconnect.com/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=device`;

    setAuthUrl(url);
    return url;
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
    generateAuthorizationUrl();
  };

  // 處理手動授權碼提交
  const handleManualAuthCodeSubmit = () => {
    if (!manualAuthCode || manualAuthCode.trim() === "") {
      setError("請輸入有效的授權碼");
      return;
    }

    if (!clientId || !clientSecret) {
      setError("請先輸入 Client ID 和 Client Secret");
      return;
    }

    setAuthCode(manualAuthCode);
    // 如果使用手動授權碼，設置到全局環境變數
    window.ENV_EPSON_CLIENT_ID = clientId;
    window.ENV_EPSON_CLIENT_SECRET = clientSecret;

    if (apiKey) {
      window.ENV_EPSON_API_KEY = apiKey;
    }

    // 設置授權碼
    epsonPrintService.authCode = manualAuthCode;
    setIsAuthorized(true);
    setResult("已成功設置授權碼");
    setError(null);
  };

  // 處理檢查印表機連線按鈕點擊
  const handleCheckPrinterConnection = async () => {
    if (!isAuthorized) {
      setError("請先獲取授權碼");
      return;
    }

    if (!redirectUri) {
      setError("請輸入重定向 URL");
      return;
    }

    if (!clientId || !clientSecret) {
      setError("請先輸入 Client ID 和 Client Secret");
      return;
    }

    if (!apiKey) {
      setError("請輸入 API Key");
      return;
    }

    setCheckingConnection(true);
    setResult(null);
    setError(null);
    setPrinterInfo(null);
    setPrinterStatus(null);

    try {
      // 確保環境變數已設置
      window.ENV_EPSON_CLIENT_ID = clientId;
      window.ENV_EPSON_CLIENT_SECRET = clientSecret;
      window.ENV_EPSON_API_KEY = apiKey;

      // 如果尚未獲取設備令牌，先獲取
      if (!epsonPrintService.deviceToken) {
        try {
          await epsonPrintService.getDeviceToken(
            clientId,
            clientSecret,
            authCode,
            redirectUri
          );
          console.log("成功獲取設備令牌");
        } catch (error) {
          console.error("獲取設備令牌失敗:", error);
          setError(`獲取設備令牌失敗: ${error.message}`);
          setCheckingConnection(false);
          return;
        }
      }

      console.log("開始獲取設備信息...");
      // 檢查印表機連線狀態
      let info;
      try {
        info = await epsonPrintService.getDeviceInfo();
        console.log("成功獲取設備信息:", info);
      } catch (error) {
        console.error("獲取設備信息失敗:", error);
        throw new Error(`獲取設備信息失敗: ${error.message}`);
      }

      setPrinterInfo(info);

      // 分析印表機狀態
      let statusMessage = "";
      if (info.online === false) {
        statusMessage = "印表機目前離線。請確認印表機已開機並連接到網絡。";
        setPrinterStatus({
          status: "offline",
          message: statusMessage,
          color: "text-red-600",
          icon: "⚠️",
        });
        setError("印表機目前離線，無法進行列印");
      } else {
        statusMessage = `成功連接到印表機: ${info.alias || info.model}`;
        setPrinterStatus({
          status: "online",
          message: "印表機已連線並準備就緒",
          color: "text-green-600",
          icon: "✓",
        });
        setResult(statusMessage);
      }
    } catch (err) {
      console.error("檢查印表機連線時出錯:", err);

      // 設置錯誤訊息
      let errorMessage = `檢查印表機連線失敗: ${err.message}`;
      setError(errorMessage);

      // 如果是授權錯誤且尚未達到最大重試次數，則嘗試重新授權
      if (err.message.includes("令牌無效") || err.message.includes("已過期")) {
        if (retryCount < maxRetries) {
          const newRetryCount = retryCount + 1;
          setRetryCount(newRetryCount);
          setError(`令牌已過期，正在進行第 ${newRetryCount} 次重試...`);

          // 清除現有令牌，強制重新授權
          setTimeout(() => {
            // 重置授權狀態
            epsonPrintService.deviceToken = null;
            epsonPrintService.refreshToken = null;

            // 重新檢查連線
            handleCheckPrinterConnection();
          }, 1500);
          return;
        } else {
          setError("多次嘗試後仍無法連接印表機。請重新獲取授權碼後再試。");
          // 重置重試計數器
          setRetryCount(0);
        }
      }

      setPrinterStatus({
        status: "error",
        message: errorMessage,
        color: "text-red-600",
        icon: "❌",
      });
    } finally {
      setCheckingConnection(false);
    }
  };

  // 處理列印按鈕點擊
  const handlePrint = async () => {
    if (!isAuthorized) {
      setError("請先獲取授權碼");
      return;
    }

    if (!redirectUri) {
      setError("請輸入重定向 URL");
      return;
    }

    if (!clientId || !clientSecret) {
      setError("請輸入 Client ID 和 Client Secret");
      return;
    }

    if (!apiKey) {
      setError("請輸入 API Key");
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
      // 確保環境變數已設置
      window.ENV_EPSON_CLIENT_ID = clientId;
      window.ENV_EPSON_CLIENT_SECRET = clientSecret;
      window.ENV_EPSON_API_KEY = apiKey;

      // 檢查是否已獲取設備令牌
      if (!epsonPrintService.deviceToken) {
        try {
          console.log("嘗試獲取設備令牌...");
          await epsonPrintService.getDeviceToken(
            clientId,
            clientSecret,
            authCode,
            redirectUri
          );
          console.log("成功獲取設備令牌");
        } catch (error) {
          console.error("獲取設備令牌失敗:", error);
          throw new Error(`獲取設備令牌失敗: ${error.message}`);
        }
      }

      console.log("開始執行列印...");
      // 使用 printHtmlContent 方法從 HTML 元素直接生成 PDF 並列印
      const printResult = await epsonPrintService.printHtmlContent(
        contentRef.current,
        {
          jobName: "列印示範文件",
          useDeviceDefaults: true,
        }
      );

      if (printResult.success) {
        let printerData;
        try {
          printerData = await epsonPrintService.getDeviceInfo();
        } catch (error) {
          console.warn("獲取印表機信息失敗:", error);
          printerData = { alias: "Epson 印表機", model: "未知型號" };
        }

        setResult(
          `列印請求已成功發送到印表機: ${
            printerData.alias || printerData.model || "Epson 印表機"
          }`
        );
        setPrinterInfo(printerData);
      } else {
        setError(printResult.error || "列印失敗，請檢查印表機連線狀況");
      }
    } catch (err) {
      console.error("列印處理時出錯:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 複製授權 URL 到剪貼簿
  const copyAuthUrl = () => {
    if (authUrl) {
      navigator.clipboard
        .writeText(authUrl)
        .then(() => {
          setResult("已複製授權 URL 到剪貼簿");
          setTimeout(() => setResult(null), 3000);
        })
        .catch((err) => {
          console.error("無法複製到剪貼簿:", err);
        });
    }
  };

  // 定時監控印表機狀態
  useEffect(() => {
    let intervalId;

    if (
      monitorActive &&
      isAuthorized &&
      clientId &&
      clientSecret &&
      redirectUri
    ) {
      // 啟動印表機狀態監控
      intervalId = setInterval(() => {
        // 只有在未正在檢查連線時才執行
        if (!checkingConnection) {
          handleCheckPrinterConnection();
        }
      }, autoRefreshInterval * 1000);

      console.log(`已啟動印表機狀態監控，每 ${autoRefreshInterval} 秒檢查一次`);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        console.log("已停止印表機狀態監控");
      }
    };
  }, [
    monitorActive,
    isAuthorized,
    clientId,
    clientSecret,
    redirectUri,
    autoRefreshInterval,
    checkingConnection,
  ]);

  // 切換監控狀態
  const toggleMonitor = () => {
    setMonitorActive(!monitorActive);
  };

  // 更新自動刷新間隔
  const handleIntervalChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 10) {
      setAutoRefreshInterval(value);
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

        {/* 使用說明 */}
        <div className="p-4 mb-6 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-semibold text-yellow-800 mb-2">重要提示：</h3>
          <ul className="list-disc pl-5 text-yellow-700 space-y-1">
            <li>
              請確保輸入正確的 Client ID 和 Client Secret，兩者必須配對使用
            </li>
            <li>
              Client ID 和 Client Secret 必須來自同一個 Epson Connect 應用程式
            </li>
            <li>API Key 需要從 Epson Connect 開發者門戶獲取，與應用程式綁定</li>
            <li>
              重定向 URL 必須與在 Epson Connect 開發者門戶註冊的 URL 完全匹配
            </li>
            <li>授權碼只能使用一次，並且有效期很短</li>
          </ul>
        </div>

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
              <label htmlFor="clientSecret" className="block mb-1">
                Client Secret：
              </label>
              <input
                type="text"
                id="clientSecret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="請輸入 Client Secret"
                className="w-full p-2 border rounded mb-2"
              />
            </div>

            <div>
              <label htmlFor="apiKey" className="block mb-1">
                API Key：
              </label>
              <input
                type="text"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="請輸入 API Key"
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
              生成授權 URL
            </button>
          </div>

          {showAuthUrl && (
            <div className="mb-4 p-4 bg-gray-100 rounded">
              <p className="mb-2">
                請訪問以下 URL 進行授權，系統將自動從重定向的 URL 中獲取授權碼：
              </p>
              <div className="flex items-center">
                <input
                  type="text"
                  value={authUrl}
                  readOnly
                  className="flex-grow p-2 border rounded mr-2 text-xs break-all"
                />
                <button
                  onClick={copyAuthUrl}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  複製
                </button>
              </div>
              <div className="mt-2">
                <a
                  href={authUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
                >
                  開啟授權頁面
                </a>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">或手動輸入授權碼：</h3>
            <div className="flex">
              <input
                type="text"
                value={manualAuthCode}
                onChange={(e) => setManualAuthCode(e.target.value)}
                placeholder="請輸入授權碼"
                className="flex-grow p-2 border rounded mr-2"
              />
              <button
                onClick={handleManualAuthCodeSubmit}
                disabled={!manualAuthCode}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                提交
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              如果重定向 URL
              無法正常接收授權碼，您可以從瀏覽器地址欄中復制並在此處手動輸入。
            </p>
          </div>

          {isAuthorized && (
            <div className="mt-2 p-2 bg-green-100 rounded">
              <p className="text-green-800">✓ 已獲取授權碼，現在可以進行列印</p>
              <p className="text-sm font-mono mt-1 break-all">
                授權碼: {authCode.substring(0, 10)}...
                {authCode.substring(authCode.length - 5)}
              </p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            {isAuthorized ? "第二步" : "待授權"}：檢查印表機連線
          </h2>
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <button
              onClick={handleCheckPrinterConnection}
              disabled={checkingConnection || !isAuthorized || !clientSecret}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {checkingConnection ? "檢查中..." : "檢查印表機連線"}
            </button>

            {isAuthorized && (
              <>
                <button
                  onClick={toggleMonitor}
                  disabled={!isAuthorized || !clientSecret}
                  className={`px-4 py-2 rounded ${
                    monitorActive
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  } disabled:bg-gray-400`}
                >
                  {monitorActive ? "停止監控" : "開始監控"}
                </button>

                {monitorActive && (
                  <div className="flex items-center">
                    <span className="mr-2">刷新間隔：</span>
                    <input
                      type="number"
                      min="10"
                      value={autoRefreshInterval}
                      onChange={handleIntervalChange}
                      className="w-16 px-2 py-1 border rounded"
                    />
                    <span className="ml-1">秒</span>
                  </div>
                )}

                {monitorActive && (
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                    <span className="mr-1">●</span> 監控中
                  </div>
                )}
              </>
            )}

            {!isAuthorized && (
              <span className="ml-2 text-yellow-600 self-center">
                請先完成授權
              </span>
            )}
          </div>

          {printerStatus && (
            <div
              className={`p-3 border rounded mb-4 ${
                printerStatus.status === "online"
                  ? "bg-green-50 border-green-200"
                  : printerStatus.status === "offline"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <p
                className={`font-semibold ${printerStatus.color} flex items-center`}
              >
                <span className="mr-2 text-xl">{printerStatus.icon}</span>
                {printerStatus.message}
              </p>
            </div>
          )}

          {printerInfo && (
            <div className="p-4 border rounded mb-4 bg-blue-50">
              <h3 className="font-semibold mb-2">印表機資訊：</h3>
              <dl className="grid grid-cols-3 gap-2">
                <dt className="font-medium">名稱：</dt>
                <dd className="col-span-2">{printerInfo.alias || "未命名"}</dd>

                <dt className="font-medium">型號：</dt>
                <dd className="col-span-2">{printerInfo.model}</dd>

                <dt className="font-medium">序號：</dt>
                <dd className="col-span-2">{printerInfo.deviceId || "未知"}</dd>

                <dt className="font-medium">狀態：</dt>
                <dd
                  className={`col-span-2 ${
                    printerInfo.online ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {printerInfo.online ? "已連線" : "離線"}
                </dd>

                <dt className="font-medium">支援功能：</dt>
                <dd className="col-span-2">
                  {printerInfo.functions?.join(", ") || "未知"}
                </dd>
              </dl>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <span className="font-bold">提示：</span>
                  如果印表機顯示為離線，請確認印表機已開機且連接到網絡。部分印表機可能需要重新啟動才能正確連接。
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">
            {isAuthorized ? (printerInfo ? "第三步" : "第三步") : "第二步"}
            ：列印內容
          </h2>

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
            disabled={loading || !isAuthorized || !clientSecret}
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
