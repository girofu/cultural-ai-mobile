# 在地人 AI 導覽系統

## Epson Connect API 列印功能實現

使用 Epson Connect API V2 實現學習單列印功能

### 功能說明

- **sheet.js 頁面的立即列印按鈕** - 將學習單內容轉換為 PDF 並發送到 Epson 印表機進行列印
- **只列印 top line 以下的內容** - 使用 DOM 操作選擇只有內容區域的元素進行列印
- **使用 html2pdf.js** - 將 HTML 內容轉換為 PDF
- **通過 API 路由保護敏感認證信息** - 前端只向後端發送 PDF 數據，由後端處理 Epson API 認證和列印請求

### 技術實現

1. **客戶端**

   - 使用 React 元素轉換為 PDF
   - 通過 Base64 編碼傳輸 PDF 數據到後端
   - 顯示列印狀態和結果提示

2. **伺服器端**
   - 實現 API 路由處理列印請求
   - 使用 Epson Connect API V2 進行認證和列印操作
   - 保護 API 密鑰和認證憑證

### 環境變數設定

請在 `.env.local` 文件中設定以下環境變數：

```
# Epson Connect API 配置
EPSON_API_KEY=您的API金鑰
EPSON_CLIENT_ID=您的客戶端ID
EPSON_CLIENT_SECRET=您的客戶端密鑰

# 客戶端可存取的環境變數
NEXT_PUBLIC_EPSON_API_KEY=您的API金鑰
```

### 列印流程

1. 用戶點擊"立刻列印"按鈕
2. 系統複製 top line 以下的內容，並添加適當的樣式
3. 使用 html2pdf.js 將內容轉換為 PDF
4. 將 PDF 編碼為 Base64 並發送到後端 API
5. 後端 API 使用 Epson Connect API 認證並發送列印請求
6. 系統顯示列印結果提示訊息
