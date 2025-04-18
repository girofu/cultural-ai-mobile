/**
 * Epson Connect API V2 服務
 * 用於列印功能
 */

// Epson API 認證資訊
const EPSON_API_BASE_URL = "https://api.epsonconnect.com/api/2";
const EPSON_AUTH_URL = "https://auth.epsonconnect.com/auth/token";

class EpsonPrintService {
  constructor() {
    // 檢查是否在客戶端環境
    const isClient = typeof window !== "undefined";

    // 優先使用環境變數，如果不存在則嘗試從 window 對象獲取
    this.apiKey =
      process.env.NEXT_PUBLIC_EPSON_API_KEY ||
      (isClient && window.ENV_EPSON_API_KEY);

    this.clientId =
      process.env.NEXT_PUBLIC_EPSON_CLIENT_ID ||
      (isClient && window.ENV_EPSON_CLIENT_ID);

    this.clientSecret =
      process.env.EPSON_CLIENT_SECRET ||
      (isClient && window.ENV_EPSON_CLIENT_SECRET);

    this.deviceToken = null;
    this.refreshToken = null;
    this.tokenExpiration = null;
    this.currentJobId = "";
    this.uploadUri = "";
    this.printCapability = null;
    this._authCode = null;
    this.deviceId = null; // 添加設備ID
  }

  /**
   * 獲取授權碼
   * @returns {string} 授權碼
   */
  get authCode() {
    return this._authCode;
  }

  /**
   * 設置授權碼
   * @param {string} code 授權碼
   */
  set authCode(code) {
    this._authCode = code;
    this.logMessage(
      `已設置授權碼: ${code ? code.substring(0, 6) + "..." : "未設置"}`
    );
  }

  /**
   * 記錄訊息到控制台
   * @param {string} message 訊息內容
   * @param {boolean} isError 是否為錯誤訊息
   */
  logMessage(message, isError = false) {
    if (typeof window !== "undefined") {
      // 檢查 jQuery 是否存在
      if (typeof $ !== "undefined" && $("#logContainer").length) {
        const logContainer = $("#logContainer");
        const timestamp = new Date().toLocaleTimeString();
        const logClass = isError ? "text-danger" : "text-info";
        logContainer.prepend(
          `<div class="${logClass}">[${timestamp}] ${message}</div>`
        );
      }
    }

    if (isError) {
      console.error(message);
    } else {
      console.log(message);
    }
  }

  /**
   * 獲取文件的 Base64 編碼
   * @param {File} file 文件對象
   * @returns {Promise<ArrayBuffer>} 文件的 ArrayBuffer
   */
  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * 獲取授權標頭
   * @returns {string} 授權標頭
   */
  getAuthorizationHeader() {
    return `Bearer ${this.deviceToken}`;
  }

  /**
   * 獲取基本授權標頭
   * @param {string} clientId 客戶端ID
   * @param {string} clientSecret 客戶端密鑰
   * @returns {string} 基本授權標頭
   */
  getBasicAuthHeader(clientId, clientSecret) {
    const id = clientId || this.clientId;
    const secret = clientSecret || this.clientSecret;
    return `Basic ${btoa(`${id}:${secret}`)}`;
  }

  /**
   * 生成授權URL
   * @param {string} clientId 客戶端ID
   * @param {string} redirectUrl 重定向URL
   * @returns {string} 授權URL
   */
  generateAuthUrl(clientId, redirectUrl) {
    const id = clientId || this.clientId;

    if (!id || !redirectUrl) {
      this.logMessage("請填寫 Client ID 和 Redirect URL", true);
      return null;
    }

    const authUrl = `https://auth.epsonconnect.com/auth/authorize?response_type=code&client_id=${encodeURIComponent(
      id
    )}&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=device`;

    this.logMessage("已生成授權網址");
    return authUrl;
  }

