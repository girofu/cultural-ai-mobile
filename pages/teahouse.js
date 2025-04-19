import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Teahouse.module.css";

export default function Teahouse() {
  return (
    <div className={styles.teahouseContainer}>
      <Head>
        <title>新芳春茶行 - 在地人AI導覽</title>
        <meta name="description" content="新芳春茶行 - 台北大稻埕歷史茶行" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-1 flex flex-col relative w-full max-w-md mx-auto">
        {/* 茶行照片 */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: "1274.65/843.96",
            maxHeight: "843.958px",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              width: "1274.65px",
              height: "843.958px",
              left: "-337px",
              position: "relative",
              flexShrink: 0,
              background:
                "url(/images/all/teahouse_image.jpg) lightgray 50% / cover no-repeat",
            }}
          ></div>
        </div>

        {/* 白色卡片內容區 */}
        <div className={styles.contentCard}>
          {/* 茶壺圖示 (絕對定位在右上角) */}
          <div className={styles.teapotIcon}>
            <Image
              src="/images/all/teapot_complete.svg"
              alt="茶壺"
              width={80}
              height={80}
              priority
            />
          </div>

          {/* 標題 */}
          <h1 className={styles.title}>新芳春茶行</h1>

          {/* 介紹文字 */}
          <p className={styles.description}>
            「新芳春茶行」興建於1934年，為大稻埕茶商王連河隨父親舉家自福建安溪來臺發展的起家厝，這棟融和中西特色的日治時期建築，是臺北市少數被完整保存下來的住商混合洋樓，經2009年指定為市定古蹟，自2011年至2015年歷時為期4年的古蹟修復工程，並於同年由原屋主將這棟富有歷史價值的古蹟建築捐贈予臺北市政府。
          </p>

          {/* 按鈕區域 */}
          <div className="mt-auto space-y-4 mb-6">
            <Link href="/attendee">
              <button className={styles.buttonPrimary}>確認地點</button>
            </Link>
            <Link href="/place">
              <button className={styles.buttonSecondary}>更換地點</button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
