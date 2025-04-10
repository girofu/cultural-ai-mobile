import React, { useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import MenuButton from "../components/MenuButton";
import styles from "../styles/Sheet.module.css";

export default function Sheet() {
  const router = useRouter();
  const contentRef = useRef(null);

  const handleMenu = () => {
    router.push("/index");
  };

  const handleBack = () => {
    router.push("/guide-end");
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>在地人AI導覽 - 學習單</title>
        <meta name="description" content="在地人AI導覽系統 - 學習單" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {/* 背景色 */}
        <div className={styles.background}></div>

        {/* 固定區域 - 頂部部分 */}
        <div className={styles.fixedTop}>
          {/* 選單按鈕 */}
          <div className={styles.menuButtonContainer}>
            <MenuButton onClick={handleMenu} />
          </div>

          {/* 返回按鈕 */}
          <div className={styles.backButtonContainer}>
            <button className={styles.backButton} onClick={handleBack}>
              <img
                src="/images/all/icon_arrow_left.svg"
                alt="返回"
                className={styles.backIcon}
              />
            </button>
          </div>

          {/* 重新製作按鈕 */}
          <div className={styles.regenerateButtonContainer}>
            <button className={styles.regenerateButton}>
              <div className={styles.regenerateIconContainer}>
                <img
                  src="/images/all/icon_generate.svg"
                  alt="重新製作"
                  className={styles.regenerateIcon}
                />
              </div>
              <span className={styles.regenerateText}>重新製作</span>
            </button>
          </div>

          {/* 列印按鈕 */}
          <div className={styles.printButtonContainer}>
            <button className={styles.printButton}>
              <div className={styles.printIconContainer}>
                <img
                  src="/images/all/icon_printer.svg"
                  alt="列印"
                  className={styles.printIcon}
                />
              </div>
              <span className={styles.printText}>立刻列印</span>
            </button>
          </div>

          {/* 頂部分隔線 */}
          <div className={styles.topLine}></div>
        </div>

        {/* 可滾動內容區域 */}
        <div className={styles.scrollableContent} ref={contentRef}>
          {/* 學習單卡片區域 */}
          <div className={styles.sheetCard}>
            {/* 個人資訊區 */}
            <div className={styles.personalInfo}>
              <div className={styles.avatar}>
                <img
                  src="/images/all/avatar_placeholder.png"
                  alt="個人頭像"
                  className={styles.avatarImage}
                />
              </div>

              {/* 姓名欄位 */}
              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>姓名</label>
                <div className={styles.fieldInput}>畢小功</div>
              </div>

              {/* 參觀日期欄位 */}
              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>參觀日期</label>
                <div className={styles.fieldInput}>2025/03/20</div>
              </div>

              {/* 停留時間欄位 */}
              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>停留時間</label>
                <div className={styles.fieldInput}>1 小時 15 分鐘</div>
              </div>

              {/* AI導覽員欄位 */}
              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>AI導覽員</label>
                <div className={styles.fieldInput}>茶農阿伯</div>
              </div>

              {/* 導覽模式欄位 */}
              <div className={styles.infoField}>
                <label className={styles.fieldLabel}>導覽模式</label>
                <div className={styles.fieldInput}>固定路線 - 茶葉文化</div>
              </div>

              {/* 導覽成就區 */}
              <div className={styles.achievement}>
                <h3 className={styles.achievementTitle}>導覽成就</h3>
                <div className={styles.badgeContainer}>
                  <div className={styles.badge}>
                    <img
                      src="/images/all/badge_01.svg"
                      alt="參與徽章"
                      className={styles.badgeImage}
                    />
                  </div>
                  <div className={styles.badge}>
                    <img
                      src="/images/all/badge_02.svg"
                      alt="影片徽章"
                      className={styles.badgeImage}
                    />
                  </div>
                  <div className={styles.badge}>
                    <img
                      src="/images/all/badge_03.svg"
                      alt="答題徽章"
                      className={styles.badgeImage}
                    />
                  </div>
                  <div className={styles.badge}>
                    <img
                      src="/images/all/badge_04.svg"
                      alt="學習單徽章"
                      className={styles.badgeImage}
                    />
                  </div>
                </div>
              </div>

              {/* 功能選單圖標 */}
              <div className={styles.menuDotsContainer}>
                <img
                  src="/images/all/icon_menu_dot.svg"
                  alt="功能選單"
                  className={styles.menuDotsIcon}
                />
              </div>
            </div>
          </div>

          {/* 學習內容卡片 */}
          <div className={styles.sheetCard}>
            <h2 className={styles.cardTitle}>今天我學到了什麼？</h2>

            {/* 學習內容項目 */}
            <div className={styles.lessonCard}>
              <h3 className={styles.lessonTitle}>台灣茶葉的歷史</h3>
              <div className={styles.lessonImageContainer}>
                <img
                  src="/images/all/tea_export_box.jpeg"
                  alt="木製茶葉出口箱"
                  className={styles.lessonImage}
                />
              </div>
              <h4 className={styles.lessonSubtitle}>木製茶葉出口箱</h4>
              <p className={styles.lessonDescription}>
                早期茶葉會裝在有錫箔內襯的木箱中，運送到英國和日本
              </p>
            </div>

            <div className={styles.lessonCard}>
              <h3 className={styles.lessonTitle}>製茶流程</h3>
              <div className={styles.lessonImageContainer}>
                <img
                  src="/images/all/tea_tools.jpeg"
                  alt="古早製茶工具"
                  className={styles.lessonImage}
                />
              </div>
              <h4 className={styles.lessonSubtitle}>古早製茶工具</h4>
              <p className={styles.lessonDescription}>
                茶葉從採收、曬菁、揉捻、烘焙，每一步都影響香氣
              </p>
            </div>

            <div className={styles.lessonCard}>
              <h3 className={styles.lessonTitle}>茶行的日常</h3>
              <div className={styles.lessonImageContainer}>
                <img
                  src="/images/all/tea_scale.jpeg"
                  alt="茶葉秤與木牌價"
                  className={styles.lessonImage}
                />
              </div>
              <h4 className={styles.lessonSubtitle}>茶葉秤與木牌價</h4>
              <p className={styles.lessonDescription}>
                老闆會用秤子秤重後再計價，有時還會寫在木牌上
              </p>
            </div>
          </div>

          {/* AI導覽互動記錄卡片 */}
          <div className={styles.sheetCard}>
            <h2 className={styles.cardTitle}>AI 導覽互動紀錄</h2>
            <p className={styles.interactionRecord}>
              ✔ 我參加了「包種茶是什麼？」小測驗，答對了！
              <br />
              <br />
              ✔ 我完成了茶葉製程排序遊戲：採茶 ➡ 曬菁 ➡ 揉捻 ➡ 烘焙
              <br />
              <br />✔ 我對「杉木茶箱的防潮設計」表示「覺得很酷！」👍
            </p>
          </div>

          {/* 我最有興趣的展品卡片 */}
          <div className={styles.sheetCard}>
            <h2 className={styles.cardTitle}>我最有興趣的展品</h2>
            <p className={styles.exhibitTitle}>我拍下了：「包種茶茶葉展示」</p>

            <div className={styles.exhibitImageContainer}>
              <img
                src="/images/all/oolong_tea.jpeg"
                alt="包種茶茶葉展示"
                className={styles.exhibitImage}
              />
            </div>

            <div className={styles.aiCommentContainer}>
              <div className={styles.aiAvatar}>
                <img
                  src="/images/all/tea_abe_small.png"
                  alt="茶農阿伯"
                  className={styles.aiAvatarImage}
                />
              </div>
              <div className={styles.commentContent}>
                <p className={styles.aiName}>茶農阿伯：</p>
                <p className={styles.aiComment}>
                  這就是半發酵茶，也是台灣人最常喝的！
                </p>
              </div>
            </div>
          </div>

          {/* 今日學習任務成果卡片 */}
          <div className={styles.sheetCard}>
            <h2 className={styles.cardTitle}>今日學習任務成果</h2>
            <p className={styles.learningOutcome}>
              🧠 我學到了：
              <br />
              <br />
              ✔ 杉木茶箱怎麼幫助保存茶葉香氣
              <br />
              ✔ 製茶流程中最重要的是「烘焙」
              <br />
              ✔ 茶葉以前是出口大宗，是台灣經濟很重要的一部分
              <br />
              <br />
              📜 AI 為我生成了一張：「茶知識小達人」證書！
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
