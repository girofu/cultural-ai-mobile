/**
 * Epson API 令牌刷新路由
 * 通過刷新令牌獲取新的設備令牌
 */
import fetch from "node-fetch";

// Epson API 認證信息
const EPSON_AUTH_URL = "https://auth.epsonconnect.com/auth/token";
const EPSON_API_KEY = process.env.EPSON_API_KEY;
const EPSON_CLIENT_ID = process.env.EPSON_CLIENT_ID;
const EPSON_CLIENT_SECRET = process.env.EPSON_CLIENT_SECRET;

export default async function handler(req, res) {
  console.log("收到令牌刷新請求");

  // 只允許 POST 請求
  if (req.method !== "POST") {
    return res.status(405).json({ error: "方法不允許" });
  }

  // 檢查必要參數
  if (!req.body) {
    console.error("缺少請求主體");
    return res.status(400).json({ error: "缺少請求主體" });
  }

  const { refreshToken } = req.body;

  if (!refreshToken) {
    console.error("缺少刷新令牌");
    return res.status(400).json({ error: "缺少刷新令牌" });
  }

  // 檢查環境變量
  if (!EPSON_API_KEY || !EPSON_CLIENT_ID || !EPSON_CLIENT_SECRET) {
    console.error("缺少 Epson API 環境變量");
    return res
      .status(500)
      .json({ error: "伺服器配置錯誤: 缺少 Epson API 環境變量" });
  }

  try {
    console.log("開始刷新設備令牌...");

    // 準備 Basic Auth 憑據
    const credentials = Buffer.from(
      `${EPSON_CLIENT_ID}:${EPSON_CLIENT_SECRET}`
    ).toString("base64");

    // 發送請求以刷新設備令牌
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

    // 獲取響應內容
    const responseText = await response.text();

    if (!response.ok) {
      console.error("刷新設備令牌失敗:", responseText);
      return res.status(response.status).json({
        error: `刷新設備令牌失敗: ${responseText}`,
      });
    }

    try {
      // 解析 JSON 響應
      const tokenData = JSON.parse(responseText);
      console.log("成功刷新設備令牌");

      // 返回成功響應
      return res.status(200).json(tokenData);
    } catch (parseError) {
      console.error("解析響應失敗:", parseError);
      return res.status(500).json({
        error: `解析響應失敗: ${responseText}`,
      });
    }
  } catch (error) {
    console.error("處理令牌刷新請求時出錯:", error);
    return res.status(500).json({
      error: error.message || "處理令牌刷新請求時出現未知錯誤",
    });
  }
}
