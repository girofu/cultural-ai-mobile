/**
 * Epson Connect API V2 服務
 * 用於列印功能
 */

// Epson API 認證資訊
const EPSON_API_BASE_URL = "https://api.epsonconnect.com/api/2";
const EPSON_AUTH_URL = "https://auth.epsonconnect.com/auth/token";

class EpsonPrintService {
  constructor() {
    this.apiKey = process.env.EPSON_API_KEY;
    this.clientId = process.env.EPSON_CLIENT_ID;
    this.clientSecret = process.env.EPSON_CLIENT_SECRET;
    this.deviceToken = null;
    this.authorizationCode = null;
  }

  /**
   * 設置授權碼
   * @param {string} code 授權碼
   */
  setAuthorizationCode(code) {
    this.authorizationCode = code;
    console.log("已設置授權碼:", code.substring(0, 10) + "...");
  }

  /**
   * 獲取設備令牌
   * @returns {Promise<string>} 設備令牌
   */
  async getDeviceToken() {
    try {
      // 準備 Basic Auth 憑證
      const credentials = Buffer.from(
        `${this.clientId}:${this.clientSecret}`
      ).toString("base64");

      const response = await fetch(EPSON_AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
          "x-api-key": this.apiKey,
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
        }),
      });

      if (!response.ok) {
        throw new Error("獲取設備令牌失敗");
      }

      const data = await response.json();
      this.deviceToken = data.access_token;
      return this.deviceToken;
    } catch (error) {
      console.error("獲取設備令牌時出錯:", error);
      throw error;
    }
  }

  /**
   * 創建打印作業
   * @returns {Promise<string>} 打印作業ID
   */
  async createPrintJob() {
    if (!this.deviceToken) {
      await this.getDeviceToken();
    }

    try {
      const response = await fetch(`${EPSON_API_BASE_URL}/printing/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.deviceToken}`,
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify({
          job_name: "學習單",
          print_mode: "document",
          print_setting: {
            paper_size: "ps_a4",
            media_type: "pt_plainpaper",
            border_less: false,
            print_quality: "normal",
            color_mode: "color",
            double_sided: "none",
            reverse_order: false,
            copies: 1,
            collate: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("創建打印作業失敗");
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("創建打印作業時出錯:", error);
      throw error;
    }
  }

  /**
   * 上傳打印數據
   * @param {string} jobId 打印作業ID
   * @param {Blob} pdfBlob PDF數據
   * @returns {Promise<void>}
   */
  async uploadPrintData(jobId, pdfBlob) {
    if (!this.deviceToken) {
      await this.getDeviceToken();
    }

    try {
      const response = await fetch(
        `${EPSON_API_BASE_URL}/printing/jobs/${jobId}/print?File=1.pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/pdf",
            Authorization: `Bearer ${this.deviceToken}`,
            "x-api-key": this.apiKey,
          },
          body: pdfBlob,
        }
      );

      if (!response.ok) {
        throw new Error("上傳打印數據失敗");
      }
    } catch (error) {
      console.error("上傳打印數據時出錯:", error);
      throw error;
    }
  }

  /**
   * 執行打印
   * @param {string} jobId 打印作業ID
   * @returns {Promise<void>}
   */
  async executePrint(jobId) {
    if (!this.deviceToken) {
      await this.getDeviceToken();
    }

    try {
      const response = await fetch(
        `${EPSON_API_BASE_URL}/printing/jobs/${jobId}/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.deviceToken}`,
            "x-api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error("執行打印失敗");
      }
    } catch (error) {
      console.error("執行打印時出錯:", error);
      throw error;
    }
  }

  /**
   * 將HTML內容轉換為PDF並打印
   * @param {HTMLElement} contentElement 要打印的HTML元素
   * @returns {Promise<object>} 結果對象
   */
  async printContent(contentElement) {
    try {
      // 檢查是否有授權碼
      if (!this.authorizationCode) {
        throw new Error("尚未設置授權碼，請先完成印表機授權");
      }

      // 將HTML內容轉換為PDF
      const pdfBlob = await this.convertToPdf(contentElement);

      // 將Blob轉換為Base64字符串
      const base64Data = await this.blobToBase64(pdfBlob);

      // 通過API路由發送列印請求
      const response = await fetch("/api/print", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfData: base64Data,
          authorizationCode: this.authorizationCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "列印請求失敗");
      }

      // 如果回應中有設備令牌資訊，可以存儲刷新令牌供後續使用
      if (result.deviceTokenInfo && result.deviceTokenInfo.refresh_token) {
        console.log("已獲取刷新令牌，可用於後續列印操作");
        // 這裡可以存儲刷新令牌到 localStorage 或其他地方
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "epsonRefreshToken",
            result.deviceTokenInfo.refresh_token
          );
        }
      }

      return { success: true, message: result.message || "列印請求已發送" };
    } catch (error) {
      console.error("打印內容時出錯:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 將Blob轉換為Base64字符串
   * @param {Blob} blob Blob對象
   * @returns {Promise<string>} Base64字符串
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // 移除 data:application/pdf;base64, 前綴
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 將HTML元素轉換為PDF
   * @param {HTMLElement} element HTML元素
   * @returns {Promise<Blob>} PDF Blob
   */
  async convertToPdf(element) {
    // 引入html2pdf庫（客戶端渲染時使用）
    const html2pdf =
      typeof window !== "undefined" ? require("html2pdf.js") : null;

    if (!html2pdf) {
      throw new Error("無法在伺服器端轉換PDF");
    }

    return new Promise((resolve, reject) => {
      const options = {
        margin: 10,
        filename: "學習單.pdf",
        image: { type: "jpeg", quality: 0.5 },
        html2canvas: { scale: 1, useCORS: true },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
          compress: true,
          precision: 2,
        },
      };

      html2pdf()
        .from(element)
        .set(options)
        .outputPdf("blob")
        .then((blob) => {
          resolve(blob);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

export default new EpsonPrintService();
