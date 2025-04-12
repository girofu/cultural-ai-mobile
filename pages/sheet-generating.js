import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/GuideStart.module.css";

export default function SheetGenerating() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/sheet");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleMenu = () => {
    router.push("/");
  };

  const handleStop = () => {
    router.push("/guide-end");
  };

  return (
    <Layout
      title="在地人AI導覽 - 學習單生成中"
      handleMenu={handleMenu}
      handleStop={handleStop}
    >
      <div className={styles.dialogueText}>學習單生成中，請稍候。</div>

      {/* 紙袋角色圖片 */}
      <div className={styles.paperBagContainer}>
        <img
          src="/images/all/paper_bag_character.png"
          alt="紙袋角色"
          className={styles.paperBagImage}
        />
      </div>

      {/* 進度條 */}
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBarBg}>
          <div className={styles.progressBarFill}></div>
        </div>
      </div>

      {/* 學習單預覽圖 */}
      <div className={styles.sheetPreviewContainer}>
        <img
          src="/images/all/sheet_preview.png"
          alt="學習單預覽"
          className={styles.sheetPreviewImage}
        />
      </div>
    </Layout>
  );
}
