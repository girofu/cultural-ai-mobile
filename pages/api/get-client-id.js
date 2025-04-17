/**
 * 獲取 Epson CLIENT_ID API
 * 安全地從伺服器端環境變數獲取 CLIENT_ID，用於授權 URL 生成
 */

export default async function handler(req, res) {
  // 只允許 GET 請求
  if (req.method !== "GET") {
    return res.status(405).json({ error: "方法不允許" });
  }

  try {
    // 從環境變數中獲取 CLIENT_ID
    const clientId = process.env.EPSON_CLIENT_ID;

    if (!clientId) {
      return res.status(500).json({ error: "未設置 EPSON_CLIENT_ID 環境變數" });
    }

    // 返回 CLIENT_ID
    res.status(200).json({ clientId });
  } catch (error) {
    console.error("獲取 CLIENT_ID 時出錯:", error);
    res
      .status(500)
      .json({ error: "獲取 CLIENT_ID 失敗", message: error.message });
  }
}
