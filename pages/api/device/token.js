/**
 * 設備Token API端點
 * 處理設備Token的獲取、刷新和存儲
 */
import deviceDbService from "../../../services/deviceDbService";

// 設置環境變量
const EPSON_AUTH_URL = "https://auth.epsonconnect.com/auth/token";
const EPSON_CLIENT_ID = process.env.EPSON_CLIENT_ID;
const EPSON_CLIENT_SECRET = process.env.EPSON_CLIENT_SECRET;
const EPSON_API_KEY = process.env.EPSON_API_KEY;

/**
 * 使用refresh token獲取新的access token
 * @param {string} refreshToken refresh token
 * @returns {Promise<Object>} token信息
 */
async function refreshDeviceToken(refreshToken) {
  try {
    // 準備Basic Auth憑證
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
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("刷新設備token失敗:", errorText);
      throw new Error(`刷新設備token失敗: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("刷新設備token時出錯:", error);
    throw error;
  }
}

/**
 * 獲取設備token
 * 如果access token已過期，則嘗試使用refresh token獲取新的access token
 * @param {string} deviceId 設備ID
 * @returns {Promise<Object>} token信息
 */
async function getValidToken(deviceId) {
  // 從數據庫獲取設備信息
  const device = deviceDbService.getDevice(deviceId);

  if (!device) {
    throw new Error("設備未找到");
  }

  // 檢查access token是否存在且未過期
  if (device.accessToken && device.tokenExpiration) {
    const expiration = new Date(device.tokenExpiration);

    // 如果token還有效（加10秒的buffer），則直接返回
    if (expiration > new Date(Date.now() + 10000)) {
      return {
        access_token: device.accessToken,
        refresh_token: device.refreshToken,
        expires_in: Math.floor((expiration - Date.now()) / 1000),
      };
    }
  }

  // 如果token不存在或已過期，則使用refresh token獲取新的token
  if (!device.refreshToken) {
    throw new Error("設備缺少refresh token，無法刷新");
  }

  // 刷新token
  const tokenInfo = await refreshDeviceToken(device.refreshToken);

  // 更新數據庫中的token信息
  deviceDbService.updateDeviceToken(
    deviceId,
    tokenInfo.refresh_token,
    tokenInfo.access_token,
    tokenInfo.expires_in
  );

  return tokenInfo;
}

export default async function handler(req, res) {
  // 只允許POST和GET請求
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "方法不允許" });
  }

  // 處理POST請求 - 保存設備信息和token
  if (req.method === "POST") {
    try {
      const { deviceId, accessToken, refreshToken, deviceInfo } = req.body;

      if (!deviceId || !refreshToken) {
        return res.status(400).json({ error: "缺少必要參數" });
      }

      // 計算token過期時間
      const expiresIn = req.body.expiresIn || 3600;

      // 保存設備信息
      const deviceData = {
        deviceId,
        refreshToken,
        accessToken,
        ...deviceInfo,
      };

      const success = deviceDbService.saveDevice(deviceData);

      if (expiresIn && accessToken) {
        deviceDbService.updateDeviceToken(
          deviceId,
          refreshToken,
          accessToken,
          expiresIn
        );
      }

      if (!success) {
        return res.status(500).json({ error: "保存設備信息失敗" });
      }

      return res.status(200).json({ success: true, message: "設備信息已保存" });
    } catch (error) {
      console.error("處理設備token請求時出錯:", error);
      return res
        .status(500)
        .json({ error: error.message || "處理請求時出現未知錯誤" });
    }
  }

  // 處理GET請求 - 獲取設備token
  if (req.method === "GET") {
    try {
      const { deviceId } = req.query;

      if (!deviceId) {
        return res.status(400).json({ error: "缺少設備ID" });
      }

      const tokenInfo = await getValidToken(deviceId);
      return res.status(200).json(tokenInfo);
    } catch (error) {
      console.error("獲取設備token時出錯:", error);
      return res
        .status(500)
        .json({ error: error.message || "獲取設備token時出現未知錯誤" });
    }
  }
}
