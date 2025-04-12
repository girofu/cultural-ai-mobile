import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import MenuButton from "../components/MenuButton";
import BackButton from "../components/BackButton";
import layoutStyles from "../styles/Layout.module.css";
import styles from "../styles/AttendeePage.module.css";

const AttendeePage = () => {
  const router = useRouter();

  const handleSelectGroup = () => {
    // 導向導覽模式選擇頁面
    router.push("/mode");
  };

  const handleSelectIndividual = () => {
    // 導向導覽模式選擇頁面
    router.push("/mode");
  };

  const handleMenu = () => {
    router.push("/");
  };

  const handleBack = () => {
    router.push("/place");
  };

  // Function to handle key down events for accessibility
  const handleKeyDown = (event, handler) => {
    if (event.key === "Enter" || event.key === " ") {
      handler();
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>確認導覽人數 - 在地人AI導覽</title>
        <meta name="description" content="選擇導覽人數" />
      </Head>

      <div className={layoutStyles.menuButtonContainer}>
        <MenuButton onClick={handleMenu} />
      </div>
      <div className={layoutStyles.stopButtonContainer}>
        <BackButton onClick={handleBack} />
      </div>

      <main className={styles.mainContent}>
        {/* 標題部分 */}
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>確認導覽人數</h1>
          <div className={styles.questionIconContainer}>
            <Image
              src="/images/all/question_icon.svg"
              alt="問號圖標"
              width={25}
              height={25}
            />
          </div>
        </div>

        {/* 選項部分 */}
        <div className={styles.optionsContainer}>
          {/* 團體選項 */}
          <div
            className={styles.option}
            onClick={handleSelectGroup}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, handleSelectGroup)}
          >
            <div className={styles.optionBox}>
              <div className={styles.groupIconContainer}>
                <Image
                  src="/images/all/group_icon.svg"
                  alt="團體選項"
                  fill
                  className={styles.iconImage}
                />
              </div>
            </div>
            <span className={styles.optionText}>團 體</span>
          </div>

          {/* 個人選項 */}
          <div
            className={styles.option}
            onClick={handleSelectIndividual}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown(e, handleSelectIndividual)}
          >
            <div className={styles.optionBox}>
              <div className={styles.individualIconContainer}>
                <Image
                  src="/images/all/individual_icon.svg"
                  alt="個人選項"
                  fill
                  className={styles.iconImage}
                />
              </div>
            </div>
            <span className={styles.optionText}>個 人</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendeePage;
