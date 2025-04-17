/**
 * 獲取 Epson 印表機資訊 API
 * 實現兩種獲取令牌的方法：
 * 1. 應用程序令牌：使用 Basic Auth 和 grant_type=client_credentials
 * 2. 設備令牌：使用授權碼流程和 redirect_uri
 */
import fetch from "node-fetch";

// Epson API 認證資訊
const EPSON_AUTH_URL = "https://auth.epsonconnect.com/auth/token";
const EPSON_API_BASE_URL = "https://api.epsonconnect.com/api/2";
const EPSON_API_KEY = process.env.EPSON_API_KEY;
const EPSON_CLIENT_ID = process.env.EPSON_CLIENT_ID;
const EPSON_CLIENT_SECRET = process.env.EPSON_CLIENT_SECRET;

export default async function handler(req, res) {
  // 只允許 POST 請求
  if (req.method !== "POST") {
    return res.status(405).json({ error: "方法不允許" });
  }

  try {
    const { action, authorizationCode, redirectUri } = req.body;

    // 檢查所有必要的環境變數是否存在
    if (!EPSON_API_KEY || !EPSON_CLIENT_ID || !EPSON_CLIENT_SECRET) {
      throw new Error("缺少 Epson API 認證資訊");
    }

    // 根據請求的操作類型執行不同的功能
    switch (action) {
      case "getApplicationToken":
        // 獲取應用程序令牌
        return await getApplicationToken(res);

      case "getDeviceToken":
        // 檢查必要的參數
        if (!authorizationCode || !redirectUri) {
          return res.status(400).json({
            error: "缺少必要參數",
            requiredParams: ["authorizationCode", "redirectUri"],
          });
        }

        // 獲取設備令牌
        return await getDeviceToken(res, authorizationCode, redirectUri);

      case "getPrinterInfo":
        // 檢查必要的參數
        if (!req.body.deviceToken) {
          return res.status(400).json({
            error: "缺少必要參數",
            requiredParams: ["deviceToken"],
          });
        }

        // 獲取印表機資訊
        return await getPrinterInfo(res, req.body.deviceToken);

      default:
        return res.status(400).json({
          error: "無效的操作類型",
          validActions: [
            "getApplicationToken",
            "getDeviceToken",
            "getPrinterInfo",
          ],
        });
    }
  } catch (error) {
    console.error("處理請求時出錯:", error);

    // 回傳錯誤訊息
    res.status(500).json({
      error: "處理請求失敗",
      message: error.message,
    });
  }
}

/**
 * 獲取應用程序令牌
 * 使用 client_credentials 授權類型
 */
async function getApplicationToken(res) {
  console.log("獲取應用程序令牌");

  try {
    // 準備 Basic Auth 憑證
    const credentials = Buffer.from(
      `${EPSON_CLIENT_ID}:${EPSON_CLIENT_SECRET}`
    ).toString("base64");

    // 發送獲取令牌請求
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

    // 記錄請求資訊，用於調試
    console.log("應用程序令牌請求資訊:", {
      url: EPSON_AUTH_URL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic [已隱藏]",
        "x-api-key": "[已隱藏]",
      },
      body: {
        grant_type: "client_credentials",
      },
    });

    // 獲取回應數據
    const responseText = await response.text();
    console.log("應用程序令牌回應狀態:", response.status);
    console.log("應用程序令牌回應內容:", responseText);

    // 檢查回應狀態
    if (!response.ok) {
      console.error("獲取應用程序令牌失敗:", responseText);
      return res.status(response.status).json({
        error: "獲取應用程序令牌失敗",
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
      });
    }

    // 解析 JSON
    const data = JSON.parse(responseText);

    // 回傳成功訊息和令牌資訊
    return res.status(200).json({
      success: true,
      message: "成功獲取應用程序令牌",
      tokenInfo: {
        token_type: data.token_type,
        access_token: data.access_token,
        expires_in: data.expires_in,
      },
    });
  } catch (error) {
    console.error("獲取應用程序令牌時出錯:", error);
    throw error;
  }
}

/**
 * 獲取設備令牌
 * 使用授權碼流程
 */
