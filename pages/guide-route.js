import React from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/GuideStart.module.css";

export default function GuideRoute() {
  const router = useRouter();

  const handleMenu = () => {
    router.push("/index");
  };

  const handleStop = () => {
    router.push("/guide-end");
  };

  return (
    <Layout
      title="在地人AI導覽 - 路線選擇"
      handleMenu={handleMenu}
      handleStop={handleStop}
    >
      {/* 路線卡片區域 */}
      <div className={styles.routeCardsContainer}>
        {/* 茶葉文化路線卡片 */}
        <div className={styles.routeCard}>
          <img
            src="/images/all/tea-route-image.png"
            alt="茶葉文化路線"
            className={styles.routeImage}
          />
          <h3 className={styles.routeTitle}>A 茶葉文化路線</h3>
          <p className={styles.routeDescription}>
            著重在當時茶葉的文化與歷史，導覽聚焦在茶葉歷史、製茶流程與相關場景。
          </p>
          <p className={styles.routeLabelText}>指定學習單路線：</p>
          <div className={styles.schoolButtonsContainer}>
            <div className={styles.schoolButton}>
              <span className={styles.schoolButtonText}>民生國小</span>
            </div>
            <div className={styles.schoolButton}>
              <span className={styles.schoolButtonText}>民權國小</span>
            </div>
            <div className={styles.schoolButton}>
              <span className={styles.schoolButtonText}>復興國中</span>
            </div>
          </div>
        </div>

        {/* 生活背景路線卡片 */}
        <div className={styles.routeCard}>
          <img
            src="/images/all/life-route-image.png"
            alt="生活背景路線"
            className={styles.routeImage}
          />
          <h3 className={styles.routeTitle}>B 生活背景路線</h3>
          <p className={styles.routeDescription}>
            著重在新芳春行的創辦沿革以及經營者在當時時空背景下的生活及在地互動
          </p>
          <p className={styles.routeLabelText}>指定學習單路線：</p>
          <div className={styles.schoolButtonsContainer}>
            <div className={styles.schoolButton}>
              <span className={styles.schoolButtonText}>中山國小</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