  /**
   * 獲取設備令牌
   * @param {string} clientId 客戶端ID
   * @param {string} clientSecret 客戶端密鑰
   * @param {string} authCode 授權碼
   * @param {string} redirectUrl 重定向URL
   * @returns {Promise<object>} 設備令牌信息
   */
  async getDeviceToken(clientId, clientSecret, authCode, redirectUrl) {
    const id = clientId || this.clientId;
    const secret = clientSecret || this.clientSecret;
    const code = authCode || this._authCode;

    if (!id || !secret || !code || !redirectUrl) {
      this.logMessage("請填寫所有認證資訊", true);
      return Promise.reject(new Error("認證資訊不完整"));
    }

    try {
      this.logMessage("正在使用授權碼獲取設備令牌...");
      // 使用原生 fetch
      const response = await fetch(EPSON_AUTH_URL, {
        method: "POST",
        headers: {
          Authorization: this.getBasicAuthHeader(id, secret),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(
          redirectUrl
        )}`,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      this.deviceToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiration = new Date();
      this.tokenExpiration.setSeconds(
        this.tokenExpiration.getSeconds() + data.expires_in
      );

      // 獲取設備信息來確定設備ID
      await this.getDeviceInfo();

      // 保存設備信息到數據庫
      if (this.deviceId) {
        this.saveDeviceInfo();
      }

      this.logMessage("已成功獲取裝置權杖");
      return data;
    } catch (error) {
      this.logMessage(`取得裝置權杖失敗: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 保存設備信息到數據庫
   * @returns {Promise<boolean>} 操作是否成功
   */
  async saveDeviceInfo() {
    if (!this.deviceId || !this.refreshToken) {
      this.logMessage("無法保存設備信息：缺少設備ID或刷新令牌", true);
      return false;
    }

    try {
      this.logMessage("正在保存設備信息到數據庫...");

      // 獲取設備詳細信息
      const deviceInfo = await this.getDeviceInfo();

      // 準備保存的數據
      const data = {
        deviceId: this.deviceId,
        refreshToken: this.refreshToken,
        accessToken: this.deviceToken,
        expiresIn: 3600, // 假設token有效期為1小時
        deviceInfo: {
          modelName: deviceInfo?.modelName || "Unknown Model",
          deviceName: deviceInfo?.deviceName || "Epson Printer",
          serialNumber: deviceInfo?.serialNumber || "Unknown",
        },
      };

      // 發送到API保存
      const response = await fetch("/api/device/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logMessage(`保存設備信息失敗: ${error.error}`, true);
        return false;
      }

      this.logMessage("設備信息已成功保存");
      return true;
    } catch (error) {
      this.logMessage(`保存設備信息時出錯: ${error.message}`, true);
      return false;
    }
  }

  /**
   * 從數據庫中獲取並刷新設備令牌
   * @returns {Promise<object>} 設備令牌信息
   */
  async getDeviceTokenFromDb() {
    if (!this.deviceId) {
      this.logMessage("無法獲取令牌：缺少設備ID", true);
      return Promise.reject(new Error("缺少設備ID"));
    }

    try {
      this.logMessage("正在從數據庫獲取設備令牌...");

      // 從API獲取token
      const response = await fetch(
        `/api/device/token?deviceId=${this.deviceId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "獲取設備令牌失敗");
      }

      const data = await response.json();

      // 更新內部狀態
      this.deviceToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiration = new Date();
      this.tokenExpiration.setSeconds(
        this.tokenExpiration.getSeconds() + data.expires_in
      );

      this.logMessage("成功獲取設備令牌");
      return data;
    } catch (error) {
      this.logMessage(`獲取設備令牌時出錯: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 刷新設備令牌
   * @param {string} refreshToken 刷新令牌
   * @returns {Promise<object>} 設備令牌信息
   */
  async refreshDeviceToken(refreshToken) {
    const token = refreshToken || this.refreshToken;

    if (!token) {
      this.logMessage("未提供刷新令牌", true);
      return Promise.reject(new Error("未提供刷新令牌"));
    }

    if (!this.clientId || !this.clientSecret) {
      this.logMessage("未設置客戶端ID或客戶端秘鑰", true);
      return Promise.reject(new Error("認證資訊不完整"));
    }

    try {
      this.logMessage("正在刷新設備令牌...");

      // 使用原生 fetch
      const response = await fetch(EPSON_AUTH_URL, {
        method: "POST",
        headers: {
          Authorization: this.getBasicAuthHeader(),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=refresh_token&refresh_token=${token}&client_id=${this.clientId}`,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      this.deviceToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiration = new Date();
      this.tokenExpiration.setSeconds(
        this.tokenExpiration.getSeconds() + data.expires_in
      );

      // 如果已有設備ID，則更新數據庫中的信息
      if (this.deviceId) {
        this.saveDeviceInfo();
      }

      this.logMessage("已成功刷新裝置權杖");
      return data;
    } catch (error) {
      this.logMessage(`刷新裝置權杖失敗: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 確保有有效的設備令牌
   * 如果無法獲取有效令牌，則拋出錯誤
   * @returns {Promise<string>} 有效的設備令牌
   */
  async ensureValidToken() {
    // 如果有設備ID，則嘗試從數據庫獲取token
    if (this.deviceId) {
      try {
        await this.getDeviceTokenFromDb();
        return this.deviceToken;
      } catch (error) {
        this.logMessage(`無法從數據庫獲取令牌: ${error.message}`, true);
        // 繼續嘗試其他方法
      }
    }

    // 如果有有效的令牌，則直接返回
    if (
      this.deviceToken &&
      this.tokenExpiration &&
      new Date() < this.tokenExpiration
    ) {
      return this.deviceToken;
    }

    // 如果有刷新令牌，則嘗試刷新
    if (this.refreshToken) {
      try {
        await this.refreshDeviceToken();
        return this.deviceToken;
      } catch (error) {
        this.logMessage(`刷新令牌失敗: ${error.message}`, true);
        // 繼續嘗試其他方法
      }
    }

    // 如果有授權碼，則嘗試獲取新令牌
    if (this.authCode) {
      try {
        // 需要有redirect URL
        const redirectUrl = window.location.origin + "/auth/callback";
        await this.getDeviceToken(null, null, null, redirectUrl);
        return this.deviceToken;
      } catch (error) {
        this.logMessage(`使用授權碼獲取令牌失敗: ${error.message}`, true);
      }
    }

    // 如果以上都失敗，則拋出錯誤
    throw new Error("無法獲取有效的設備令牌");
  }

  /**
   * 獲取列印能力
   * @param {string} printMode 列印模式
   * @returns {Promise<object>} 列印能力信息
   */
  async getPrintCapability(printMode = "document") {
    try {
      // 確保有有效的令牌
      await this.ensureValidToken();

      this.logMessage("正在獲取列印能力...");

      const response = await fetch(
        `${EPSON_API_BASE_URL}/printing/capability/${printMode}`,
        {
          method: "GET",
          headers: {
            Authorization: this.getAuthorizationHeader(),
            "x-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      this.printCapability = data;
      this.logMessage("已獲取列印能力資訊");
      return data;
    } catch (error) {
      this.logMessage(`獲取列印能力失敗: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 更新紙張類型選項
   * @param {object} paperSizeObj 紙張尺寸對象
   * @returns {object} 紙張類型信息
   */
  updatePaperTypes(paperSizeObj) {
    if (!paperSizeObj || !paperSizeObj.paperTypes) {
      return null;
    }

    const paperTypeObj = paperSizeObj.paperTypes[0];
    return paperTypeObj;
  }

  /**
   * 更新紙張選項
   * @param {object} paperTypeObj 紙張類型對象
   * @returns {object} 紙張選項信息
   */
  updatePaperOptions(paperTypeObj) {
    if (!paperTypeObj) {
      return null;
    }

    return {
      borderless: paperTypeObj.borderless,
      paperSources: paperTypeObj.paperSources,
      printQualities: paperTypeObj.printQualities,
    };
  }

  /**
   * 創建列印任務
   * @param {object} options 列印選項
   * @returns {Promise<object>} 列印任務信息
   */
  async createPrintJob(options) {
    try {
      // 確保有有效的令牌
      await this.ensureValidToken();

      const file = options.file;
      if (!file) {
        this.logMessage("請選擇要列印的文件", true);
        throw new Error("請選擇要列印的文件");
      }

      // 準備請求資料
      const requestData = {
        jobName: options.jobName || "Document",
        printMode: options.printMode || "document",
      };

      // 只有在不使用機台預設設定時才加入列印設定
      if (!options.useDeviceDefaults) {
        requestData.printSettings = {
          paperSize: options.paperSize || "ps_a4",
          paperType: options.paperType || "pt_plainpaper",
          borderless:
            options.borderless !== undefined ? options.borderless : false,
          printQuality: options.printQuality || "normal",
          paperSource: options.paperSource || "auto",
          colorMode: options.colorMode || "color",
          doubleSided: options.doubleSided || "none",
          reverseOrder:
            options.reverseOrder !== undefined ? options.reverseOrder : false,
          copies: options.copies || 1,
          collate: options.collate !== undefined ? options.collate : true,
        };
      } else {
        this.logMessage("使用機台預設列印設定");
      }

      this.logMessage("正在創建列印任務...");

      const response = await fetch(`${EPSON_API_BASE_URL}/printing/jobs`, {
        method: "POST",
        headers: {
          Authorization: this.getAuthorizationHeader(),
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      this.currentJobId = data.jobId;
      this.uploadUri = data.uploadUri;
      this.logMessage(`已創建列印任務, JobID: ${this.currentJobId}`);

      // 如果提供了文件，則自動上傳
      if (file) {
        await this.uploadFile(file);
      }

      return data;
    } catch (error) {
      this.logMessage(`創建列印任務失敗: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 上傳文件
   * @param {File} file 文件對象
   * @returns {Promise<object>} 上傳結果
   */
  async uploadFile(file) {
    if (!this.uploadUri) {
      this.logMessage("請先創建列印任務", true);
      return Promise.reject(new Error("請先創建列印任務"));
    }

    const fileExtension = file.name.split(".").pop().toLowerCase();
    let contentType;

    // 根據文件類型設置 Content-Type
    switch (fileExtension) {
      case "pdf":
        contentType = "application/pdf";
        break;
      case "jpg":
      case "jpeg":
        contentType = "image/jpeg";
        break;
      case "png":
        contentType = "image/png";
        break;
      default:
        contentType = "application/octet-stream";
    }

    this.logMessage("開始上傳文件...");

    try {
      // 讀取文件數據
      const fileData = await this.getBase64(file);

      const response = await fetch(
        `${this.uploadUri}&File=1.${fileExtension}`,
        {
          method: "POST",
          headers: {
            "Content-Type": contentType,
          },
          body: fileData,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      this.logMessage("文件上傳成功");
      this.logMessage("等待系統處理文件...");

      // 等待1.5秒再返回，給系統時間處理上傳的文件
      return new Promise((resolve) => {
        setTimeout(() => {
          this.logMessage("文件處理完成，可以開始列印");
          resolve({ success: true });
        }, 1500);
      });
    } catch (error) {
      this.logMessage(`文件上傳失敗: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 執行列印
   * @returns {Promise<object>} 列印結果
   */
  async executePrint() {
    try {
      // 確保有有效的令牌
      await this.ensureValidToken();

      if (!this.currentJobId) {
        this.logMessage("請先創建列印任務", true);
        throw new Error("請先創建列印任務");
      }

      this.logMessage("正在執行列印...");

      const response = await fetch(
        `${EPSON_API_BASE_URL}/printing/jobs/${this.currentJobId}/print`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthorizationHeader(),
            "x-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      this.logMessage("已發送列印命令");
      this.logMessage(`回應: ${JSON.stringify(data || {})}`);
      return data;
    } catch (error) {
      this.logMessage(`列印失敗: ${error.message}`, true);
      this.logMessage(
        "請確認 API Key 是否正確，以及列印任務狀態是否有效",
        true
      );
      throw error;
    }
  }

  /**
   * 取消列印
   * @returns {Promise<object>} 取消結果
   */
  async cancelPrint() {
    if (!this.currentJobId) {
      this.logMessage("無法取消，沒有進行中的列印任務", true);
      return Promise.reject(new Error("無進行中的列印任務"));
    }

    try {
      // 確保有有效的令牌
      await this.ensureValidToken();

      this.logMessage("正在取消列印任務...");

      const response = await fetch(
        `${EPSON_API_BASE_URL}/printing/jobs/${this.currentJobId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthorizationHeader(),
            "x-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      this.logMessage("已取消列印任務");
      return { success: true };
    } catch (error) {
      this.logMessage(`取消列印失敗: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 獲取列印任務信息
   * @returns {Promise<object>} 列印任務信息
   */
  async getPrintJobInfo() {
    try {
      // 確保有有效的令牌
      await this.ensureValidToken();

      if (!this.currentJobId) {
        this.logMessage("請先創建列印任務", true);
        throw new Error("請先創建列印任務");
      }

      this.logMessage("正在獲取列印任務狀態...");

      const response = await fetch(
        `${EPSON_API_BASE_URL}/printing/jobs/${this.currentJobId}`,
        {
          method: "GET",
          headers: {
            Authorization: this.getAuthorizationHeader(),
            "x-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();

      // 記錄重要狀態資訊
      this.logMessage(`任務狀態: ${data.status || "未知"}`);
      if (data.errorCode) {
        this.logMessage(`錯誤代碼: ${data.errorCode}`, true);
      }
      if (data.errorDescription) {
        this.logMessage(`錯誤描述: ${data.errorDescription}`, true);
      }

      this.logMessage("已獲取列印任務資訊");
      return data;
    } catch (error) {
      this.logMessage(`獲取列印任務資訊失敗: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 獲取預設列印設定
   * @returns {Promise<object>} 預設列印設定
   */
  async getDefaultSettings() {
    try {
      // 確保有有效的令牌
      await this.ensureValidToken();

      this.logMessage("正在獲取預設列印設定...");

      const response = await fetch(
        `${EPSON_API_BASE_URL}/printing/capability/default`,
        {
          method: "GET",
          headers: {
            Authorization: this.getAuthorizationHeader(),
            "x-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      this.logMessage("已獲取預設列印設定");
      return data;
    } catch (error) {
      this.logMessage(`獲取預設列印設定失敗: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 獲取裝置信息
   * @returns {Promise<object>} 裝置信息
   */
  async getDeviceInfo() {
    try {
      // 確保有有效的令牌，但如果是首次獲取設備信息，則忽略此步驟
      if (this.deviceToken) {
        await this.ensureValidToken();
      } else if (!this.deviceToken) {
        this.logMessage("請先取得裝置權杖", true);
        throw new Error("請先取得裝置權杖");
      }

      this.logMessage("正在獲取裝置資訊...");

      const response = await fetch(
        `${EPSON_API_BASE_URL}/printing/devices/info`,
        {
          method: "GET",
          headers: {
            Authorization: this.getAuthorizationHeader(),
            "x-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();

      // 保存設備ID
      if (data && data.id) {
        this.deviceId = data.id;
      }

      this.logMessage("已獲取裝置資訊");
      return data;
    } catch (error) {
      this.logMessage(`獲取裝置資訊失敗: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 獲取通知設定
   * @returns {Promise<object>} 通知設定
   */
  async getNotification() {
    try {
      // 確保有有效的令牌
      await this.ensureValidToken();

      this.logMessage("正在獲取通知設定...");

      const response = await fetch(
        `${EPSON_API_BASE_URL}/printing/settings/notification`,
        {
          method: "GET",
          headers: {
            Authorization: this.getAuthorizationHeader(),
            "x-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      const data = await response.json();
      this.logMessage("已獲取通知設定");
      return data;
    } catch (error) {
      this.logMessage(`獲取通知設定失敗: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 更新通知設定
   * @param {boolean} enabled 是否啟用通知
   * @param {string} callbackUri 回調URI
   * @returns {Promise<object>} 更新結果
   */
  async updateNotification(enabled, callbackUri) {
    try {
      // 確保有有效的令牌
      await this.ensureValidToken();

      const data = {
        notification: enabled,
        callbackUri: callbackUri,
      };

      this.logMessage("正在更新通知設定...");

      const response = await fetch(
        `${EPSON_API_BASE_URL}/printing/settings/notification`,
        {
          method: "POST",
          headers: {
            Authorization: this.getAuthorizationHeader(),
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      this.logMessage("已更新通知設定");
      return { success: true };
    } catch (error) {
      this.logMessage(`更新通知設定失敗: ${error.message}`, true);
      throw error;
    }
  }

  /**
   * 一次性操作：將文件上傳並列印
   * @param {object} options 列印選項
   * @returns {Promise<object>} 列印結果
   */
  async uploadAndPrint(options) {
    try {
      await this.createPrintJob(options);
      const result = await this.executePrint();
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 將 HTML 元素轉換為 PDF 並列印
   * @param {HTMLElement} element HTML 元素
   * @param {object} options 列印選項
   * @returns {Promise<object>} 列印結果
   */
  async printHtmlContent(element, options = {}) {
    try {
      // 確保有有效的令牌
      await this.ensureValidToken();

      // 檢查是否在瀏覽器環境
      if (typeof window === "undefined") {
        throw new Error("此功能僅在瀏覽器環境中可用");
      }

      const pdfBlob = await this.convertHtmlToPdf(element);

      // 創建文件對象
      const pdfFile = new File([pdfBlob], "document.pdf", {
        type: "application/pdf",
      });

      // 設置列印選項
      const printOptions = {
        ...options,
        file: pdfFile,
        jobName: options.jobName || "HTML Document",
      };

      // 上傳並列印
      return await this.uploadAndPrint(printOptions);
    } catch (error) {
      this.logMessage(`HTML列印失敗: ${error.message}`, true);
      return { success: false, error: error.message };
    }
  }

  /**
   * 通用列印內容方法
   * @param {HTMLElement|String} content HTML元素或HTML字符串
   * @param {Object} options 列印選項
   * @returns {Promise<Object>} 列印結果
   */
  async printContent(content, options = {}) {
    try {
      // 檢查內容類型
      let element;
      if (typeof content === "string") {
        // 如果是字符串，創建一個臨時元素
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = content;
        element = tempDiv;
      } else if (content instanceof HTMLElement) {
        element = content;
      } else {
        throw new Error("不支持的內容類型，請提供HTML元素或HTML字符串");
      }

      return await this.printHtmlContent(element, options);
    } catch (error) {
      this.logMessage(`列印內容失敗: ${error.message}`, true);
      return { success: false, error: error.message };
    }
  }

  /**
   * 將 HTML 元素轉換為 PDF
   * @param {HTMLElement} element HTML 元素
   * @returns {Promise<Blob>} PDF 文件
   */
  convertHtmlToPdf(element) {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !element) {
        reject(new Error("無效的HTML元素或非瀏覽器環境"));
        return;
      }

      // 檢查 html2pdf 是否存在
      if (!window.html2pdf) {
        // 動態載入 html2pdf.js
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
        script.onload = () => {
          this.createPdfFromElement(element, resolve, reject);
        };
        script.onerror = () => {
          reject(new Error("無法載入 PDF 轉換庫"));
        };
        document.head.appendChild(script);
      } else {
        this.createPdfFromElement(element, resolve, reject);
      }
    });
  }

  /**
   * 使用 html2pdf 從元素創建 PDF
   * @param {HTMLElement} element HTML 元素
   * @param {Function} resolve Promise resolve 函數
   * @param {Function} reject Promise reject 函數
   */
  createPdfFromElement(element, resolve, reject) {
    try {
      // 複製元素進行轉換
      const clone = element.cloneNode(true);
      clone.style.backgroundColor = "white";
      clone.style.padding = "20px";

      // 創建臨時容器
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.appendChild(clone);
      document.body.appendChild(container);

      // 轉換為 PDF
      html2pdf()
        .set({
          margin: 10,
          filename: "document.pdf",
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(clone)
        .outputPdf("blob")
        .then((blob) => {
          // 移除臨時容器
          document.body.removeChild(container);
          resolve(blob);
        })
        .catch((error) => {
          document.body.removeChild(container);
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  }
}

// 創建單例實例
const epsonPrintService = new EpsonPrintService();

export default epsonPrintService;
