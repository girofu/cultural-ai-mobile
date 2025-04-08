import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import MenuButton from "./MenuButton";
import styles from "../styles/Layout.module.css";

export default function Layout({
  children,
  title = "在地人AI導覽",
  handleMenu,
  handleStop,
  onSendMessage,
}) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);

  // 如果沒有提供handleMenu和handleStop函數，使用默認行為
  const defaultHandleMenu = () => {
    router.push("/index");
  };

  const defaultHandleStop = () => {
    router.push("/guide-end");
  };

  // 使用提供的函數或默認函數
  const onMenuClick = handleMenu || defaultHandleMenu;
  const onStopClick = handleStop || defaultHandleStop;

  const handleInput = (event) => {
    setInputValue(event.currentTarget.textContent);
  };

  const handleKeyDown = (event) => {
    // 檢查是否按下 Enter 鍵，且並非輸入法組字過程
    if (
      event.key === "Enter" &&
      !event.nativeEvent.isComposing &&
      event.currentTarget === inputRef.current
    ) {
      event.preventDefault(); // 防止 Enter 鍵的默認行為（例如換行）
      const textToSend = inputValue.trim();
      if (textToSend !== "") {
        if (onSendMessage) {
          onSendMessage(textToSend);
        }
        setInputValue(""); // 清除 state
        if (inputRef.current) {
          inputRef.current.textContent = ""; // 清除 contentEditable div 的內容
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={title} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* 背景色 */}
        <div className={styles.background}></div>

        {/* 頂部區域 - 茶農阿伯圖片 */}
        <div className={styles.teaFarmerImageContainer}>
          <img
            src="/images/all/tea_abe.svg"
            alt="茶農阿伯"
            className={styles.teaFarmerImage}
          />
        </div>

        {/* 茶農阿伯文字 */}
        <div className={styles.teaFarmerNameContainer}>
          <h2 className={styles.teaFarmerName}>茶農阿伯</h2>
        </div>

        {/* 頂部分隔線 */}
        <div className={styles.topLine}></div>

        {/* 中間內容區域 - 可滾動 */}
        <div className={styles.contentContainer}>{children}</div>

        {/* 底部分隔線 */}
        <div className={styles.bottomLine}></div>

        {/* 新增外層 Wrapper */}
        <div className={styles.bottomBarWrapper}>
          {/* 可編輯的輸入區域 */}
          <div
            ref={inputRef}
            className={`${styles.bottomBarInputArea} ${
              inputValue === "" ? styles.placeholder : ""
            }`}
            contentEditable="true"
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            suppressContentEditableWarning={true}
            data-placeholder="輸入訊息..."
          >
            {/* 文字內容由 contentEditable 管理 */}
          </div>

          {/* 圖標容器 (移到 Wrapper 內，輸入區之後) */}
          <div className={styles.bottomBarIcons}>
            <div className={styles.iconContainer}>
              <img
                src="/images/all/icon_ai_camera.svg"
                alt="AI 相機"
                className={styles.icon}
              />
            </div>
            <div className={styles.iconContainer}>
              <img
                src="/images/all/icon-microphone.svg"
                alt="麥克風"
                className={styles.icon}
              />
            </div>
            <div className={styles.iconContainer}>
              <img
                src="/images/all/icon_upload.svg"
                alt="上傳"
                className={styles.icon}
              />
            </div>
          </div>
        </div>

        {/* 選單按鈕 */}
        <div className={styles.menuButtonContainer}>
          <MenuButton onClick={onMenuClick} />
        </div>

        {/* 停止按鈕 */}
        <div className={styles.stopButtonContainer}>
          <button className={styles.stopButton} onClick={onStopClick}>
            <img
              src="/images/all/stop_icon.svg"
              alt="停止"
              className={styles.stopIcon}
            />
          </button>
        </div>
      </main>
    </div>
  );
}
