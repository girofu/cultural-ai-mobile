import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import MenuButton from "../components/MenuButton";
import BackButton from "../components/BackButton";
import styles from "../styles/GuideIntro.module.css";

export default function GuideIntro() {
  const router = useRouter();

  const handleMenu = () => {
    router.push("/");
  };

  const handleBack = () => {
    router.back();
  };

  const handleConfirmGuide = () => {
    // 跳轉到下一個頁面
    router.push("/guide-start");
  };

  const handleChangeGuide = () => {
    // 返回導覽員選擇頁面
    router.push("/guide");
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>在地人AI導覽 - 導覽員介紹</title>
        <meta name="description" content="在地人AI導覽 - 導覽員介紹" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* 背景色 */}
        <div className={styles.background}></div>

        {/* 白色圓角卡片 */}
        <div className={styles.card}>
          {/* 導覽員圖片 */}
          <div className={styles.guideImageContainer}>
            <img
              src="/images/all/tea_farmer_image.svg"
              alt="茶農阿伯"
              className={styles.guideImage}
            />
          </div>

          {/* 導覽員名稱 */}
          <h1 className={styles.guideName}>茶農阿伯</h1>

          {/* 導覽員介紹 */}
          <p className={styles.guideDescription}>
            有著40年種茶與經營經驗的茶農阿伯，有關茶葉的所有小知識問他就對了！
          </p>

          {/* 確認導覽員按鈕 */}
          <button className={styles.confirmButton} onClick={handleConfirmGuide}>
            確認導覽員
          </button>

          {/* 換一位導覽員按鈕 */}
          <button className={styles.changeButton} onClick={handleChangeGuide}>
            換一位導覽員
          </button>
        </div>

        {/* 頂部導航欄 */}
        <div className={styles.navbar}>
          <div className={styles.navbarLeft}>
            <MenuButton onClick={handleMenu} />
          </div>
          <div className={styles.navbarRight}>
            <BackButton onClick={handleBack} />
          </div>
        </div>
      </main>
    </div>
  );
}
