import Head from "next/head";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function Scan() {
  const router = useRouter();
  const [scanResult, setScanResult] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const scannerRef = useRef(null);
  const scannerInitialized = useRef(false);

  // 只處理窗口大小變化，不初始化掃描器
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 判斷文本是否為URL
  const isUrl = (text) => {
    try {
      new URL(text);
      return true;
    } catch (e) {
      return false;
    }
  };

  // 單獨的 useEffect 用於掃描器初始化，不依賴 windowSize
  useEffect(() => {
    // 防止重複初始化
    if (scannerInitialized.current || typeof window === "undefined") {
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight * 0.65;
    const qrboxSize = Math.min(viewportWidth, viewportHeight) * 0.8;

    const config = {
      qrbox: {
        width: qrboxSize,
        height: qrboxSize,
      },
      fps: 10,
      rememberLastUsedCamera: true,
      aspectRatio: 1,
    };

    const initScanner = () => {
      try {
        const scanner = new Html5QrcodeScanner("reader", config, false);
        scannerRef.current = scanner;
        scannerInitialized.current = true;

        function onScanSuccess(decodedText, decodedResult) {
          console.log(`Code matched = ${decodedText}`, decodedResult);
          setScanResult(decodedText);
          scanner.clear();

          // 檢查掃描結果是否為URL
          if (isUrl(decodedText)) {
            // 如果是URL，則在新窗口中打開
            window.open(decodedText, "_blank");
          }
        }

        function onScanFailure(error) {
          // 不記錄掃描失敗，減少控制台日誌
        }

        // 延遲渲染，確保DOM已經完全加載
        setTimeout(() => {
          scanner.render(onScanSuccess, onScanFailure);
        }, 100);
      } catch (error) {
        console.error("掃描器初始化失敗:", error);
        setCameraPermissionDenied(true);
        // 如果相機權限被拒絕，返回上一頁
        router.back();
      }
    };

    // 檢查相機權限
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        // 權限已獲得，初始化掃描器
        initScanner();
      })
      .catch((error) => {
        console.error("相機權限請求失敗:", error);
        setCameraPermissionDenied(true);
        // 如果相機權限被拒絕，返回上一頁
        router.back();
      });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
      }
    };
  }, [router]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue === "新芳春茶行" || inputValue === "demo") {
      router.push("/teahouse");
    }
  };

  // 如果相機權限被拒絕，不渲染頁面內容
  if (cameraPermissionDenied) {
    return null; // 頁面將由router.back()導航離開，不需要渲染內容
  }

  return (
    <div className="h-screen bg-[#C6C3C0] flex flex-col items-center relative overflow-hidden">
      <Head>
        <title>在地人AI導覽系統 - 掃描QR碼</title>
        <meta
          name="description"
          content="掃瞄場域條碼，輕鬆開啟在地人導覽功能"
        />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          /* 解決掃描器閃爍問題的CSS */
          #reader video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          #reader {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          #reader__scan_region {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 300px;
          }
          #reader__scan_region img {
            opacity: 0.6 !important;
            position: absolute !important;
            z-index: 1 !important;
          }
          #reader__dashboard {
            padding: 10px 0 !important;
          }
          #reader__dashboard_section_swaplink {
            display: none !important;
          }
        `}</style>
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

      <main className="flex flex-col items-center w-full h-[65vh] pt-16">
        {scanResult ? (
          <div className="text-center p-4 bg-white rounded-lg shadow-md">
            <p className="font-semibold">掃描成功!</p>
            <p className="break-all">結果: {scanResult}</p>
            {isUrl(scanResult) && (
              <p className="text-blue-500 mt-2">已在新分頁中開啟網址</p>
            )}
            <button
              onClick={() => {
                setScanResult(null);
                // 重新初始化掃描器
                scannerInitialized.current = false;
                setTimeout(() => {
                  const viewportWidth = window.innerWidth;
                  const viewportHeight = window.innerHeight * 0.65;
                  const qrboxSize =
                    Math.min(viewportWidth, viewportHeight) * 0.8;

                  const config = {
                    qrbox: {
                      width: qrboxSize,
                      height: qrboxSize,
                    },
                    fps: 10,
                    rememberLastUsedCamera: true,
                    aspectRatio: 1,
                  };

                  const scanner = new Html5QrcodeScanner(
                    "reader",
                    config,
                    false
                  );
                  scannerRef.current = scanner;
                  scannerInitialized.current = true;
                  scanner.render(
                    (text, result) => {
                      setScanResult(text);
                      scanner.clear();

                      // 檢查掃描結果是否為URL
                      if (isUrl(text)) {
                        // 如果是URL，則在新窗口中打開
                        window.open(text, "_blank");
                      }
                    },
                    () => {}
                  );
                }, 300);
              }}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              重新掃描
            </button>
          </div>
        ) : (
          <div id="reader" className="w-full h-full overflow-hidden"></div>
        )}
      </main>

      <div className="bg-[#FFFFFF] rounded-t-2xl p-5 w-full mt-auto">
        <p className="font-inter font-normal text-xl leading-[1.5em] tracking-widest text-center text-black max-w-[390px] mx-auto mb-4">
          將 QR code 置於方框中掃描
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center max-w-[390px] mx-auto"
        >
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="輸入「新芳春茶行」或「demo」"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            前往導覽
          </button>
        </form>
      </div>
    </div>
  );
}
