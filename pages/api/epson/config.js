/**
 * Epson API 環境配置提供
 * 安全地向前端提供必要的 Epson API 配置
 */

export default function handler(req, res) {
  // 只接受 GET 請求
  if (req.method !== "GET") {
    return res.status(405).json({ error: "方法不允許" });
  }

  // 從環境變量中獲取配置
  const clientId = process.env.EPSON_CLIENT_ID || "";
  const redirectUri = process.env.REDIRECT_URI || "";

  // 記錄請求
  console.log("提供 Epson API 配置信息到前端");

  // 返回配置
  return res.status(200).json({
    clientId,
    redirectUri,
    // 注意：不要返回敏感資訊如 CLIENT_SECRET 和 API_KEY
  });
}
