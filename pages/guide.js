import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/Guide.module.css";
import { useState } from "react";
import MenuButton from "../components/MenuButton";
import BackButton from "../components/BackButton";
import layoutStyles from "../styles/Layout.module.css";

export default function Guide() {
  const router = useRouter();
  const { mode } = router.query;
  const [selectedGuide, setSelectedGuide] = useState(0);

  const guides = [
    { id: 0, name: "小資文青", image: "/images/all/petit_image.svg" },
    { id: 1, name: "美食家", image: "/images/all/petit_image.svg" },
    { id: 2, name: "茶農阿伯", image: "/images/all/tea_abe.svg" },
  ];

  const handleGuideChange = (direction) => {
    if (direction === "prev") {
      setSelectedGuide((prev) => (prev === 0 ? guides.length - 1 : prev - 1));
    } else {
      setSelectedGuide((prev) => (prev === guides.length - 1 ? 0 : prev + 1));
    }
  };

  const handleBack = () => {
    router.push("/mode");
  };

  const handleMenu = () => {
    router.push("/");
  };

  const handleSelectGuide = () => {
    router.push(`/guide-intro?mode=${mode || "fixed"}`);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>在地人AI導覽 - 導覽員選擇</title>
        <meta name="description" content="在地人AI導覽 - 導覽員選擇" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={layoutStyles.menuButtonContainer}>
        <MenuButton onClick={handleMenu} />
      </div>
      <div className={layoutStyles.stopButtonContainer}>
        <BackButton onClick={handleBack} />
      </div>

      <main className="flex flex-col items-center w-full max-w-md relative pt-20">
        {/* 標題區塊 */}
        <div className={`${styles.titleContainer} mt-16 mb-8`}>
          <h1 className={styles.title}>確認您的導覽員</h1>
          <img
            src="/images/all/interrogation_icon.svg"
            alt="說明"
            className={styles.interrogationIcon}
          />
        </div>

        {/* 導覽員選擇區塊 */}
        <div className={styles.guideSelectionContainer}>
          {/* 左箭頭 */}
          <button
            className={styles.caretButton}
            onClick={() => handleGuideChange("prev")}
            aria-label="選擇上一個導覽員"
          >
            <img
              src="/images/all/arrow_left_icon.svg"
              alt="前一個"
              className={styles.caretLeftIcon}
            />
          </button>

          {/* 導覽員卡片 */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardContent}>
              <div className={styles.guideCardImage}>
                <img
                  src={guides[selectedGuide].image}
                  alt={guides[selectedGuide].name}
                  className={styles.petitImage}
                />
              </div>
              <div className={styles.guideCardTitle}>
                <h2 className={styles.guideTitle}>
                  {guides[selectedGuide].name}
                </h2>
              </div>
            </div>
          </div>

          {/* 右箭頭 */}
          <button
            className={styles.caretButton}
            onClick={() => handleGuideChange("next")}
            aria-label="選擇下一個導覽員"
          >
            <img
              src="/images/all/arrow_left_icon.svg"
              alt="下一個"
              className={`${styles.caretRightIcon} ${styles.flipHorizontal}`}
            />
          </button>
        </div>

        {/* 選擇按鈕 */}
        <div className={styles.selectButtonContainer}>
          <button className={styles.selectButton} onClick={handleSelectGuide}>
            選擇此導覽員
          </button>
        </div>
      </main>
    </div>
  );
}
