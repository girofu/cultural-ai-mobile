import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/NavigationMode.module.css";
import MenuButton from "../components/MenuButton";
import BackButton from "../components/BackButton";
import layoutStyles from "../styles/Layout.module.css";

export default function NavigationMode() {
  const router = useRouter();

  const handleMenu = () => {
    router.push("/");
  };

  const handleBack = () => {
    router.push("/attendee");
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>在地人AI導覽 - 選擇導覽模式</title>
        <meta name="description" content="選擇您的導覽模式" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={layoutStyles.menuButtonContainer}>
        <MenuButton onClick={handleMenu} />
      </div>
      <div className={layoutStyles.stopButtonContainer}>
        <BackButton onClick={handleBack} />
      </div>

      <main className="flex flex-col items-center w-full max-w-md relative pt-20">
        <div className="flex items-center mt-16 mb-8">
          <h1 className={styles.heading}>確認導覽模式</h1>
          <div className="flex-shrink-0" style={{ marginLeft: "10px", marginTop: "-0.5rem" }}>
            <img
              src="/images/all/interrogation.svg"
              alt="問號"
              width={30}
              height={30}
            />
          </div>
        </div>

        <div className="w-full space-y-8 px-4">
          <div
            className="flex flex-col items-center cursor-pointer mb-[103px]"
            onClick={() => router.push("/guide?mode=fixed")}
          >
            <div className={`${styles.optionContainer} opacity-80`}>
              <img
                src="/images/all/img_route.svg"
                alt="固定路線"
                className="w-32 h-32"
              />
            </div>
            <h2 className={styles.optionText}>固定路線</h2>
          </div>

          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={() => router.push("/guide-start?mode=explore")}
          >
            <div className={`${styles.optionContainer} opacity-80`}>
              <img
                src="/images/all/icon_planet.svg"
                alt="自由探索"
                className="w-32 h-32"
              />
            </div>
            <h2 className={styles.optionText}>自由探索</h2>
          </div>
        </div>
      </main>
    </div>
  );
}
