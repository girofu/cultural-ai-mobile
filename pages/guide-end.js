import React from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/GuideEnd.module.css";

export default function GuideEnd() {
  const router = useRouter();

  const handleMenu = () => {
    router.push("/index");
  };

  const handleStop = () => {
    router.push("/guide-start");
  };

  const handleMakeWorksheet = () => {
    // 導向到學習單生成頁面
    router.push("/sheet-generating");
  };

  const handleMakeJournal = () => {
    // 實現製作遊記的導向
    router.push("/guide-start");
  };

  const handleEndGuide = () => {
    // 實現結束導覽的導向
    router.push("/guide");
  };

  const handleBackToGuide = () => {
    // 實現回到導覽的導向
    router.push("/guide-start");
  };

  return (
    <Layout
      title="在地人AI導覽 - 結束導覽"
      handleMenu={handleMenu}
      handleStop={handleStop}
    >
      {/* 按鈕容器 */}
      <div className={styles.buttonContainer}>
        <button className={styles.primaryButton} onClick={handleMakeWorksheet}>
          是，請製作學習單
        </button>
        <button className={styles.secondaryButton} onClick={handleMakeJournal}>
          是，請製作遊記
        </button>
        <button className={styles.secondaryButton} onClick={handleEndGuide}>
          都不用，請結束導覽
        </button>
        <button className={styles.secondaryButton} onClick={handleBackToGuide}>
          回到導覽
        </button>
      </div>
    </Layout>
  );
}
