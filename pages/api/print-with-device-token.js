/**
 * 使用設備令牌進行打印測試
 * 這個端點首先獲取設備令牌，然後嘗試使用該令牌創建打印作業
 */
import fetch from "node-fetch";

// Epson API 認證資訊
const EPSON_API_BASE_URL = "https://api.epsonconnect.com/api/2";
const EPSON_AUTH_URL = "https://auth.epsonconnect.com/auth/token";
const EPSON_API_KEY = process.env.EPSON_API_KEY;
const EPSON_CLIENT_ID = process.env.EPSON_CLIENT_ID;
const EPSON_CLIENT_SECRET = process.env.EPSON_CLIENT_SECRET;
const AUTHORIZATION_CODE = process.env.AUTHORIZATION_CODE;
// 重定向 URI，必須與獲取授權碼時使用的一致
const REDIRECT_URI =
  "https://b434dbd7-5e2c-45e3-a9d3-09780f6e9609-00-2c25mmmhy11eb.pike.replit.dev/";

export default async function handler(req, res) {
  // 只允許 GET 請求
  if (req.method !== "GET") {
    return res.status(405).json({ error: "方法不允許" });
  }

  try {
    console.log("測試 - 使用設備令牌進行打印");

    // 步驟1: 獲取設備令牌
    console.log("步驟1: 獲取設備令牌");
    const token = await getDeviceToken();
    console.log("成功獲取設備令牌");

    // 步驟2: 使用設備令牌嘗試建立打印作業
    console.log("步驟2: 使用設備令牌建立打印作業");
    const jobId = await createPrintJob(token);
    console.log("成功建立打印作業, ID:", jobId);

    // 回傳成功訊息
    res.status(200).json({
      success: true,
      message: "使用設備令牌成功建立打印作業",
      job_id: jobId,
    });
  } catch (error) {
    console.error("使用設備令牌進行打印測試時出錯:", error);

    // 回傳錯誤訊息
    res.status(500).json({
      error: "使用設備令牌進行打印測試失敗",
      message: error.message,
    });
  }
}

/**
 * 獲取設備令牌
 * @returns {Promise<string>} 設備令牌
 */
async function getDeviceToken() {
  try {
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
        code: AUTHORIZATION_CODE,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("獲取設備令牌失敗:", errorData);
      throw new Error(`獲取設備令牌失敗: ${errorData}`);
    }

    const data = await response.json();
    return data.access_token;
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
    console.log("設備令牌:", token.substring(0, 10) + "...");

    const response = await fetch(`${EPSON_API_BASE_URL}/printing/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-api-key": EPSON_API_KEY,
      },
      body: JSON.stringify({
        job_name: "測試作業",
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

    const responseText = await response.text();

    if (!response.ok) {
      console.error("創建打印作業失敗:", responseText);
      throw new Error(`創建打印作業失敗: ${responseText}`);
    }

    try {
      const data = JSON.parse(responseText);
      return data.id;
    } catch (parseError) {
      console.error("解析回應失敗:", parseError);
      throw new Error(`解析回應失敗: ${responseText}`);
    }
  } catch (error) {
    console.error("創建打印作業時出錯:", error);
    throw error;
  }
}
