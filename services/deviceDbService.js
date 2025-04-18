/**
 * 設備數據庫服務
 * 管理設備的refresh token和相關信息
 */
import fs from "fs";
import path from "path";

// 定義數據庫文件路徑
const DB_FILE_PATH = path.join(process.cwd(), "db/devices.json");

// 確保數據庫目錄存在
const ensureDbDirExists = () => {
  const dbDir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // 確保文件存在
  if (!fs.existsSync(DB_FILE_PATH)) {
    fs.writeFileSync(DB_FILE_PATH, "[]", "utf8");
  }
};

/**
 * 讀取所有設備信息
 * @returns {Array} 設備信息數組
 */
export const getAllDevices = () => {
  ensureDbDirExists();

  try {
    const data = fs.readFileSync(DB_FILE_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("讀取設備數據庫失敗:", error);
    return [];
  }
};

/**
 * 獲取特定設備信息
 * @param {string} deviceId 設備ID
 * @returns {Object|null} 設備信息或null
 */
export const getDevice = (deviceId) => {
  const devices = getAllDevices();
  return devices.find((device) => device.deviceId === deviceId) || null;
};

/**
 * 保存或更新設備信息
 * @param {Object} deviceInfo 設備信息
 * @returns {boolean} 操作是否成功
 */
export const saveDevice = (deviceInfo) => {
  if (!deviceInfo || !deviceInfo.deviceId) {
    return false;
  }

  try {
    ensureDbDirExists();

    // 讀取現有設備列表
    const devices = getAllDevices();

    // 檢查是否已存在該設備
    const index = devices.findIndex((d) => d.deviceId === deviceInfo.deviceId);

    if (index >= 0) {
      // 更新現有設備
      devices[index] = { ...devices[index], ...deviceInfo };
    } else {
      // 添加新設備
      devices.push(deviceInfo);
    }

    // 保存回文件
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(devices, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("保存設備信息失敗:", error);
    return false;
  }
};

/**
 * 更新設備的refresh token
 * @param {string} deviceId 設備ID
 * @param {string} refreshToken 新的refresh token
 * @param {number} expiresIn token過期時間（秒）
 * @returns {boolean} 操作是否成功
 */
export const updateDeviceToken = (
  deviceId,
  refreshToken,
  accessToken,
  expiresIn
) => {
  const device = getDevice(deviceId);

  if (!device) {
    return false;
  }

  const tokenExpiration = new Date();
  tokenExpiration.setSeconds(tokenExpiration.getSeconds() + expiresIn);

  return saveDevice({
    ...device,
    refreshToken,
    accessToken,
    tokenExpiration: tokenExpiration.toISOString(),
  });
};

/**
 * 刪除設備信息
 * @param {string} deviceId 設備ID
 * @returns {boolean} 操作是否成功
 */
export const deleteDevice = (deviceId) => {
  try {
    const devices = getAllDevices();
    const updatedDevices = devices.filter(
      (device) => device.deviceId !== deviceId
    );

    fs.writeFileSync(
      DB_FILE_PATH,
      JSON.stringify(updatedDevices, null, 2),
      "utf8"
    );
    return true;
  } catch (error) {
    console.error("刪除設備信息失敗:", error);
    return false;
  }
};

// 導出默認對象
const deviceDbService = {
  getAllDevices,
  getDevice,
  saveDevice,
  updateDeviceToken,
  deleteDevice,
};

export default deviceDbService;
