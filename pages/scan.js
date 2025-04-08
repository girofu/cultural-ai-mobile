import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Scan() {
  const router = useRouter();
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 根據螢幕寬度決定布局
  const isMobile = windowSize.width < 768;

  return (
    <div className="min-h-screen bg-[#C6C3C0] flex flex-col items-center justify-between relative overflow-hidden pt-16 md:pt-32">
      <Head>
        <title>在地人AI導覽系統 - 掃描QR碼</title>
        <meta
          name="description"
          content="掃瞄場域條碼，輕鬆開啟在地人導覽功能"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* 返回按鈕 */}
      <div className="absolute top-8 left-8">
        <button
          onClick={() => router.push("/")}
          className="bg-white rounded-full p-3 shadow-md hover:shadow-lg transition-shadow"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="#1E1E1E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <main className="flex flex-col items-center w-full max-w-[390px] mt-[225px] md:mt-[225px]">
        {/* 掃描區域 */}
        <div className="relative w-full max-w-[320px] h-[320px] bg-gray-600/30 rounded-2xl overflow-hidden flex items-center justify-center">
          {/* QR碼組 */}
          <div className="relative w-[220px] h-[220px] flex items-center justify-center">
            {/* QR碼SVG元素 */}
            <div className="relative w-full h-full">
              <Image
                src="/images/all/qr-code.svg"
                alt="QR Code"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </main>

      {/* 描述區域 - 白色背景區塊，移至畫面底部並佔滿寬度 */}
      <div className="bg-[#FFFFFF] rounded-t-2xl p-5 w-full mt-auto">
        {/* 說明文字 */}
        <p className="font-inter font-normal text-xl leading-[1.5em] tracking-widest text-center text-black max-w-[390px] mx-auto">
          掃瞄場域條碼，輕鬆開啟在地人導覽功能
        </p>
      </div>
    </div>
  );
}
