import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import MenuButton from "../components/MenuButton";
import BackButton from "../components/BackButton";

const AttendeePage = () => {
  const router = useRouter();

  const handleSelectGroup = () => {
    // 導向導覽模式選擇頁面
    router.push("/navigation-mode");
  };

  const handleSelectIndividual = () => {
    // 導向導覽模式選擇頁面
    router.push("/navigation-mode");
  };

  const handleMenu = () => {
    router.push("/");
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen w-full bg-[#EFEBE6] flex flex-col items-center">
      <Head>
        <title>確認導覽人數 - 在地人AI導覽</title>
        <meta name="description" content="選擇導覽人數" />
      </Head>

      <main className="flex flex-col items-center w-full max-w-md px-4 py-8">
        {/* 導航欄 */}
        <div className="w-full flex justify-between px-4 mb-8">
          <MenuButton onClick={handleMenu} />
          <BackButton onClick={handleBack} />
        </div>

        {/* 標題部分 */}
        <div className="flex items-center mb-12 mt-6">
          <h1 className="text-3xl font-bold tracking-wider">確認導覽人數</h1>
          <div className="ml-1 w-6 h-6 flex items-center justify-center">
            <Image
              src="/images/all/question_icon.svg"
              alt="問號圖標"
              width={25}
              height={25}
            />
          </div>
        </div>

        {/* 選項部分 */}
        <div className="flex flex-col gap-20 items-center w-full">
          {/* 團體選項 */}
          <div
            className="flex flex-col items-center"
            onClick={handleSelectGroup}
          >
            <div className="w-[154px] h-[154px] border-4 border-black rounded-xl bg-white/80 flex items-center justify-center mb-3 shadow-[0px_2px_12px_0px_rgba(102,102,102,0.15)]">
              <div className="relative w-[100px] h-[100px]">
                <Image
                  src="/images/all/group_icon.svg"
                  alt="團體選項"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-[0.28em]">團 體</span>
          </div>

          {/* 個人選項 */}
          <div
            className="flex flex-col items-center"
            onClick={handleSelectIndividual}
          >
            <div className="w-[154px] h-[154px] border-4 border-black rounded-xl bg-white/80 flex items-center justify-center mb-3 shadow-[0px_2px_12px_0px_rgba(102,102,102,0.15)]">
              <div className="relative w-[58px] h-[77px]">
                <Image
                  src="/images/all/individual_icon.svg"
                  alt="個人選項"
                  width={58}
                  height={77}
                  className="object-contain"
                />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-[0.28em]">個 人</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendeePage;
