import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  // 只允許 POST 方法
  if (req.method !== "POST") {
    return res.status(405).json({ message: "方法不被允許" });
  }

  const { action, code, refreshToken } = req.body;

  try {
    const client = await clientPromise;
    const db = client.db();
    const epsonCollection = db.collection("epson_printers");

    // 根據不同操作處理不同的邏輯
    if (action === "saveAuthCode") {
      // 保存授權碼
      await epsonCollection.updateOne(
        { key: "epson_auth" },
        { $set: { authorizationCode: code, updatedAt: new Date() } },
        { upsert: true }
      );

      return res.status(200).json({ message: "授權碼已保存" });
    } else if (action === "saveTokens") {
      // 保存 access_token 和 refresh_token
      const { accessToken, refreshToken, expiresIn } = req.body;
      await epsonCollection.updateOne(
        { key: "epson_auth" },
        {
          $set: {
            accessToken,
            refreshToken,
            expiresIn,
            tokenCreatedAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      return res.status(200).json({ message: "令牌已保存" });
    } else if (action === "getTokens") {
      // 獲取保存的令牌
      const tokenData = await epsonCollection.findOne({ key: "epson_auth" });

      if (!tokenData || !tokenData.refreshToken) {
        return res.status(404).json({ message: "找不到令牌，請先完成授權" });
      }

      return res.status(200).json({
        refreshToken: tokenData.refreshToken,
        accessToken: tokenData.accessToken,
        tokenCreatedAt: tokenData.tokenCreatedAt,
      });
    } else {
      return res.status(400).json({ message: "無效的操作" });
    }
  } catch (error) {
    console.error("Epson Token API 錯誤:", error);
    return res
      .status(500)
      .json({ message: "伺服器錯誤", error: error.message });
  }
}
