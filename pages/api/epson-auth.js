import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  // 只允許 POST 方法
  if (req.method !== "POST") {
    return res.status(405).json({ message: "方法不被允許" });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "缺少必要參數：授權碼" });
    }

    // 獲取環境變數
    const clientId = process.env.EPSON_CLIENT_ID;
    const clientSecret = process.env.EPSON_CLIENT_SECRET;
    const redirectUri = process.env.REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({ error: "缺少必要的環境變數設定" });
    }

    // 使用授權碼獲取token
    const tokenResponse = await fetch(
      "https://auth.epsonconnect.com/auth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}`,
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return res
        .status(tokenResponse.status)
        .json({ error: errorData.error || "獲取Token失敗" });
    }

    const tokenData = await tokenResponse.json();

    // 保存令牌到資料庫
    const client = await clientPromise;
    const db = client.db();
    const epsonCollection = db.collection("epson_printers");

    await epsonCollection.updateOne(
      { key: "epson_auth" },
      {
        $set: {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
          tokenCreatedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // 返回token數據
    return res.status(200).json(tokenData);
  } catch (error) {
    console.error("處理Epson授權時發生錯誤:", error);
    return res
      .status(500)
      .json({ error: "伺服器錯誤", message: error.message });
  }
}
