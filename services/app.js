// 全局變數
let deviceToken = "";
let currentJobId = "";
let uploadUri = "";
let printCapability = null;
let tokenExpiration = null;

// 工具函數
function logMessage(message, isError = false) {
  const logContainer = $("#logContainer");
  const timestamp = new Date().toLocaleTimeString();
  const logClass = isError ? "text-danger" : "text-info";
  logContainer.prepend(
    `<div class="${logClass}">[${timestamp}] ${message}</div>`
  );
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function getAuthorizationHeader() {
  return `Bearer ${deviceToken}`;
}

function getBasicAuthHeader() {
  const clientId = $("#clientId").val();
  const clientSecret = $("#clientSecret").val();
  return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
}

// API 函數
function generateAuthUrl() {
  const clientId = $("#clientId").val();
  const redirectUrl = $("#redirectUrl").val();

  if (!clientId || !redirectUrl) {
    logMessage("請填寫 Client ID 和 Redirect URL", true);
    return;
  }

  const authUrl = `https://auth.epsonconnect.com/auth/authorize?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=device`;
  $("#authUrl").attr("href", authUrl).text(authUrl);
  $("#authUrlContainer").removeClass("hidden");
  logMessage("已生成授權網址");
}

function getDeviceToken() {
  const clientId = $("#clientId").val();
  const clientSecret = $("#clientSecret").val();
  const authCode = $("#authCode").val();
  const redirectUrl = $("#redirectUrl").val();

  if (!clientId || !clientSecret || !authCode || !redirectUrl) {
    logMessage("請填寫所有認證資訊", true);
    return;
  }

  $.ajax({
    url: "https://auth.epsonconnect.com/auth/token",
    method: "POST",
    headers: {
      Authorization: getBasicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: `grant_type=authorization_code&code=${authCode}&redirect_uri=${encodeURIComponent(
      redirectUrl
    )}`,
    success: function (response) {
      deviceToken = response.access_token;
      tokenExpiration = new Date();
      tokenExpiration.setSeconds(
        tokenExpiration.getSeconds() + response.expires_in
      );

      $("#deviceToken").text(deviceToken);
      $("#tokenExpires").text(tokenExpiration.toLocaleString());
      $("#tokenInfo").removeClass("hidden");

      logMessage("已成功獲取裝置權杖");
    },
    error: function (xhr) {
      logMessage(`取得裝置權杖失敗: ${xhr.responseText}`, true);
    },
  });
}

function getPrintCapability() {
  const apiKey = $("#apiKey").val();
  const printMode = $("#printMode").val();

  if (!deviceToken) {
    logMessage("請先取得裝置權杖", true);
    return;
  }

  $.ajax({
    url: `https://api.epsonconnect.com/api/2/printing/capability/${printMode}`,
    method: "GET",
    headers: {
      Authorization: getAuthorizationHeader(),
      "x-api-key": apiKey,
    },
    success: function (response) {
      printCapability = response;

      // 清空並填充選項
      $(
        "#paperSize, #paperType, #colorMode, #paperSource, #printQuality"
      ).empty();

      // 填充色彩模式
      response.colorModes.forEach((mode) => {
        $("#colorMode").append(
          `<option value="${mode}">${
            mode === "color" ? "彩色" : "黑白"
          }</option>`
        );
      });

      // 填充紙張尺寸和類型
      response.paperSizes.forEach((paperSizeObj) => {
        $("#paperSize").append(
          `<option value="${paperSizeObj.paperSize}">${paperSizeObj.paperSize}</option>`
        );

        // 預設選中第一個紙張尺寸
        if ($("#paperSize option").length === 1) {
          updatePaperTypes(paperSizeObj);
        }
      });

      $("#printSettingsSection").removeClass("hidden");
      logMessage("已獲取列印能力資訊");
    },
    error: function (xhr) {
      logMessage(`獲取列印能力失敗: ${xhr.responseText}`, true);
    },
  });
}

function updatePaperTypes(paperSizeObj) {
  $("#paperType").empty();

  paperSizeObj.paperTypes.forEach((paperTypeObj) => {
    $("#paperType").append(
      `<option value="${paperTypeObj.paperType}">${paperTypeObj.paperType}</option>`
    );

    // 預設選中第一個紙張類型
    if ($("#paperType option").length === 1) {
      updatePaperOptions(paperTypeObj);
    }
  });
}

function updatePaperOptions(paperTypeObj) {
  // 更新無邊框選項
  $("#borderless").prop("checked", paperTypeObj.borderless);

  // 更新紙張來源
  $("#paperSource").empty();
  paperTypeObj.paperSources.forEach((source) => {
    $("#paperSource").append(`<option value="${source}">${source}</option>`);
  });

  // 更新列印品質
  $("#printQuality").empty();
  paperTypeObj.printQualities.forEach((quality) => {
    $("#printQuality").append(`<option value="${quality}">${quality}</option>`);
  });
}

function createPrintJob() {
  const apiKey = $("#apiKey").val();
  const jobName = $("#jobName").val();
  const printMode = $("#printMode").val();
  const file = $("#fileUpload")[0].files[0];
  const useDeviceDefaults = $("#useDeviceDefaults").prop("checked");

  if (!deviceToken) {
    logMessage("請先取得裝置權杖", true);
    return;
  }

  if (!file) {
    logMessage("請選擇要列印的文件", true);
    return;
  }

  // 準備請求資料
  const requestData = {
    jobName: jobName,
    printMode: printMode,
  };

  // 只有在不使用機台預設設定時才加入列印設定
  if (!useDeviceDefaults) {
    requestData.printSettings = {
      paperSize: $("#paperSize").val(),
      paperType: $("#paperType").val(),
      borderless: $("#borderless").prop("checked"),
      printQuality: $("#printQuality").val(),
      paperSource: $("#paperSource").val(),
      colorMode: $("#colorMode").val(),
      doubleSided: "none",
      reverseOrder: false,
      copies: parseInt($("#copies").val(), 10),
      collate: true,
    };
  } else {
    logMessage("使用機台預設列印設定");
  }

  const settings = {
    async: true,
    crossDomain: true,
    url: "https://api.epsonconnect.com/api/2/printing/jobs",
    method: "POST",
    headers: {
      Authorization: getAuthorizationHeader(),
      "x-api-key": apiKey,
      "content-type": "application/json",
    },
    processData: false,
    data: JSON.stringify(requestData),
  };

  $.ajax(settings)
    .done(function (response) {
      currentJobId = response.jobId;
      uploadUri = response.uploadUri;

      logMessage(`已創建列印任務, JobID: ${currentJobId}`);
      uploadFile(file);
    })
    .fail(function (xhr) {
      logMessage(`創建列印任務失敗: ${xhr.responseText}`, true);
    });
}

function uploadFile(file) {
  const fileExtension = file.name.split(".").pop().toLowerCase();
  let contentType;

  // 根據文件類型設置 Content-Type
  switch (fileExtension) {
    case "pdf":
      contentType = "application/pdf";
      break;
    case "jpg":
    case "jpeg":
      contentType = "image/jpeg";
      break;
    case "png":
      contentType = "image/png";
      break;
    default:
      contentType = "application/octet-stream";
  }

  logMessage("開始上傳文件...");

  getBase64(file).then((fileData) => {
    $.ajax({
      url: `${uploadUri}&File=1.${fileExtension}`,
      method: "POST",
      headers: {
        "Content-Type": contentType,
      },
      data: fileData,
      processData: false,
      success: function () {
        logMessage("文件上傳成功");
        logMessage("等待系統處理文件...");

        // 等待1.5秒再啟用按鈕，給系統時間處理上傳的文件
        setTimeout(function () {
          $("#printDocument, #cancelPrint, #getPrintJobInfo").removeClass(
            "hidden"
          );
          logMessage("文件處理完成，可以開始列印");
        }, 1500);
      },
      error: function (xhr) {
        logMessage(`文件上傳失敗: ${xhr.responseText}`, true);
      },
    });
  });
}

function executePrint() {
  const apiKey = $("#apiKey").val();

  if (!deviceToken) {
    logMessage("請先取得裝置權杖", true);
    return;
  }

  if (!currentJobId) {
    logMessage("請先創建列印任務", true);
    return;
  }

  // 檢查權杖是否過期
  if (tokenExpiration && new Date() > tokenExpiration) {
    logMessage("裝置權杖已過期，請重新獲取", true);
    return;
  }

  $.ajax({
    url: `https://api.epsonconnect.com/api/2/printing/jobs/${currentJobId}/print`,
    method: "POST",
    headers: {
      Authorization: getAuthorizationHeader(),
      "x-api-key": apiKey,
    },
    success: function (response) {
      logMessage("已發送列印命令");
      logMessage(`回應: ${JSON.stringify(response || {})}`);
    },
    error: function (xhr) {
      try {
        const errorData = JSON.parse(xhr.responseText);
        logMessage(
          `列印失敗 [${xhr.status}]: ${JSON.stringify(errorData)}`,
          true
        );
      } catch (e) {
        logMessage(`列印失敗 [${xhr.status}]: ${xhr.responseText}`, true);
      }
      logMessage("請確認 API Key 是否正確，以及列印任務狀態是否有效", true);
    },
  });
}

function cancelPrint() {
  const apiKey = $("#apiKey").val();

  if (!currentJobId) {
    logMessage("無法取消，沒有進行中的列印任務", true);
    return;
  }

  $.ajax({
    url: `https://api.epsonconnect.com/api/2/printing/jobs/${currentJobId}/cancel`,
    method: "POST",
    headers: {
      Authorization: getAuthorizationHeader(),
      "x-api-key": apiKey,
    },
    success: function () {
      logMessage("已取消列印任務");
    },
    error: function (xhr) {
      logMessage(`取消列印失敗: ${xhr.responseText}`, true);
    },
  });
}

function getPrintJobInfo() {
  const apiKey = $("#apiKey").val();

  if (!deviceToken) {
    logMessage("請先取得裝置權杖", true);
    return;
  }

  if (!currentJobId) {
    logMessage("請先創建列印任務", true);
    return;
  }

  logMessage("正在獲取列印任務狀態...");

  $.ajax({
    url: `https://api.epsonconnect.com/api/2/printing/jobs/${currentJobId}`,
    method: "GET",
    headers: {
      Authorization: getAuthorizationHeader(),
      "x-api-key": apiKey,
    },
    success: function (response) {
      $("#jobInfo").text(JSON.stringify(response, null, 2));
      $("#jobInfoContainer").removeClass("hidden");

      // 記錄重要狀態資訊
      logMessage(`任務狀態: ${response.status || "未知"}`);
      if (response.errorCode) {
        logMessage(`錯誤代碼: ${response.errorCode}`, true);
      }
      if (response.errorDescription) {
        logMessage(`錯誤描述: ${response.errorDescription}`, true);
      }

      logMessage("已獲取列印任務資訊");
    },
    error: function (xhr) {
      try {
        const errorData = JSON.parse(xhr.responseText);
        logMessage(
          `獲取列印任務資訊失敗 [${xhr.status}]: ${JSON.stringify(errorData)}`,
          true
        );
      } catch (e) {
        logMessage(
          `獲取列印任務資訊失敗 [${xhr.status}]: ${xhr.responseText}`,
          true
        );
      }
    },
  });
}

function getDefaultSettings() {
  const apiKey = $("#apiKey").val();

  if (!deviceToken) {
    logMessage("請先取得裝置權杖", true);
    return;
  }

  $.ajax({
    url: "https://api.epsonconnect.com/api/2/printing/capability/default",
    method: "GET",
    headers: {
      Authorization: getAuthorizationHeader(),
      "x-api-key": apiKey,
    },
    success: function (response) {
      $("#defaultSettingsData").text(JSON.stringify(response, null, 2));
      $("#defaultSettingsInfo").removeClass("hidden");
      logMessage("已獲取預設列印設定");
    },
    error: function (xhr) {
      logMessage(`獲取預設列印設定失敗: ${xhr.responseText}`, true);
    },
  });
}

function getDeviceInfo() {
  const apiKey = $("#apiKey").val();

  if (!deviceToken) {
    logMessage("請先取得裝置權杖", true);
    return;
  }

  const settings = {
    async: true,
    crossDomain: true,
    url: "https://api.epsonconnect.com/api/2/printing/devices/info",
    method: "GET",
    headers: {
      Authorization: getAuthorizationHeader(),
      "x-api-key": apiKey,
    },
  };

  $.ajax(settings)
    .done(function (response) {
      $("#deviceInfoData").text(JSON.stringify(response, null, 2));
      $("#deviceInfoContainer").removeClass("hidden");
      logMessage("已獲取裝置資訊");

      // 顯示連接狀態
      if (response.connected) {
        $("#deviceConnectStatus").html(
          '<span class="badge bg-success">已連接</span>'
        );
      } else {
        $("#deviceConnectStatus").html(
          '<span class="badge bg-danger">未連接</span>'
        );
      }

      // 顯示印表機名稱和序號
      $("#deviceName").text(response.productName || "未知");
      $("#deviceSerial").text(response.serialNumber || "未知");
    })
    .fail(function (xhr) {
      logMessage(`獲取裝置資訊失敗: ${xhr.responseText}`, true);
    });
}

function getNotification() {
  const apiKey = $("#apiKey").val();

  if (!deviceToken) {
    logMessage("請先取得裝置權杖", true);
    return;
  }

  $.ajax({
    url: "https://api.epsonconnect.com/api/2/printing/settings/notification",
    method: "GET",
    headers: {
      Authorization: getAuthorizationHeader(),
      "x-api-key": apiKey,
    },
    success: function (response) {
      $("#notificationData").text(JSON.stringify(response, null, 2));
      $("#notificationInfo").removeClass("hidden");

      // 填充表單
      $("#notificationEnabled").prop("checked", response.notification);
      $("#callbackUri").val(response.callbackUri || "");
      $("#notificationSettings").removeClass("hidden");

      logMessage("已獲取通知設定");
    },
    error: function (xhr) {
      logMessage(`獲取通知設定失敗: ${xhr.responseText}`, true);
    },
  });
}

function updateNotification() {
  const apiKey = $("#apiKey").val();
  const enabled = $("#notificationEnabled").prop("checked");
  const callbackUri = $("#callbackUri").val();

  if (!deviceToken) {
    logMessage("請先取得裝置權杖", true);
    return;
  }

  const data = {
    notification: enabled,
    callbackUri: callbackUri,
  };

  $.ajax({
    url: "https://api.epsonconnect.com/api/2/printing/settings/notification",
    method: "POST",
    headers: {
      Authorization: getAuthorizationHeader(),
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
    success: function () {
      logMessage("已更新通知設定");
      getNotification(); // 重新獲取最新設定
    },
    error: function (xhr) {
      logMessage(`更新通知設定失敗: ${xhr.responseText}`, true);
    },
  });
}

// 事件綁定
$(document).ready(function () {
  // 認證相關
  $("#getAuthUrl").click(generateAuthUrl);
  $("#getDeviceToken").click(getDeviceToken);

  // 列印相關
  $("#getPrintCapability").click(getPrintCapability);
  $("#getDeviceInfo").click(getDeviceInfo);
  $("#paperSize").change(function () {
    const selectedPaperSize = $(this).val();
    const paperSizeObj = printCapability.paperSizes.find(
      (ps) => ps.paperSize === selectedPaperSize
    );
    if (paperSizeObj) {
      updatePaperTypes(paperSizeObj);
    }
  });

  $("#paperType").change(function () {
    const selectedPaperSize = $("#paperSize").val();
    const selectedPaperType = $(this).val();
    const paperSizeObj = printCapability.paperSizes.find(
      (ps) => ps.paperSize === selectedPaperSize
    );
    if (paperSizeObj) {
      const paperTypeObj = paperSizeObj.paperTypes.find(
        (pt) => pt.paperType === selectedPaperType
      );
      if (paperTypeObj) {
        updatePaperOptions(paperTypeObj);
      }
    }
  });

  // 當「使用機台預設設定」選項變更時，禁用或啟用列印設定選項
  $("#useDeviceDefaults").change(function () {
    const useDefaults = $(this).prop("checked");
    $("#printSettingsControls").toggleClass("disabled", useDefaults);
    $("#printSettingsControls input, #printSettingsControls select").prop(
      "disabled",
      useDefaults
    );
  });

  $("#createPrintJob").click(createPrintJob);
  $("#printDocument").click(executePrint);
  $("#cancelPrint").click(cancelPrint);
  $("#getPrintJobInfo").click(getPrintJobInfo);

  // 設定相關
  $("#getDefaultSettings").click(getDefaultSettings);
  $("#getNotification").click(getNotification);
  $("#updateNotification").click(updateNotification);
});
