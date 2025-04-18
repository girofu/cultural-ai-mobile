import clientPromise from "../../lib/mongodb";
import htmlPdf from "html-pdf-node";
import fetch from "node-fetch";

// 錯誤代碼和訊息對應表
const ERROR_CODES = {
  ENV_MISSING: "EPSON_ERR_001",
  TOKEN_MISSING: "EPSON_ERR_002",
  TOKEN_REFRESH_FAILED: "EPSON_ERR_003",
  DEVICE_INFO_FAILED: "EPSON_ERR_004",
  PRINTER_OFFLINE: "EPSON_ERR_005",
  CAPABILITY_FAILED: "EPSON_ERR_006",
  JOB_CREATE_FAILED: "EPSON_ERR_007",
  UPLOAD_FAILED: "EPSON_ERR_008",
  PRINT_FAILED: "EPSON_ERR_009",
  PRINT_SETTINGS_INVALID: "EPSON_ERR_010",
  PDF_GENERATION_FAILED: "EPSON_ERR_011",
  SERVER_ERROR: "EPSON_ERR_999",
};

/**
 * 根據印表機能力優化列印設定
 * @param {Object} capability - 印表機支援的能力
 * @param {Object} settings - 原始列印設定
 * @returns {Object} 優化後的列印設定
 */
const optimizePrintSettings = (capability, settings) => {
  // 創建新的設定物件，以免修改原始設定
  const optimizedSettings = { ...settings };
  let adjustments = [];

  // 檢查紙張大小
  const supportedPaperSize = capability.paperSizes.find(
    (p) => p.paperSize === settings.paperSize
  );

  if (!supportedPaperSize) {
    // 如果不支援指定的紙張大小，選擇第一個可用的
    if (capability.paperSizes.length > 0) {
      optimizedSettings.paperSize = capability.paperSizes[0].paperSize;
      adjustments.push(
        `紙張大小從 ${settings.paperSize} 調整為 ${optimizedSettings.paperSize}`
      );
    } else {
      throw new Error("印表機不支援任何紙張大小");
    }
  }

  // 獲取當前紙張大小的紙張類型選項
  const paperSizeObj = capability.paperSizes.find(
    (p) => p.paperSize === optimizedSettings.paperSize
  );

  // 檢查紙張類型
  if (paperSizeObj) {
    const supportedPaperType = paperSizeObj.paperTypes.find(
      (t) => t.paperType === settings.paperType
    );

    if (!supportedPaperType) {
      // 如果不支援指定的紙張類型，選擇第一個可用的
      if (paperSizeObj.paperTypes.length > 0) {
        optimizedSettings.paperType = paperSizeObj.paperTypes[0].paperType;
        adjustments.push(
          `紙張類型從 ${settings.paperType} 調整為 ${optimizedSettings.paperType}`
        );
      } else {
        throw new Error("所選紙張大小不支援任何紙張類型");
      }
    }

    // 獲取當前紙張類型的所有選項
    const paperTypeObj = paperSizeObj.paperTypes.find(
      (t) => t.paperType === optimizedSettings.paperType
    );

    if (paperTypeObj) {
      // 檢查無邊框列印
      if (
        settings.borderless !== undefined &&
        settings.borderless !== paperTypeObj.borderless
      ) {
        optimizedSettings.borderless = paperTypeObj.borderless;
        adjustments.push(
          `無邊框設定從 ${settings.borderless} 調整為 ${optimizedSettings.borderless}`
        );
      }

      // 檢查紙張來源
      if (
        settings.paperSource &&
        !paperTypeObj.paperSources.includes(settings.paperSource)
      ) {
        // 如果不支援指定的紙張來源，選擇第一個可用的
        if (paperTypeObj.paperSources.length > 0) {
          optimizedSettings.paperSource = paperTypeObj.paperSources[0];
          adjustments.push(
            `紙張來源從 ${settings.paperSource} 調整為 ${optimizedSettings.paperSource}`
          );
        }
      }

      // 檢查列印品質
      if (
        settings.printQuality &&
        !paperTypeObj.printQualities.includes(settings.printQuality)
      ) {
        // 如果不支援指定的列印品質，選擇第一個可用的
        if (paperTypeObj.printQualities.length > 0) {
          optimizedSettings.printQuality = paperTypeObj.printQualities[0];
          adjustments.push(
            `列印品質從 ${settings.printQuality} 調整為 ${optimizedSettings.printQuality}`
          );
        }
      }

      // 檢查雙面列印
      if (settings.doubleSided !== "none" && !paperTypeObj.doubleSided) {
        optimizedSettings.doubleSided = "none";
        adjustments.push(
          `雙面列印從 ${settings.doubleSided} 調整為 none（不支援雙面列印）`
        );
      }
    }
  }

  // 檢查顏色模式
  if (
    settings.colorMode &&
    !capability.colorModes.includes(settings.colorMode)
  ) {
    // 如果不支援指定的顏色模式，選擇第一個可用的
    if (capability.colorModes.length > 0) {
      optimizedSettings.colorMode = capability.colorModes[0];
      adjustments.push(
        `顏色模式從 ${settings.colorMode} 調整為 ${optimizedSettings.colorMode}`
      );
    }
  }

  // 檢查複印數量（如果存在）
  if (settings.copies && (settings.copies < 1 || settings.copies > 99)) {
    optimizedSettings.copies = Math.max(1, Math.min(99, settings.copies));
    adjustments.push(
      `複印數量從 ${settings.copies} 調整為 ${optimizedSettings.copies}`
    );
  }

  return { optimizedSettings, adjustments };
};

