/**
 * Epson Connect 列印 API 路由
 * 處理列印請求，避免在前端暴露敏感認證信息
 */
import fetch from "node-fetch";

// Epson API 認證資訊
const EPSON_API_BASE_URL = "https://api.epsonconnect.com/api/2";
const EPSON_AUTH_URL = "https://auth.epsonconnect.com/auth/token";
const EPSON_API_KEY = process.env.EPSON_API_KEY;
const EPSON_CLIENT_ID = process.env.EPSON_CLIENT_ID;
const EPSON_CLIENT_SECRET = process.env.EPSON_CLIENT_SECRET;
const EPSON_REDIRECT_URI = process.env.EPSON_REDIRECT_URI;

// 設置更大的 bodyParser 大小限制
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

/**
 * 獲取應用程序令牌
 * @returns {Promise<Object>} 應用程序令牌信息
 */
async function getApplicationToken() {
  try {
    console.log("開始獲取應用程序令牌...");

    // 準備 Basic Auth 憑證
    const credentials = Buffer.from(
      `${EPSON_CLIENT_ID}:${EPSON_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(EPSON_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
        "x-api-key": EPSON_API_KEY,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("獲取應用程序令牌失敗:", errorData);
      throw new Error(`獲取應用程序令牌失敗: ${errorData}`);
    }

    const data = await response.json();
    console.log("成功獲取應用程序令牌");
    return data;
  } catch (error) {
    console.error("獲取應用程序令牌時出錯:", error);
    throw error;
  }
}

/**
 * 使用授權碼獲取設備令牌
 * @param {string} authorizationCode 授權碼
 * @returns {Promise<Object>} 設備令牌信息
 */
async function getDeviceToken(authorizationCode) {
  try {
    console.log("開始獲取設備令牌...");

    // 準備 Basic Auth 憑證
    const credentials = Buffer.from(
      `${EPSON_CLIENT_ID}:${EPSON_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(EPSON_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
        "x-api-key": EPSON_API_KEY,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authorizationCode,
        redirect_uri: EPSON_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => response.text());
      console.error("獲取設備令牌失敗:", JSON.stringify(errorData));
      throw new Error(
        typeof errorData === "object"
          ? `獲取設備令牌失敗: ${errorData.error}`
          : `獲取設備令牌失敗: ${errorData}`
      );
    }

    const data = await response.json();
    console.log("成功獲取設備令牌");
    return data;
  } catch (error) {
    console.error("獲取設備令牌時出錯:", error);
    throw error;
  }
}

/**
 * 創建打印作業
 * @param {string} token 設備令牌
 * @returns {Promise<string>} 打印作業ID
 */
async function createPrintJob(token) {
  try {
    console.log("開始創建打印作業...");
    console.log("使用令牌:", token.substring(0, 10) + "...");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-api-key": EPSON_API_KEY,
    };

    const printSettings = {
      job_name: "學習單",
      print_mode: "document",
      print_setting: {
        paper_size: "ps_a4",
        paper_type: "pt_plainpaper",
        border_less: false,
        print_quality: "normal",
        color_mode: "color",
        double_sided: "none",
        reverse_order: false,
        copies: 1,
        collate: true,
      },
    };

    console.log("打印設置:", JSON.stringify(printSettings));

    const response = await fetch(`${EPSON_API_BASE_URL}/printing/jobs`, {
      method: "POST",
      headers,
      body: JSON.stringify(printSettings),
    });

    // 獲取完整回應內容
    const responseText = await response.text();
    console.log("API 響應狀態:", response.status);
    console.log("API 響應內容:", responseText);

    if (!response.ok) {
      throw new Error(`創建打印作業失敗: ${responseText}`);
    }

    try {
      const data = JSON.parse(responseText);
      console.log("成功創建打印作業, ID:", data.id);
      return data.id;
    } catch (parseError) {
      throw new Error(`解析回應失敗: ${responseText}`);
    }
  } catch (error) {
    console.error("創建打印作業時出錯:", error);
    throw error;
  }
}

/**
 * 上傳打印數據
 * @param {string} token 設備令牌
 * @param {string} jobId 打印作業ID
 * @param {Buffer} pdfData PDF數據
 * @returns {Promise<void>}
 */
async function uploadPrintData(token, jobId, pdfData) {
  try {
    console.log("開始上傳打印數據...");
    console.log("PDF數據大小:", pdfData.length, "bytes");

    const response = await fetch(
      `${EPSON_API_BASE_URL}/printing/jobs/${jobId}/print?File=1.pdf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/pdf",
          Authorization: `Bearer ${token}`,
          "x-api-key": EPSON_API_KEY,
        },
        body: pdfData,
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error("上傳打印數據失敗:", responseText);
      throw new Error(`上傳打印數據失敗: ${responseText}`);
    }

    console.log("成功上傳打印數據");
  } catch (error) {
    console.error("上傳打印數據時出錯:", error);
    throw error;
  }
}

/**
 * 執行打印
 * @param {string} token 設備令牌
 * @param {string} jobId 打印作業ID
 * @returns {Promise<void>}
 */
async function executePrint(token, jobId) {
  try {
    console.log("開始執行打印...");

    const response = await fetch(
      `${EPSON_API_BASE_URL}/printing/jobs/${jobId}/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-api-key": EPSON_API_KEY,
        },
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error("執行打印失敗:", responseText);
      throw new Error(`執行打印失敗: ${responseText}`);
    }

    console.log("成功執行打印");
  } catch (error) {
    console.error("執行打印時出錯:", error);
    throw error;
  }
}

export default async function handler(req, res) {
  console.log("收到列印請求");

  // 只允許 POST 請求
  if (req.method !== "POST") {
    return res.status(405).json({ error: "方法不允許" });
  }

  // 檢查必要參數
  if (!req.body) {
    console.error("缺少請求主體");
    return res.status(400).json({ error: "缺少請求主體" });
  }

  const { pdfData, authorizationCode } = req.body;

  if (!pdfData) {
    console.error("缺少PDF數據");
    return res.status(400).json({ error: "缺少PDF數據" });
  }

  if (!authorizationCode) {
    console.error("缺少授權碼");
    return res.status(400).json({ error: "缺少授權碼，無法取得設備令牌" });
  }

  try {
    // 從Base64字符串解碼PDF數據
    const pdfBuffer = Buffer.from(pdfData, "base64");
    console.log("PDF Buffer 大小:", pdfBuffer.length, "bytes");

    if (pdfBuffer.length > 2 * 1024 * 1024) {
      console.warn("PDF大小超過2MB，可能會導致API超時或失敗");
    }

    // 使用授權碼獲取設備令牌
    const deviceTokenInfo = await getDeviceToken(authorizationCode);
    const deviceToken = deviceTokenInfo.access_token;

    // 創建打印作業
    const jobId = await createPrintJob(deviceToken);

    // 上傳打印數據
    await uploadPrintData(deviceToken, jobId, pdfBuffer);

    // 執行打印
    await executePrint(deviceToken, jobId);

    console.log("列印請求處理完成");

    // 返回成功響應
    res.status(200).json({
      success: true,
      message: "列印請求已發送",
      jobId,
      deviceTokenInfo, // 返回設備令牌信息，前端可能需要保存刷新令牌
    });
  } catch (error) {
    console.error("處理列印請求時出錯:", error);
    res.status(500).json({
      error: error.message || "處理列印請求時出現未知錯誤",
    });
  }
}
