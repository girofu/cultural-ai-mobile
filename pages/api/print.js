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
 * @returns {Promise<string>} 應用程序令牌
 */
async function getApplicationToken() {
  try {
    console.log("開始獲取應用程序令牌...");

    const response = await fetch(EPSON_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-api-key": EPSON_API_KEY,
      },
      body: new URLSearchParams({
        client_id: EPSON_CLIENT_ID,
        client_secret: EPSON_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("獲取應用程序令牌失敗:", errorData);
      throw new Error("獲取應用程序令牌失敗");
    }

    const data = await response.json();
    console.log("成功獲取應用程序令牌");
    return data.access_token;
  } catch (error) {
    console.error("獲取應用程序令牌時出錯:", error);
    throw error;
  }
}

/**
 * 創建打印作業
 * @param {string} token 應用程序令牌
 * @returns {Promise<string>} 打印作業ID
 */
async function createPrintJob(token) {
  try {
    console.log("開始創建打印作業...");

    const response = await fetch(`${EPSON_API_BASE_URL}/printing/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-api-key": EPSON_API_KEY,
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
      const errorData = await response.text();
      console.error("創建打印作業失敗:", errorData);
      throw new Error(`創建打印作業失敗: ${errorData}`);
    }

    const data = await response.json();
    console.log("成功創建打印作業, ID:", data.id);
    return data.id;
  } catch (error) {
    console.error("創建打印作業時出錯:", error);
    throw error;
  }
}

/**
 * 上傳打印數據
 * @param {string} token 應用程序令牌
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
 * @param {string} token 應用程序令牌
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error("執行打印失敗:", errorData);
      throw new Error(`執行打印失敗: ${errorData}`);
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

  // 檢查是否有PDF數據
  if (!req.body || !req.body.pdfData) {
    console.error("缺少PDF數據");
    return res.status(400).json({ error: "缺少PDF數據" });
  }

  try {
    // 從Base64字符串解碼PDF數據
    const pdfBuffer = Buffer.from(req.body.pdfData, "base64");
    console.log("PDF Buffer 大小:", pdfBuffer.length, "bytes");

    if (pdfBuffer.length > 2 * 1024 * 1024) {
      console.warn("PDF大小超過2MB，可能會導致API超時或失敗");
    }

    // 獲取應用程序令牌
    const applicationToken = await getApplicationToken();

    // 創建打印作業
    const jobId = await createPrintJob(applicationToken);

    // 上傳打印數據
    await uploadPrintData(applicationToken, jobId, pdfBuffer);

    // 執行打印
    await executePrint(applicationToken, jobId);

    console.log("列印請求處理完成");

    // 返回成功響應
    res.status(200).json({ success: true, message: "列印請求已發送", jobId });
  } catch (error) {
    console.error("處理列印請求時出錯:", error);
    res
      .status(500)
      .json({ error: error.message || "處理列印請求時出現未知錯誤" });
  }
}
