import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/PrintTest.module.css";
import epsonPrintService from "../services/epsonPrintService";

export default function PrintTest() {
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [refreshToken, setRefreshToken] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [tokenExpiration, setTokenExpiration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [configChanged, setConfigChanged] = useState(false);
  const [inputClientId, setInputClientId] = useState("");
  const [inputRedirectUri, setInputRedirectUri] = useState("");
  const [authCode, setAuthCode] = useState("");
  const logEndRef = useRef(null);

  // 添加日誌
  const addLog = (message, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prevLogs) => [
      { id: Date.now(), timestamp, message, isError },
      ...prevLogs,
    ]);
  };

  // 覆蓋原有的logMessage方法
  const originalLogMessage = epsonPrintService.logMessage;
  epsonPrintService.logMessage = (message, isError) => {
    originalLogMessage.call(epsonPrintService, message, isError);
    addLog(message, isError);
  };

  useEffect(() => {
    // 從環境變數中獲取 client ID 和 redirect URI
    const envClientId = process.env.NEXT_PUBLIC_EPSON_CLIENT_ID;
    const envRedirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

    // 如果存在環境變數，則使用它們
    if (envClientId) {
      setClientId(envClientId);
      epsonPrintService.clientId = envClientId;
      addLog(`從環境變數獲取 Client ID: ${envClientId.substring(0, 5)}...`);
    }

    // 設置重定向 URI，優先使用環境變數，如果不存在則使用默認值
    const defaultRedirectUri = window.location.origin + "/print-test";
    const redirectUriToUse = envRedirectUri || defaultRedirectUri;
    setRedirectUri(redirectUriToUse);
    addLog(`使用重定向 URI: ${redirectUriToUse}`);

    // 檢查是否有授權碼
    const { code } = router.query;
    if (code) {
      addLog(`從URL獲取授權碼: ${code.substring(0, 6)}...`);
      epsonPrintService.authCode = code;

      // 獲取設備令牌
      handleGetDeviceToken();

      // 清除URL中的授權碼
      router.replace("/print-test", undefined, { shallow: true });
    }

    // 從localStorage中獲取設備ID
    const savedDeviceId = localStorage.getItem("epsonDeviceId");
    if (savedDeviceId) {
      setDeviceId(savedDeviceId);
      epsonPrintService.deviceId = savedDeviceId;
      addLog(`從本地存儲中獲取設備ID: ${savedDeviceId.substring(0, 8)}...`);

      // 嘗試獲取token信息
      handleRefreshToken();
    }
  }, [router]);

  // 刷新設備令牌
  const handleRefreshToken = async () => {
    try {
      setIsLoading(true);
      addLog("正在刷新設備令牌...");

      if (!epsonPrintService.deviceId && deviceId) {
        epsonPrintService.deviceId = deviceId;
      }

      await epsonPrintService.ensureValidToken();

      // 更新狀態
      setAccessToken(epsonPrintService.deviceToken || "");
      setRefreshToken(epsonPrintService.refreshToken || "");
      setTokenExpiration(epsonPrintService.tokenExpiration);

      // 嘗試獲取設備信息
      if (epsonPrintService.deviceId) {
        await fetchDeviceInfo();
      }

      addLog("設備令牌已刷新");
    } catch (error) {
      addLog(`刷新設備令牌失敗: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取設備令牌
  const handleGetDeviceToken = async () => {
    try {
      setIsLoading(true);
      addLog("正在獲取設備令牌...");

      // 獲取設備令牌
      await epsonPrintService.getDeviceToken(clientId, null, null, redirectUri);

      // 更新設備信息
      setDeviceId(epsonPrintService.deviceId || "");
      setAccessToken(epsonPrintService.deviceToken || "");
      setRefreshToken(epsonPrintService.refreshToken || "");
      setTokenExpiration(epsonPrintService.tokenExpiration);

      // 保存設備ID到localStorage
      if (epsonPrintService.deviceId) {
        localStorage.setItem("epsonDeviceId", epsonPrintService.deviceId);

        // 獲取設備信息
        await fetchDeviceInfo();
      }

      addLog("已成功獲取設備令牌");
    } catch (error) {
      addLog(`獲取設備令牌失敗: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // 獲取設備信息
  const fetchDeviceInfo = async () => {
    try {
      addLog("正在獲取設備詳細信息...");
      const info = await epsonPrintService.getDeviceInfo();
      setDeviceInfo(info);
      addLog(`已獲取設備信息: ${info.name || info.deviceName || "Unknown"}`);
    } catch (error) {
      addLog(`獲取設備信息失敗: ${error.message}`, true);
    }
  };

  // 獲取打印能力
  const handleGetPrintCapability = async () => {
    try {
      setIsLoading(true);
      addLog("正在獲取打印能力...");
      const capability = await epsonPrintService.getPrintCapability();
      addLog(
        `已獲取打印能力，支持的紙張尺寸: ${
          capability.paperSizes?.length || 0
        } 種`
      );
    } catch (error) {
      addLog(`獲取打印能力失敗: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // 測試打印
  const handleTestPrint = async () => {
    try {
      setIsLoading(true);
      addLog("正在準備測試打印...");

      // 創建簡單的打印內容
      const content = document.createElement("div");
      content.innerHTML = `
        <div style="padding: 20px; font-family: Arial;">
          <h1 style="color: #333; text-align: center;">Epson Connect 打印測試</h1>
          <p style="margin: 20px 0;">這是一個使用refresh token機制的打印測試。</p>
          <p>設備ID: ${deviceId || "Unknown"}</p>
          <p>設備名稱: ${
            deviceInfo?.deviceName || deviceInfo?.name || "Unknown"
          }</p>
          <p>時間: ${new Date().toLocaleString()}</p>
          <hr style="margin: 20px 0;" />
          <p style="text-align: center;">如果您看到此頁面，表示打印功能正常工作！</p>
        </div>
      `;

      // 執行打印
      const result = await epsonPrintService.printContent(content);

      if (result.success) {
        addLog("打印任務已發送到設備");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      addLog(`打印失敗: ${error.message}`, true);

      // 檢查是否需要重新授權
      if (error.message.includes("無法獲取有效的設備令牌")) {
        addLog("嘗試重新獲取授權...", true);
        handleAuthorize();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 授權
  const handleAuthorize = () => {
    const authUrl = epsonPrintService.generateAuthUrl(clientId, redirectUri);

    if (authUrl) {
      addLog(
        `正在新分頁開啟授權頁面... (使用 Client ID: ${
          clientId || "默認值"
        }, Redirect URI: ${redirectUri})`
      );
      window.open(authUrl, "_blank");
    } else {
      addLog("生成授權URL失敗", true);
    }
  };

  // 更新配置
  const handleUpdateConfig = () => {
    // 從輸入框獲取值
    const configClientId = document.getElementById("configClientId").value;
    const configRedirectUri =
      document.getElementById("configRedirectUri").value;

    if (configClientId) {
      setClientId(configClientId);
      epsonPrintService.clientId = configClientId;
      addLog(`已更新 Client ID: ${configClientId.substring(0, 5)}...`);
    }

    if (configRedirectUri) {
      setRedirectUri(configRedirectUri);
      addLog(`已更新重定向 URI: ${configRedirectUri}`);
    }
  };

  // 重置
  const handleReset = () => {
    // 清除localStorage中的設備ID
    localStorage.removeItem("epsonDeviceId");

    // 重置狀態
    setDeviceId("");
    setDeviceInfo(null);
    setAccessToken("");
    setRefreshToken("");
    setTokenExpiration(null);

    // 重置服務中的狀態
    epsonPrintService.deviceId = null;
    epsonPrintService.deviceToken = null;
    epsonPrintService.refreshToken = null;
    epsonPrintService.tokenExpiration = null;

    addLog("設備連接已重置");
  };

  // 從環境變數獲取 clientId 和 redirectUri
  useEffect(() => {
    // 獲取環境變數
    const envClientId = process.env.NEXT_PUBLIC_EPSON_CLIENT_ID || "";
    const defaultRedirectUri = window.location.origin + "/print-test";
    const envRedirectUri =
      process.env.NEXT_PUBLIC_REDIRECT_URI || defaultRedirectUri;

    // 設置狀態
    if (envClientId) {
      setClientId(envClientId);
      setInputClientId(envClientId);
      addLog(
        `取得環境變數 clientId: ${envClientId.substring(0, 5)}...`,
        "info"
      );
    }

    if (envRedirectUri) {
      setRedirectUri(envRedirectUri);
      setInputRedirectUri(envRedirectUri);
      addLog(`取得環境變數 redirectUri: ${envRedirectUri}`, "info");
    }
  }, []);

  // 捲動到日誌底部
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // 應用新的配置
  const handleApplyConfig = () => {
    if (inputClientId) {
      setClientId(inputClientId);
      epsonPrintService.clientId = inputClientId;
      addLog(`已更新 clientId: ${inputClientId.substring(0, 5)}...`, "info");
    }

    if (inputRedirectUri) {
      setRedirectUri(inputRedirectUri);
      addLog(`已更新 redirectUri: ${inputRedirectUri}`, "info");
    }

    setConfigChanged(true);

    // 3秒後重置提示
    setTimeout(() => {
      setConfigChanged(false);
    }, 3000);
  };

  // 新增：使用手動輸入的授權碼獲取設備令牌
  const handleUseAuthCode = async () => {
    if (!authCode.trim()) {
      addLog("請輸入授權碼", true);
      return;
    }

    try {
      setIsLoading(true);
      addLog(`使用手動輸入的授權碼: ${authCode.substring(0, 6)}...`);

      // 設置授權碼
      epsonPrintService.authCode = authCode;

      // 獲取設備令牌
      await handleGetDeviceToken();

      // 清空授權碼輸入框
      setAuthCode("");
    } catch (error) {
      addLog(`使用授權碼失敗: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Epson打印測試</title>
        <meta name="description" content="測試Epson打印機連接和打印功能" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Epson Connect 打印測試</h1>

        <div className={styles.configSection}>
          <h2>配置</h2>
          <div className={styles.configForm}>
            <div className={styles.configItem}>
              <label className={styles.configLabel}>Client ID:</label>
              <input
                id="configClientId"
                type="text"
                className={styles.configInput}
                placeholder="輸入 Client ID"
                defaultValue={inputClientId}
                onChange={(e) => setInputClientId(e.target.value)}
              />
            </div>
            <div className={styles.configItem}>
              <label className={styles.configLabel}>Redirect URI:</label>
              <input
                id="configRedirectUri"
                type="text"
                className={styles.configInput}
                placeholder="輸入重定向 URI"
                defaultValue={inputRedirectUri}
                onChange={(e) => setInputRedirectUri(e.target.value)}
              />
            </div>
            <button className={styles.configButton} onClick={handleApplyConfig}>
              應用
            </button>
          </div>
          {configChanged && (
            <div className={styles.configStatus}>
              配置已更新！當前值:
              <br />
              Client ID: {clientId.substring(0, 5)}...
              <br />
              Redirect URI: {redirectUri}
            </div>
          )}
        </div>

        <div className={styles.configSection}>
          <h2>授權碼</h2>
          <div className={styles.configForm}>
            <div className={styles.configItem}>
              <label className={styles.configLabel}>授權碼:</label>
              <input
                type="text"
                className={styles.configInput}
                placeholder="輸入從授權頁面獲得的授權碼"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
              />
            </div>
            <button
              className={styles.configButton}
              onClick={handleUseAuthCode}
              disabled={isLoading || !authCode.trim()}
            >
              提交授權碼
            </button>
          </div>
        </div>

        <div className={styles.deviceInfo}>
          <h2>設備信息</h2>
          <div className={styles.infoItem}>
            <span className={styles.label}>設備ID:</span>
            <span className={styles.value}>
              {deviceId ? `${deviceId.substring(0, 10)}...` : "未連接"}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>設備名稱:</span>
            <span className={styles.value}>
              {deviceInfo ? deviceInfo.deviceName || deviceInfo.name : "未知"}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>型號:</span>
            <span className={styles.value}>
              {deviceInfo ? deviceInfo.modelName || "未知" : "未知"}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>Access Token:</span>
            <span className={styles.value}>
              {accessToken ? `${accessToken.substring(0, 10)}...` : "未設置"}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>Refresh Token:</span>
            <span className={styles.value}>
              {refreshToken ? `${refreshToken.substring(0, 10)}...` : "未設置"}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>過期時間:</span>
            <span className={styles.value}>
              {tokenExpiration ? tokenExpiration.toLocaleString() : "未設置"}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.label}>狀態:</span>
            <span
              className={`${styles.value} ${
                accessToken ? styles.connected : styles.disconnected
              }`}
            >
              {accessToken ? "已連接" : "未連接"}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={handleAuthorize}
            disabled={isLoading}
          >
            授權連接
          </button>

          <button
            className={styles.actionButton}
            onClick={handleRefreshToken}
            disabled={isLoading || !deviceId}
          >
            刷新Token
          </button>

          <button
            className={styles.actionButton}
            onClick={handleGetPrintCapability}
            disabled={isLoading || !accessToken}
          >
            獲取打印能力
          </button>

          <button
            className={styles.actionButton}
            onClick={handleTestPrint}
            disabled={isLoading || !accessToken}
          >
            測試打印
          </button>

          <button
            className={`${styles.actionButton} ${styles.resetButton}`}
            onClick={handleReset}
            disabled={isLoading}
          >
            重置連接
          </button>
        </div>

        <div className={styles.logContainer}>
          <h2>操作日誌</h2>
          <div className={styles.logs}>
            {logs.length === 0 ? (
              <div className={styles.emptyLog}>尚無日誌記錄</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`${styles.logEntry} ${
                    log.isError ? styles.errorLog : ""
                  }`}
                >
                  <span className={styles.logTime}>{log.timestamp}</span>
                  <span className={styles.logMessage}>{log.message}</span>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </main>
    </div>
  );
}