async function getDeviceToken(res, authorizationCode, redirectUri) {
  console.log("獲取設備令牌");
  console.log("授權碼:", authorizationCode);
  console.log("重定向 URI:", redirectUri);

  try {
    // 準備 Basic Auth 憑證
    const credentials = Buffer.from(
      `${EPSON_CLIENT_ID}:${EPSON_CLIENT_SECRET}`
    ).toString("base64");

    // 發送獲取設備令牌請求
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
        redirect_uri: redirectUri,
      }),
    });

    // 記錄請求資訊，用於調試
    console.log("設備令牌請求資訊:", {
      url: EPSON_AUTH_URL,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic [已隱藏]",
        "x-api-key": "[已隱藏]",
      },
      body: {
        grant_type: "authorization_code",
        code: "[已隱藏]",
        redirect_uri: redirectUri,
      },
    });

    // 獲取回應數據
    const responseText = await response.text();
    console.log("設備令牌回應狀態:", response.status);
    console.log("設備令牌回應內容:", responseText);

    // 檢查回應狀態
    if (!response.ok) {
      console.error("獲取設備令牌失敗:", responseText);
      return res.status(response.status).json({
        error: "獲取設備令牌失敗",
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
        note: "請注意，授權碼只能使用一次，且有效期很短。如果失敗，請嘗試獲取新的授權碼。",
      });
    }

    // 解析 JSON
    const data = JSON.parse(responseText);

    // 回傳成功訊息和令牌資訊
    return res.status(200).json({
      success: true,
      message: "成功獲取設備令牌",
      tokenInfo: {
        token_type: data.token_type,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      },
    });
  } catch (error) {
    console.error("獲取設備令牌時出錯:", error);
    throw error;
  }
}

/**
 * 獲取印表機資訊
 * 使用設備令牌獲取印表機資訊
 */
async function getPrinterInfo(res, deviceToken) {
  console.log("獲取印表機資訊");

  try {
    // 檢查和清理令牌
    const cleanToken = deviceToken.trim();

    // 檢查令牌格式
    if (cleanToken.length < 10) {
      throw new Error("設備令牌格式不正確或為空");
    } else {
      console.log("令牌格式正常");
      console.log(`使用的設備令牌長度: ${cleanToken.length}`);
      console.log(
        `請求標頭 Authorization 值: Bearer ${cleanToken.substring(0, 5)}...`
      );
      console.log(`請求標頭 x-api-key 值: ${EPSON_API_KEY.substring(0, 5)}...`);
    }

    // 發送請求到 Epson API
    const options = {
      url: "https://api.epsonconnect.com/api/2/printing/devices/info",
      method: "GET",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "x-api-key": EPSON_API_KEY,
      },
    };

    // 發送請求
    const response = await fetch(options.url, {
      method: options.method,
      headers: options.headers,
    });

    // 記錄請求資訊（不顯示敏感信息）
    console.log("印表機資訊請求資訊:", {
      url: options.url,
      method: options.method,
      headers: {
        Authorization: "Bearer [已隱藏]",
        "x-api-key": "[已隱藏]",
      },
    });

    // 獲取回應數據
    const responseText = await response.text();
    console.log("印表機資訊回應狀態:", response.status);
    console.log("印表機資訊回應內容:", responseText);

    // 檢查回應狀態
    if (!response.ok) {
      console.error("獲取印表機資訊失敗:", responseText);

      // 如果是未授權錯誤，提供更明確的建議
      if (response.status === 401) {
        return res.status(response.status).json({
          error: "獲取印表機資訊失敗",
          status: response.status,
          statusText: response.statusText,
          responseBody: responseText,
          note: "設備令牌可能已過期或無效。請嘗試重新獲取新的設備令牌。",
        });
      }

      return res.status(response.status).json({
        error: "獲取印表機資訊失敗",
        status: response.status,
        statusText: response.statusText,
        responseBody: responseText,
      });
    }

    // 解析 JSON
    const data = JSON.parse(responseText);

    // 回傳成功訊息和印表機資訊
    return res.status(200).json({
      success: true,
      message: "成功獲取印表機資訊",
      printerInfo: data,
    });
  } catch (error) {
    console.error("獲取印表機資訊時出錯:", error);
    throw error;
  }
}
