import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Scan() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState(null);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const scannerRef = useRef(null);

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 10,
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    function onScanSuccess(decodedText, decodedResult) {
      console.log(`Code matched = ${decodedText}`, decodedResult);
      setScanResult(decodedText);
      scanner.clear();
    }

    function onScanFailure(error) {
      // console.warn(`Code scan error = ${error}`);
    }

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
      }
    };
  }, []);

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

      <div className="absolute top-8 left-8 z-10">
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

      <main className="flex flex-col items-center w-full max-w-[390px] mt-[100px] md:mt-[150px]">
        {scanResult ? (
          <div className="text-center p-4 bg-white rounded-lg shadow-md">
            <p className="font-semibold">掃描成功!</p>
            <p className="break-all">結果: {scanResult}</p>
            <button
              onClick={() => setScanResult(null)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              重新掃描
            </button>
          </div>
        ) : (
          <div
            id="reader"
            className="w-full max-w-[320px] h-[320px] bg-gray-600/30 rounded-2xl overflow-hidden flex items-center justify-center"
          ></div>
        )}
      </main>

      <div className="bg-[#FFFFFF] rounded-t-2xl p-5 w-full mt-auto">
        <p className="font-inter font-normal text-xl leading-[1.5em] tracking-widest text-center text-black max-w-[390px] mx-auto">
          將 QR code 置於方框中掃描
        </p>
      </div>
    </div>
  );
}