/**
 * 使用 html-pdf-node 生成 PDF
 * @param {string} pageUrl - 要生成 PDF 的頁面 URL
 * @returns {Promise<Buffer>} PDF 的 Buffer 數據
 */
const generatePdf = async (pageUrl) => {
  const options = {
    format: "A4",
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px",
    },
    printBackground: true,
    preferCSSPageSize: true,
  };

  const file = { url: pageUrl };

  return new Promise((resolve, reject) => {
    htmlPdf
      .generatePdf(file, options)
      .then((pdfBuffer) => {
        resolve(pdfBuffer);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export default async function handler(req, res) {
  // 用於記錄整個列印過程的日誌
  const printLog = {
    startTime: new Date().toISOString(),
    stages: [],
    status: "pending",
    errorCode: null,
    errorMessage: null,
    jobId: null,
    deviceInfo: null,
    printSettings: null,
    printSettingsAdjustments: [],
  };

  // 記錄階段日誌的函數
  const logStage = (stageName, status, details = null) => {
    console.log(`[${new Date().toISOString()}] ${stageName}: ${status}`);
    printLog.stages.push({
      name: stageName,
      time: new Date().toISOString(),
      status,
      details,
    });
  };

  // 記錄錯誤的函數
  const logError = (stageName, code, message, details = null) => {
    const fullMessage = `${code}: ${message}`;
    console.error(
      `[${new Date().toISOString()}] ${stageName} 錯誤: ${fullMessage}`,
      details
    );
    printLog.status = "error";
    printLog.errorCode = code;
    printLog.errorMessage = message;
    printLog.stages.push({
      name: stageName,
      time: new Date().toISOString(),
      status: "error",
      error: { code, message, details },
    });
  };

  // 只允許 POST 方法
  if (req.method !== "POST") {
    logError("請求驗證", "METHOD_NOT_ALLOWED", "方法不被允許");
    return res.status(405).json({
      message: "方法不被允許",
      printLog,
    });
  }

  try {
    logStage("開始處理", "初始化列印請求");

    // 檢查是否為 Demo 模式
    const { isDemo, templatePath, pageUrl } = req.body;

    if (isDemo) {
      logStage("模式檢查", "啟用 Demo 模式", { templatePath });
    }

    // 獲取環境變數
    const apiKey = process.env.EPSON_API_KEY;
    const clientId = process.env.EPSON_CLIENT_ID;
    const clientSecret = process.env.EPSON_CLIENT_SECRET;

    if (!apiKey || !clientId || !clientSecret) {
      logError("環境檢查", ERROR_CODES.ENV_MISSING, "缺少必要的環境變數設定");
      return res.status(500).json({
        error: "缺少必要的環境變數設定",
        code: ERROR_CODES.ENV_MISSING,
        printLog,
      });
    }

    logStage("環境檢查", "環境變數檢查完成");

    // 從數據庫獲取最新的 refresh token
    logStage("Token 獲取", "正在從資料庫獲取 Refresh Token");
    const client = await clientPromise;
    const db = client.db();
    const epsonCollection = db.collection("epson_printers");
    const tokenData = await epsonCollection.findOne({ key: "epson_auth" });

    if (!tokenData || !tokenData.refreshToken) {
      logError(
        "Token 獲取",
        ERROR_CODES.TOKEN_MISSING,
        "找不到 refresh token，請先完成授權流程"
      );
      return res.status(404).json({
        error: "找不到 refresh token，請先完成授權流程",
        code: ERROR_CODES.TOKEN_MISSING,
        printLog,
      });
    }

    // 使用 refresh token 獲取新的 access token
    logStage("Token 刷新", "正在使用 Refresh Token 獲取新的 Access Token");
    const refreshResponse = await fetch(
      "https://auth.epsonconnect.com/auth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
        body: `grant_type=refresh_token&refresh_token=${tokenData.refreshToken}`,
      }
    );

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.json();
      logError(
        "Token 刷新",
        ERROR_CODES.TOKEN_REFRESH_FAILED,
        errorData.error || "刷新 token 失敗",
        { status: refreshResponse.status, response: errorData }
      );
      return res.status(refreshResponse.status).json({
        error: errorData.error || "刷新 token 失敗",
        code: ERROR_CODES.TOKEN_REFRESH_FAILED,
        printLog,
      });
    }

    const refreshedTokens = await refreshResponse.json();
    const accessToken = refreshedTokens.access_token;
    const newRefreshToken = refreshedTokens.refresh_token;
    logStage("Token 刷新", "成功獲取新的 Access Token");

    // 更新數據庫中的 token
    logStage("Token 更新", "正在更新資料庫中的 Token");
    await epsonCollection.updateOne(
      { key: "epson_auth" },
      {
        $set: {
          accessToken: accessToken,
          refreshToken: newRefreshToken,
          expiresIn: refreshedTokens.expires_in,
          tokenCreatedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );
    logStage("Token 更新", "成功更新資料庫中的 Token");

    // 獲取設備信息
    logStage("設備資訊", "正在獲取印表機設備資訊");
    const deviceInfoResponse = await fetch(
      "https://api.epsonconnect.com/api/2/printing/devices/info",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": apiKey,
        },
      }
    );

    if (!deviceInfoResponse.ok) {
      const errorData = await deviceInfoResponse.json();
      logError(
        "設備資訊",
        ERROR_CODES.DEVICE_INFO_FAILED,
        errorData.error || "獲取設備信息失敗",
        { status: deviceInfoResponse.status, response: errorData }
      );
      return res.status(deviceInfoResponse.status).json({
        error: errorData.error || "獲取設備信息失敗",
        code: ERROR_CODES.DEVICE_INFO_FAILED,
        printLog,
      });
    }

    const deviceInfo = await deviceInfoResponse.json();
    printLog.deviceInfo = {
      productName: deviceInfo.productName,
      serialNumber: deviceInfo.serialNumber,
      connected: deviceInfo.connected,
    };
    logStage("設備資訊", "成功獲取印表機設備資訊", {
      deviceName: deviceInfo.productName,
    });

    // 如果印表機未連線
    if (!deviceInfo.connected) {
      logError(
        "設備連線",
        ERROR_CODES.PRINTER_OFFLINE,
        "印表機未連線，請確認印表機狀態"
      );
      return res.status(400).json({
        error: "印表機未連線，請確認印表機狀態",
        code: ERROR_CODES.PRINTER_OFFLINE,
        printLog,
      });
    }
    logStage("設備連線", "印表機已連線");

    // 獲取印表機能力
    logStage("印表機能力", "正在獲取印表機列印能力");
    const capabilityResponse = await fetch(
      "https://api.epsonconnect.com/api/2/printing/capability/document",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": apiKey,
        },
      }
    );

    if (!capabilityResponse.ok) {
      const errorData = await capabilityResponse.json();
      logError(
        "印表機能力",
        ERROR_CODES.CAPABILITY_FAILED,
        errorData.error || "獲取印表機能力失敗",
        { status: capabilityResponse.status, response: errorData }
      );
      return res.status(capabilityResponse.status).json({
        error: errorData.error || "獲取印表機能力失敗",
        code: ERROR_CODES.CAPABILITY_FAILED,
        printLog,
      });
    }

    const printerCapability = await capabilityResponse.json();
    logStage("印表機能力", "成功獲取印表機列印能力", {
      supportedSizes: printerCapability.paperSizes.map(
        (size) => size.paperSize
      ),
      supportedColors: printerCapability.colorModes,
    });

    // 定義默認列印設定
    const defaultPrintSettings = {
      paperSize: "ps_a4",
      paperType: "pt_plainpaper",
      borderless: false,
      printQuality: "normal",
      paperSource: "auto",
      colorMode: "color",
      doubleSided: "none",
      reverseOrder: false,
      copies: 1,
      collate: true,
    };

    // 根據印表機能力優化列印設定
    logStage("設定優化", "正在根據印表機能力優化列印設定");
    let printSettings;
    let settingsAdjustments = [];

    try {
      const result = optimizePrintSettings(
        printerCapability,
        defaultPrintSettings
      );
      printSettings = result.optimizedSettings;
      settingsAdjustments = result.adjustments;

      // 將優化後的設定和調整記錄到日誌
      printLog.printSettings = printSettings;
      printLog.printSettingsAdjustments = settingsAdjustments;

      if (settingsAdjustments.length > 0) {
        logStage("設定優化", "列印設定已根據印表機能力進行調整", {
          adjustments: settingsAdjustments,
        });
      } else {
        logStage("設定優化", "列印設定符合印表機能力，無需調整");
      }
    } catch (error) {
      logError(
        "設定優化",
        ERROR_CODES.PRINT_SETTINGS_INVALID,
        error.message || "無法創建有效的列印設定",
        { originalSettings: defaultPrintSettings }
      );
      return res.status(400).json({
        error: error.message || "無法創建有效的列印設定",
        code: ERROR_CODES.PRINT_SETTINGS_INVALID,
        printLog,
      });
    }

    // 創建列印任務
    logStage("建立任務", "正在建立列印任務");
    const createJobResponse = await fetch(
      "https://api.epsonconnect.com/api/2/printing/jobs",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobName: "學習單",
          printMode: "document",
          printSettings: {
            paperSize: printSettings.paperSize || "ps_a4",
            paperType: printSettings.paperType || "pt_plainpaper",
            borderless: false,
            printQuality: printSettings.printQuality || "normal",
            paperSource: printSettings.paperSource || "auto",
            colorMode: printSettings.colorMode || "color",
            doubleSided: "none",
            reverseOrder: false,
            copies: 1,
            collate: true,
          },
        }),
      }
    );

    if (!createJobResponse.ok) {
      const errorData = await createJobResponse.json();
      logError(
        "建立任務",
        ERROR_CODES.JOB_CREATE_FAILED,
        errorData.error || "創建列印任務失敗",
        { status: createJobResponse.status, response: errorData }
      );
      return res.status(createJobResponse.status).json({
        error: errorData.error || "創建列印任務失敗",
        code: ERROR_CODES.JOB_CREATE_FAILED,
        printLog,
      });
    }

    const jobData = await createJobResponse.json();
    const jobId = jobData.jobId;
    const uploadUri = jobData.uploadUri;
    printLog.jobId = jobId;
    logStage("建立任務", "成功建立列印任務", { jobId });

    // 獲取 PDF 內容
    let pdfBuffer;

    if (isDemo && templatePath) {
      // Demo 模式：從公共文件夾讀取模板 PDF
      logStage("PDF獲取", "正在讀取 Demo 模板 PDF 文件");

      try {
        // 使用 Node.js 的 fs 模塊讀取文件
        const fs = require("fs");
        const path = require("path");

        // 構建模板文件的絕對路徑
        // public 文件夾映射到根目錄
        const publicPath = path.join(
          process.cwd(),
          "public",
          templatePath.replace(/^\//, "")
        );

        if (!fs.existsSync(publicPath)) {
          throw new Error(`找不到模板文件: ${publicPath}`);
        }

        pdfBuffer = fs.readFileSync(publicPath);
        logStage("PDF獲取", "成功讀取 Demo 模板 PDF 文件", {
          size: `${Math.round(pdfBuffer.length / 1024)} KB`,
          path: publicPath,
        });
      } catch (error) {
        logError(
          "PDF獲取",
          ERROR_CODES.PDF_GENERATION_FAILED,
          error.message || "讀取 Demo 模板 PDF 文件失敗",
          { stack: error.stack }
        );
        return res.status(500).json({
          error: "讀取 Demo 模板 PDF 文件失敗",
          message: error.message,
          code: ERROR_CODES.PDF_GENERATION_FAILED,
          printLog,
        });
      }
    } else {
      // 正常模式：使用 html-pdf-node 生成 PDF 文件
      if (!pageUrl) {
        logError(
          "PDF生成",
          ERROR_CODES.PDF_GENERATION_FAILED,
          "缺少頁面URL參數"
        );
        return res.status(400).json({
          error: "缺少頁面URL參數",
          code: ERROR_CODES.PDF_GENERATION_FAILED,
          printLog,
        });
      }

      logStage("PDF生成", "正在生成PDF文件");

      try {
        pdfBuffer = await generatePdf(pageUrl);
        logStage("PDF生成", "成功生成PDF文件", {
          size: `${Math.round(pdfBuffer.length / 1024)} KB`,
        });
      } catch (error) {
        logError(
          "PDF生成",
          ERROR_CODES.PDF_GENERATION_FAILED,
          error.message || "生成PDF文件失敗",
          { stack: error.stack }
        );
        return res.status(500).json({
          error: "生成PDF文件失敗",
          message: error.message,
          code: ERROR_CODES.PDF_GENERATION_FAILED,
          printLog,
        });
      }
    }

    // 上傳列印內容
    logStage("上傳內容", "正在上傳列印內容");

    // 確保上傳URI包含正確的File參數
    const finalUploadUri = uploadUri.includes("File=")
      ? uploadUri
      : `${uploadUri}${uploadUri.includes("?") ? "&" : "?"}File=1.pdf`;

    logStage("上傳內容", `使用URI: ${finalUploadUri}`);

    const uploadResponse = await fetch(finalUploadUri, {
      method: "POST",
      headers: {
        "Content-Type": "application/pdf",
      },
      body: pdfBuffer, // 使用獲取或生成的PDF文件
    });

    if (!uploadResponse.ok) {
      logError("上傳內容", ERROR_CODES.UPLOAD_FAILED, "上傳列印內容失敗", {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
      });
      return res.status(uploadResponse.status).json({
        error: "上傳列印內容失敗",
        code: ERROR_CODES.UPLOAD_FAILED,
        printLog,
      });
    }
    logStage("上傳內容", "成功上傳列印內容");

    // 執行列印
    logStage("執行列印", "正在發送列印命令");
    const printResponse = await fetch(
      `https://api.epsonconnect.com/api/2/printing/jobs/${jobId}/print`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": apiKey,
        },
      }
    );

    if (!printResponse.ok) {
      const errorData = await printResponse.json();
      logError(
        "執行列印",
        ERROR_CODES.PRINT_FAILED,
        errorData.error || "執行列印失敗",
        { status: printResponse.status, response: errorData }
      );
      return res.status(printResponse.status).json({
        error: errorData.error || "執行列印失敗",
        code: ERROR_CODES.PRINT_FAILED,
        printLog,
      });
    }
    logStage("執行列印", "列印命令已成功發送");

    // 更新列印日誌狀態
    printLog.status = "success";
    printLog.endTime = new Date().toISOString();
    logStage("列印完成", "列印流程全部完成");

    // 返回成功信息
    return res.status(200).json({
      message: "列印任務已成功提交",
      jobId,
      deviceInfo: {
        productName: deviceInfo.productName,
        serialNumber: deviceInfo.serialNumber,
      },
      printSettings: printSettings,
      settingsAdjustments:
        settingsAdjustments.length > 0 ? settingsAdjustments : null,
      printLog,
    });
  } catch (error) {
    logError(
      "系統錯誤",
      ERROR_CODES.SERVER_ERROR,
      error.message || "處理Epson列印時發生未知錯誤",
      { stack: error.stack }
    );

    // 更新列印日誌結束時間
    printLog.endTime = new Date().toISOString();

    console.error("處理Epson列印時發生錯誤:", error);
    return res.status(500).json({
      error: "伺服器錯誤",
      message: error.message,
      code: ERROR_CODES.SERVER_ERROR,
      printLog,
    });
  }
}
