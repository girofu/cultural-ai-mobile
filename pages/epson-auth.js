import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import epsonPrintService from "../services/epsonPrintService";

export default function EpsonAuth() {
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [deviceToken, setDeviceToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState("");
  const [newDeviceToken, setNewDeviceToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [envLoaded, setEnvLoaded] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // 檢查 URL 中是否有授權碼或錯誤
    if (router.query.code) {
      setAuthCode(router.query.code);
      addLog(`已從 URL 獲得授權碼: ${router.query.code.substring(0, 6)}...`);
    }

    if (router.query.error) {
      const errorMsg = router.query.error_description || router.query.error;
      setError(errorMsg);
      addLog(`授權錯誤: ${errorMsg}`, true);
    }

    // 獲取環境變量
    fetchEnvironmentVariables();
  }, [router.query]);

  // 從服務器獲取環境變量
  const fetchEnvironmentVariables = async () => {
    try {
      const response = await fetch("/api/epson/config");
      if (response.ok) {
        const data = await response.json();
        if (data.clientId) {
          setClientId(data.clientId);
          addLog("從環境中加載 Client ID");
        }

        if (data.redirectUri) {
          setRedirectUri(data.redirectUri);
          addLog("從環境中加載重定向 URI");
        }

        setEnvLoaded(true);
      } else {
        const errorData = await response.json();
        addLog(`載入環境變量失敗: ${errorData.error}`, true);
      }
    } catch (error) {
      console.error("載入環境變量時出錯:", error);
      addLog(`載入環境變量時出錯: ${error.message}`, true);
    }
  };

  // 添加日誌
  const addLog = (message, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);

    if (isError) {
      console.error(message);
    } else {
      console.log(message);
    }
  };

  // 獲取授權 URL 並重定向
  const handleGetAuthCode = async () => {
    try {
      setLoading(true);
      setError("");

      // 獲取授權 URL
      const authUrl = epsonPrintService.generateAuthUrl(clientId, redirectUri);

      if (authUrl) {
        addLog(`開啟授權網址: ${authUrl}`);
        window.location.href = authUrl;
      } else {
        throw new Error("無法生成授權 URL");
      }
    } catch (error) {
      setError(error.message);
      addLog(`獲取授權碼時出錯: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // 使用授權碼獲取設備令牌
  const handleGetDeviceToken = async () => {
    try {
      setLoading(true);
      setError("");

      addLog("開始獲取裝置令牌...");

      // 設置授權碼
      epsonPrintService.authCode = authCode;

      // 獲取設備令牌
      const tokenData = await epsonPrintService.getDeviceToken(
        clientId,
        null,
        authCode,
        redirectUri
      );

      setDeviceToken(tokenData);
      setRefreshToken(tokenData.refresh_token);
      addLog(`成功獲取裝置令牌! 令牌將在 ${tokenData.expires_in} 秒後過期`);
    } catch (error) {
      setError(error.message);
      addLog(`獲取裝置令牌時出錯: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // 使用後端 API 獲取設備令牌
  const handleGetDeviceTokenFromBackend = async () => {
    try {
      setLoading(true);
      setError("");

      addLog("通過後端 API 獲取裝置令牌...");

      const response = await fetch("/api/epson/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorizationCode: authCode,
          redirectUri: redirectUri,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "獲取裝置令牌失敗");
      }

      const tokenData = await response.json();
      setDeviceToken(tokenData);
      setRefreshToken(tokenData.refresh_token);
      addLog(
        `成功通過後端獲取裝置令牌! 令牌將在 ${tokenData.expires_in} 秒後過期`
      );
    } catch (error) {
      setError(error.message);
      addLog(`通過後端獲取裝置令牌時出錯: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // 使用前端刷新令牌
  const handleRefreshTokenFrontend = async () => {
    try {
      setLoading(true);
      setError("");

      addLog("開始透過前端刷新令牌...");

      // 使用 epsonPrintService 刷新令牌
      const tokenData = await epsonPrintService.refreshDeviceToken(
        refreshToken
      );

      setNewDeviceToken(tokenData);
      setRefreshToken(tokenData.refresh_token);
      addLog(`成功刷新裝置令牌! 新令牌將在 ${tokenData.expires_in} 秒後過期`);
    } catch (error) {
      setError(error.message);
      addLog(`刷新令牌時出錯: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // 使用後端 API 刷新令牌
  const handleRefreshTokenBackend = async () => {
    try {
      setLoading(true);
      setError("");

      addLog("通過後端 API 刷新令牌...");

      const response = await fetch("/api/epson/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "刷新令牌失敗");
      }

      const tokenData = await response.json();
      setNewDeviceToken(tokenData);
      setRefreshToken(tokenData.refresh_token);
      addLog(
        `成功通過後端刷新令牌! 新令牌將在 ${tokenData.expires_in} 秒後過期`
      );
    } catch (error) {
      setError(error.message);
      addLog(`通過後端刷新令牌時出錯: ${error.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Epson 列印授權</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">步驟 1: 獲取授權碼</h2>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Client ID:</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="輸入您的 Client ID"
            />
            {envLoaded && !clientId && (
              <p className="text-yellow-600 text-sm mt-1">
                警告：環境變量中未設置 Client ID
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">重定向 URI:</label>
            <input
              type="text"
              value={redirectUri}
              onChange={(e) => setRedirectUri(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="輸入您的重定向 URI"
            />
            {envLoaded && !redirectUri && (
              <p className="text-yellow-600 text-sm mt-1">
                警告：環境變量中未設置重定向 URI
              </p>
            )}
          </div>

          <button
            onClick={handleGetAuthCode}
            disabled={loading || !clientId || !redirectUri}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "處理中..." : "取得授權碼"}
          </button>
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">步驟 2: 獲取設備令牌</h2>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">授權碼:</label>
            <input
              type="text"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="授權碼將自動填入或手動輸入"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleGetDeviceToken}
              disabled={loading || !authCode || !clientId || !redirectUri}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? "處理中..." : "前端獲取令牌"}
            </button>

            <button
              onClick={handleGetDeviceTokenFromBackend}
              disabled={loading || !authCode}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              {loading ? "處理中..." : "後端獲取令牌"}
            </button>
          </div>
        </div>
      </div>

      {deviceToken && (
        <div className="mt-6 bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">步驟 3: 刷新設備令牌</h2>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">刷新令牌:</label>
            <input
              type="text"
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="輸入刷新令牌或使用獲取的令牌"
            />
          </div>

          <div className="flex space-x-4 mb-4">
            <button
              onClick={handleRefreshTokenFrontend}
              disabled={loading || !refreshToken || !clientId}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? "處理中..." : "前端刷新令牌"}
            </button>

            <button
              onClick={handleRefreshTokenBackend}
              disabled={loading || !refreshToken}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              {loading ? "處理中..." : "後端刷新令牌"}
            </button>
          </div>
        </div>
      )}

      {deviceToken && (
        <div className="mt-6 bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">設備令牌信息</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(deviceToken, null, 2)}
          </pre>
        </div>
      )}

      {newDeviceToken && (
        <div className="mt-6 bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">刷新後的設備令牌信息</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(newDeviceToken, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 bg-white p-6 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">日誌</h2>
        <div
          className="bg-gray-100 p-4 rounded overflow-auto max-h-60"
          id="logContainer"
        >
          {logs.map((log, index) => (
            <div
              key={index}
              className={
                log.includes("出錯") || log.includes("錯誤")
                  ? "text-red-600"
                  : "text-gray-800"
              }
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
