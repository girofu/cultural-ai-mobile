/**
 * Epson 授權回調頁面
 * 接收 Epson Connect 授權後的重定向，並引導用戶回到主 API 測試頁面
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function PrinterCallback() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // 獲取授權碼
    const authCode = router.query.code;
    if (authCode) {
      setCode(authCode);

      // 短暫延遲後自動跳轉回測試頁面，並帶上授權碼
      const timer = setTimeout(() => {
        setRedirecting(true);
        router.push({
          pathname: "/printer-api-client",
          query: { code: authCode },
        });
      }, 3000); // 3秒後跳轉

      return () => clearTimeout(timer);
    }
  }, [router.query.code, router]);

  return (
    <>
      <Head>
        <title>授權成功 - Epson 連接</title>
        <meta name="description" content="Epson Connect 授權回調頁面" />
      </Head>

      <div className="container mx-auto p-8 max-w-lg">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="mb-4">
            {code ? (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  授權成功！
                </h1>
                <p className="text-gray-600 mb-4">已獲取授權碼</p>

                <div className="bg-gray-100 p-3 rounded-lg mb-4">
                  <p className="text-sm font-mono break-all">{code}</p>
                </div>

                {redirecting ? (
                  <p className="text-gray-600">正在跳轉回測試頁面...</p>
                ) : (
                  <p className="text-gray-600">3秒後自動跳轉回測試頁面</p>
                )}
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  等待授權
                </h1>
                <p className="text-gray-600">
                  未收到授權碼，請檢查您的授權流程
                </p>
              </>
            )}
          </div>

          <button
            onClick={() => router.push("/printer-api-client")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
          >
            返回測試頁面
          </button>
        </div>
      </div>
    </>
  );
}
