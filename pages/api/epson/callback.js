/**
 * Epson 授權回調處理
 * 接收授權碼並將用戶重定向回授權頁面
 */

export default function handler(req, res) {
  // 獲取 URL 參數
  const { code, state, error, error_description } = req.query;

  console.log("收到 Epson 授權回調");

  // 檢查錯誤
  if (error) {
    console.error(`授權錯誤: ${error} - ${error_description || "無描述"}`);
    return res.redirect(
      `/epson-auth?error=${encodeURIComponent(
        error
      )}&error_description=${encodeURIComponent(error_description || "")}`
    );
  }

  // 檢查授權碼
  if (!code) {
    console.error("回調中缺少授權碼");
    return res.redirect(
      "/epson-auth?error=missing_code&error_description=回調中缺少授權碼"
    );
  }

  console.log(`成功獲取授權碼: ${code.substring(0, 6)}...`);

  // 將用戶重定向回授權頁面，並附加授權碼
  return res.redirect(`/epson-auth?code=${encodeURIComponent(code)}`);
}
