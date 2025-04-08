import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/NavigationMode.module.css";
import MenuButton from "../components/MenuButton";
import BackButton from "../components/BackButton";

export default function NavigationMode() {
  const router = useRouter();

  const handleMenu = () => {
    router.push("/");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>在地人AI導覽 - 選擇導覽模式</title>
        <meta name="description" content="選擇您的導覽模式" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center w-full max-w-md relative">
        <div className="w-full absolute top-1 left-0 right-0 flex justify-between px-6">
          <MenuButton onClick={handleMenu} />
          <BackButton onClick={handleBack} />
        </div>

        <div className="flex items-center mt-16 mb-8">
          <h1 className={styles.heading}>確認導覽模式</h1>
          <div className="ml-2">
            <img
              src="/images/all/interrogation.svg"
              alt="問號"
              className="w-6 h-6"
            />
          </div>
        </div>

        <div className="w-full space-y-8 px-4">
          <div className="flex flex-col items-center">
            <div className={styles.optionContainer}>
              <img
                src="/images/all/img_route.svg"
                alt="固定路線"
                className="w-32 h-32"
              />
            </div>
            <h2 className={styles.optionText}>固定路線</h2>
          </div>

          <div className="flex flex-col items-center">
            <div className={styles.optionContainer}>
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
