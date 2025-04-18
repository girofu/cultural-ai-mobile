import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 導覽內容
const guideContent = {
  intro:
    "我是茶農阿伯，有超過50年製茶經驗喔，同時也是新芳春茶行的資深導覽員。\n\n今天我要帶您了解新芳春茶行和茶葉的世界，我們有九個主題可以聊：\n\n1. 參觀資訊（開放時間、收費說明、特殊服務項目）\n2. 新芳春茶行的歷史\n3. 建築特色與空間配置\n4. 茶葉工廠介紹（揀梗間、風選間、焙茶間）\n5. 新芳春製茶流程\n6. 台灣木製出口茶箱\n7. 40~80年代製茶工具\n8. 茶葉的秤重與標價\n9. 包種茶的介紹\n\n您想先從哪個開始呢？可以直接說出主題名稱或輸入編號(1-9)喔！",

  teaBox: `台灣木製出口茶箱的歷史可以追溯到日治時期喔～那時候阿伯我還沒出生呢！

這些茶箱可是我們台灣茶外銷的重要容器啊。

這些木製茶箱通常是用檜木或是杉木製作的，為什麼要用這些木材呢？

因為這些木頭本身就有天然的香氣，而且防蟲、防潮的效果非常好。茶葉最怕的就是受潮和蟲害啊！

箱子的結構也很講究，四角用榫接合，非常堅固。

內部還會用錫箔紙襯底，這樣可以防止茶葉直接接觸木材，同時又能保持箱內的乾燥度。

錫箔紙還能隔絕外部氣味，讓茶葉不會吸收到其他氣味。

最重要的是，這種木箱在長途運輸過程中，木材會慢慢釋放香氣，和茶葉的香氣相互融合。

茶葉到達目的地時，香氣反而更加豐富了！這就是為什麼老外那麼喜歡我們台灣茶的原因之一啊。

您對台灣木製出口茶箱還有什麼想了解的嗎？

或者我們可以進入下一個主題了？`,

  teaTools: `40到80年代的製茶工具喔，那可是阿伯年輕時的回憶啊！

這段時間正是台灣製茶業從傳統走向現代化的過渡期。

早期我們用的是傳統的竹製萎凋架，茶菁採摘回來後，要先鋪在竹架上萎凋。

讓茶葉水分蒸發，軟化葉子。阿伯小時候，家裡茶廠整排的萎凋架鋪滿茶葉，那個茶香四溢的畫面，現在想起來還是很懷念啊！

接著要進行搖青，以前都是用手工竹籃搖青，搖到手都酸了！

到了60年代左右，開始有機械搖青機，效率提高了不少。搖青是為了破壞細胞組織，促進茶葉內部物質的氧化。

再來是發酵，要控制好時間，這全靠師傅的經驗。

看茶葉的顏色、聞香氣來判斷。

然後就是炒菁、揉捻。

炒菁以前用大鐵鍋，後來改用滾筒式的炒菁機。

揉捻則從人工揉捻發展到機械揉捻機，目的是讓茶葉捲曲成條狀。

最後是乾燥，從竹筍籠慢慢烘焙，到後來用烘乾機，溫度控制更加精準了。

整個製茶流程就是：
萎凋 → 搖青 → 發酵 → 炒菁 → 揉捻 → 乾燥

每一步驟都會影響茶葉的品質和風味啊！

您對製茶工具或流程還有什麼疑問嗎？

或者要聽下一個主題？`,

  teaWeighing: `茶葉的秤重與標價，這可是茶農的日常啊！

以前我們用的是傳統的桿秤，後來才改用精密電子秤。

茶葉的價格是根據等級來定的，而等級主要看四個方面：
1. 外形
2. 香氣
3. 滋味
4. 湯色

阿伯我年輕時，每次採收季節結束，鄰近茶農都會聚在一起品茶評級。

互相交流心得。

最高級的茶葉，茶芽完整，色澤均勻，香氣高揚持久，滋味甘醇回甘。

這種茶一斤可以賣到幾千元甚至上萬元！中低等級的茶葉，可能只有幾百元一斤。

標價時還要考慮季節因素，春茶通常最貴。

因為冬去春來，茶樹積蓄了豐富的養分。

夏茶生長快但品質較差，價格就低一些。

秋茶則介於兩者之間。

以前要賣茶，茶農都是自己騎機車載著茶樣到處拜訪茶商，討價還價一番才能成交。

現在好多了，有些茶農都開始網路直銷了呢！

您對茶葉的秤重標價還有什麼想了解的嗎？

或者我們可以進入下一個主題？`,

  oolongTea: `包種茶確實是烏龍茶的一種喔！

烏龍茶是半發酵茶，而包種茶的發酵度在12%~18%之間，屬於輕發酵烏龍茶。

包種茶的由來有個有趣的傳說。

相傳清朝時期，有位茶商將茶葉用紙包好寄給朋友品嚐，朋友打開後發現茶葉特別香。

就問這是什麼茶，茶商隨口說是"包著的種茶"，後來就叫"包種茶"了。

包種茶主要產於台灣北部，像是：
1. 文山
2. 新店
3. 坪林
這些地方。

它的特點是：
- 香氣清揚持久
- 滋味甘醇鮮爽
- 湯色金黃明亮

沖泡後有明顯的花香，像是茉莉花或是桂花的香氣，這是其他烏龍茶比較少見的特色。

製作包種茶的流程和一般烏龍茶相似，但萎凋和發酵時間較短。

保留了更多的鮮爽風味。傳統包種茶還會進行輕微的烘焙，增加茶湯的甘甜感。

現在很多年輕人喜歡喝高山烏龍茶，但阿伯我還是偏愛包種茶那股清香呢！

每天早上泡一壺，精神就來了！

您對包種茶還有什麼想了解的嗎？

或者我們已經完成了所有的導覽內容，您有什麼整體的問題想問嗎？`,

  // 新增新芳春茶行的資料
  visitInfo: `來到新芳春茶行參觀，阿伯要先跟您說明一下基本資訊喔！

開放時間是週三到週日，早上10點到下午6點。週一跟週二休館，要特別注意喔！

參觀完全免費，不用花一毛錢！這麼珍貴的茶文化資產，能夠免費讓大家了解真是太好了。

如果您有行動不便的親友，不用擔心。新芳春有提供完善的無障礙設施，包含昇降設備和無障礙廁所。

館內還有服務台、輪椅、休息座椅，甚至還有哺乳室，非常貼心！

參觀的時候，不妨花點時間欣賞這棟古蹟建築的美，感受一下以前大稻埕茶業的繁榮風光。

您有什麼特別想了解的嗎？或者要聽聽新芳春茶行的歷史故事？`,

  teaHouseHistory: `新芳春茶行的歷史可以追溯到1860年代喔！那時台灣開港通商後，大稻埕變成了台灣商品外銷到國際的商業中心。

茶葉和樟腦都是從大稻埕集散，再經由大稻埕碼頭航向世界各地。

坐落在台北市民生西路的新芳春茶行，正是承載著這段茶業黃金歲月的珍貴古蹟。

它是在1934年興建的，融合了東西方特色的住商混合洋樓，見證了台灣茶業的興衰起落。

新芳春茶行的創始人是從福建安溪來的王芳群，那是1913年的事情了。他和兒子王連河來到台灣，在大稻埕的「珍春茶行」內經營「芳春茶行」，主要出口包種茶到南洋。

後來因為福建的治安不好，1918年王家舉家遷來台灣，隔年就結束與「珍春茶行」的合夥關係，買下了現在民生西路這塊地。

到了1927年，王連河接手家業，1932年成立了「合資會社新芳春茶行」。為了紀念父親的舊業，取名沿用「芳春」二字，又加上「新」字做區別，所以就叫「新芳春」啦！

1934年建築完工後，是當時台北最大的茶工廠之一，非常氣派！

後來在1948年，王連河還憑著精緻的烏龍茶獲得全省比賽第三名的好成績呢！

茶行在1950年改組為「新芳春茶行兩合公司」，1954年登記為進出口貿易商，生意做得很大。

到了1974年，第三代王國忠接手，可惜隔年王連河就過世了。

到了1980年代，因為台灣茶葉外銷規模縮減，新芳春茶行將一樓店面出租給傢俱行。2004年才正式結束製茶事業。

2005年台北市政府將新芳春茶行登錄為歷史建築，2009年更升格為市定古蹟。經過修復後，2016年正式對外開放，成為見證大稻埕茶業發展的重要場所。

2021年，新芳春茶行老主人王國忠辭世，為這段歷史畫下句點。

您對新芳春茶行還有什麼想了解的嗎？或者想聽聽這棟建築有什麼特色？`,

  buildingFeatures: `新芳春茶行這棟建築可有許多精彩的小細節值得慢慢欣賞喔！

先來看看屋頂上的女兒牆，這是屋頂欄杆邊牆的通稱，古時候稱為女牆。新芳春茶行正立面頂樓的女兒牆上有劍屏造型的泥塑作品，就像劍的屏風。

早期這些裝飾都是建材商用模具生產販售的商品。修復時，師傅需要臨摹舊有劍屏的弧度與曲線，才能還原過去氣派又典雅的風味，相當不容易啊！

再來看一樓的石牆，那裡以前是茶葉暫放的地方。牆面使用了唭哩岸岩，早期兩個房間內的木板可以抬起，底下放著鐵板，這樣可以保持茶葉的乾燥。

穿過茶行，經過帳房，就能看到日月天井。這裡有一道寬闊的紅磚牆，上面裝飾著像竹節般的陶製排水管，我們叫它「竹節落水管」，象徵著節節高升，生意興隆！

仔細看那些紅磚牆，你會發現有些磚塊上面印有「TR」和「S」字樣。「TR」磚是由台灣煉瓦株式會社製造的，「S」磚則是由英商撒木耳煉瓦會社製造的。這兩種磚材共同使用，是很特別的歷史痕跡。

另外，竹節水管的段數是單數，因為在傳統風水中，單數代表陽數，有興旺發達的寓意！

您對建築特色還有什麼想了解的嗎？或者想聽聽茶葉工廠的部分？`,

  teaFactory: `新芳春茶行可是兼具了多種功能的建築，包含「精製茶工廠」、「茶行」、「倉庫」和「住宅」四種用途喔！

先來說說揀梗間吧！這裡有兩台構造相同的撿梗機，是茶葉精製加工中很重要的設備。

毛茶經過切茶機將茶葉與茶梗切開後，會倒入撿梗機，藉由皮帶與皮帶輪連接總動力源，讓上下兩層箱體前後、反向擺動，這樣就能讓茶葉和梗、雜質分離。

茶梗與雜質會順著溝槽往下走，茶葉則會從孔洞掉到下一層，達到初步撿梗的效果。過濾完後，還會讓撿梗女工檢查、挑選，做為第二道防線，確保茶葉品質。

揀選工作主要由女性擔任，在當時除了提供女性難得的工作機會外，揀茶大廳也是地方婦女重要的交誼中心呢！

再來看看風選間，這裡有一台被視為新芳春茶行鎮館之寶的大型風選機！這可是大稻埕保存最大的茶葉風選機器！

風選機的原理很有趣，利用風力對茶葉按照輕重進行選別，將茶葉分級。茶葉完整與否其實不影響味道，主要是為了銷售時的美觀。

最後是焙茶間，這裡保存了傳統的烘焙用焙籠。茶葉烘焙可以去除水分和雜味，改善茶葉的香氣品質。

傳統上是在焙爐裡放入燒紅的木炭和灰燼，再將裝有茶葉的焙籠放在焙爐上進行烘焙。工人們需要不時交換竹籠位置，以確保溫度均勻。

你能想像當時工人們在悶熱的環境下工作的情景嗎？整個空間裡溫度很高，加上繁瑣的程序，工人們就像在三溫暖中工作一樣，全身都是汗水！

這需要相當的人力和調整溫度的專業技術。雖然現在也有電焙籠、箱式烘焙機等無火烘焙方式，但傳統人工烘焙仍有其在口味品質上的獨特優勢。

您想更深入了解製茶流程嗎？或有什麼其他問題？`,

  teaProcess: `來到新芳春茶行，我們可以看到完整的製茶流程展示喔！初製成毛茶的茶葉送到大稻埕的加工廠後，會經過哪些程序呢？

首先是揀梗！由於茶葉初步生產的毛茶都帶有茶梗，茶行會先用機器將多餘的雜質揀除，淨化茶葉品質。之後還要再以人工操作進行細緻的篩選，讓茶葉品質更加乾淨。

接著是焙火環節。揀選完的茶葉會在焙籠間利用炭火完成烘焙。想像一下，一個個竹編的「焙籠」放在滿地紅磚圍成的「焙籠窟」上，採茶工人日以繼夜地進行燒炭、翻籠作業，才能焙出獨特風味的茶葉。

然後進行風選處理。茶葉在完成焙火後，會送到風選間利用風選機進行分類，這是精製茶的最後一個步驟。風選是借由風力，依重量不同區分出完整茶葉以及破碎茶葉。記住喔，茶葉完整與否不影響味道，僅做為銷售美觀用途。

最後就是包裝出貨了！香氣豐沛又完整美觀的包種茶製作好了，接下來會依茶葉品質進行包裝，放入設計精美的茶罐內，出貨到東南亞各國。

這整個流程展現了傳統製茶的精湛工藝，每一個步驟都是茶農們的心血結晶啊！

您對新芳春茶行的製茶流程還有什麼想了解的嗎？或者有其他方面想聽聽看？`,
};

// 茶農阿伯的角色設定
const teaFarmerPrompt = `您是一位在地老茶農阿伯，有超過50年製茶經驗，同時也是新芳春茶行的資深導覽員。請您以親切、溫暖且充滿台灣鄉土味的口吻分享茶葉知識和新芳春茶行的歷史文化。
您說話時應該:
- 使用台灣長輩常用的表達方式，如「阿～」、「喔～」等語助詞
- 分享您多年來的製茶心得和小秘訣
- 使用具體、生動的例子來解釋複雜概念
- 偶爾提及自然和山林的智慧
- 保持謙遜且樂於分享的態度
- 使用口語的方式表達
- 避免使用書面語
- 使用台灣特有的語言和用詞
- 使用台灣特有的習慣用語
- 使用台灣特有的諺語
- 使用台灣特有的俗語

您的回應格式應該:
- 將長段落分成短的組句（2-4句一組）
- 每個組句之間增加空行，提高可讀性
- 使用列表格式呈現關鍵點，如製茶流程步驟、茶葉等級評判標準、包種茶產地和特點等
- 適當斷句，避免一行太長
- 加強視覺層次，便於用戶閱讀和理解

您要執行一個固定的導覽流程，包含以下九個主題：
1. 參觀資訊（開放時間、收費說明、特殊服務項目）
2. 新芳春茶行的歷史
3. 建築特色、空間配置、小故事
4. 茶葉工廠介紹（揀梗間、風選間、焙茶間）
5. 新芳春製茶流程
6. 台灣木製出口茶箱的歷史與保存茶葉香氣的方法
7. 40~80年代的製茶工具與製茶流程介紹
8. 茶葉的秤重與標價日常
9. 包種茶的說明，包含包種茶是烏龍茶的一種

導覽規則：
- 首次對話時，介紹您自己並說明有這九個主題可以導覽
- 完成一個主題後，詢問用戶是否有問題或想進入下一個主題
- 當用戶表示"完成"、"下一個"、"繼續"等意向時，按順序進入下一個主題
- 如果用戶明確指定要了解某個主題，直接跳轉到該主題
- 回答用戶的問題時，用您的專業知識結合上述導覽內容進行回答

請維持這個角色，不要表明您是AI，而是以茶農阿伯的身份回應所有問題。`;

// 用於追蹤當前導覽狀態的變數
let currentGuideState = {
  currentTopic: "intro", // 當前主題：intro, visitInfo, teaHouseHistory, buildingFeatures, teaFactory, teaProcess, teaBox, teaTools, teaWeighing, oolongTea
  completedTopics: [], // 已完成的主題
  conversationHistory: [], // 對話歷史
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { messages, resetHistory, exploreMode } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error:
          "Messages are required in the request body and should be a non-empty array.",
      });
    }

    // 檢查是否要重置對話歷史
    if (resetHistory) {
      currentGuideState = {
        currentTopic: "intro",
        completedTopics: [],
        conversationHistory: [],
      };
    }

    // 自由探索模式的系統提示
    const freeExplorePrompt = `您是一位在地老茶農阿伯，有超過50年製茶經驗，同時也是新芳春茶行的資深導覽員。請您以親切、溫暖且充滿台灣鄉土味的口吻分享茶葉知識和新芳春茶行的歷史文化。
您說話時應該:
- 使用台灣長輩常用的表達方式，如「阿～」、「喔～」等語助詞
- 分享您多年來的製茶心得和小秘訣
- 使用具體、生動的例子來解釋複雜概念
- 偶爾提及自然和山林的智慧
- 保持謙遜且樂於分享的態度
- 使用口語的方式表達

您的回應格式應該:
- 將長段落分成短的組句（2-4句一組）
- 每個組句之間增加空行，提高可讀性
- 使用列表格式呈現關鍵點
- 適當斷句，避免一行太長
- 加強視覺層次，便於用戶閱讀和理解

您是開放式對話的導覽員，不需要固定的導覽流程。您可以根據用戶的問題自由回答關於茶葉、製茶、新芳春茶行歷史、台灣茶文化等任何相關話題。當用戶問到您不熟悉的領域時，您可以坦承不知道，或引導用戶回到您熟悉的茶葉話題上。

請維持這個角色，不要表明您是AI，而是以茶農阿伯的身份回應所有問題。您可以使用導覽內容中的資訊來回答特定問題，但不需要強制按照固定順序進行導覽。`;

    // 如果歷史為空，添加系統訊息
    if (currentGuideState.conversationHistory.length === 0) {
      // 根據模式選擇提示語
      const systemPrompt = exploreMode ? freeExplorePrompt : teaFarmerPrompt;

      currentGuideState.conversationHistory.push({
        role: "system",
        content: systemPrompt,
      });

      // 添加導覽內容，但在自由探索模式下不強制按順序
      currentGuideState.conversationHistory.push({
        role: "system",
        content: `這是導覽內容，${
          exploreMode
            ? "根據用戶的需求提供相應資訊"
            : "根據用戶的互動提供相應資訊"
        }：
        ${JSON.stringify(guideContent)}
        ${
          exploreMode
            ? "不需要按照固定順序進行導覽，請根據用戶的問題自由回答。"
            : "當用戶首次連接時，請從intro開始。每完成一個主題後詢問用戶是否有問題，當用戶表示要繼續時，按順序進行下一主題。如果用戶明確指定某主題，直接跳到該主題。"
        }`,
      });

      // 設置自由探索模式的初始歡迎訊息
      if (exploreMode) {
        currentGuideState.conversationHistory.push({
          role: "assistant",
          content:
            "阿～您好！\n\n我是茶農阿伯，有超過50年製茶經驗，同時也是新芳春茶行的資深導覽員。\n\n很高興今天能跟您聊聊茶葉和新芳春茶行的事情！\n\n您有什麼想了解的嗎？可以問我關於茶葉、茶文化、製茶流程或是新芳春茶行的任何問題喔！",
        });
      }
    }

    // 將新訊息添加到歷史中
    const userMessage = messages[messages.length - 1];
    if (userMessage && userMessage.role === "user") {
      currentGuideState.conversationHistory.push(userMessage);

      // 只在非自由探索模式下分析用戶訊息，判斷是否需要切換主題
      if (!exploreMode) {
        // 分析用戶訊息，判斷是否需要切換主題
        const userText = userMessage.content.toLowerCase();

        // 定義主題順序和映射
        const topicOrder = [
          "intro",
          "visitInfo", // 1
          "teaHouseHistory", // 2
          "buildingFeatures", // 3
          "teaFactory", // 4
          "teaProcess", // 5
          "teaBox", // 6
          "teaTools", // 7
          "teaWeighing", // 8
          "oolongTea", // 9
        ];

        // 檢查是否包含數字 1-9
        const numberMatch = userText.match(/[1-9]/);
        if (numberMatch) {
          const topicNumber = parseInt(numberMatch[0]);
          if (topicNumber >= 1 && topicNumber <= 9) {
            // 根據數字選擇主題
            currentGuideState.currentTopic = topicOrder[topicNumber];
          }
        }
        // 檢查是否要切換到特定主題
        else if (
          userText.includes("參觀資訊") ||
          userText.includes("開放時間") ||
          userText.includes("收費") ||
          userText.includes("主題1") ||
          userText.includes("主題一")
        ) {
          currentGuideState.currentTopic = "visitInfo";
        } else if (
          userText.includes("歷史") ||
          userText.includes("新芳春的歷史") ||
          userText.includes("茶行歷史") ||
          userText.includes("主題2") ||
          userText.includes("主題二")
        ) {
          currentGuideState.currentTopic = "teaHouseHistory";
        } else if (
          userText.includes("建築特色") ||
          userText.includes("女兒牆") ||
          userText.includes("紅磚牆") ||
          userText.includes("空間配置") ||
          userText.includes("主題3") ||
          userText.includes("主題三")
        ) {
          currentGuideState.currentTopic = "buildingFeatures";
        } else if (
          userText.includes("茶葉工廠") ||
          userText.includes("揀梗間") ||
          userText.includes("風選間") ||
          userText.includes("焙茶間") ||
          userText.includes("主題4") ||
          userText.includes("主題四")
        ) {
          currentGuideState.currentTopic = "teaFactory";
        } else if (
          userText.includes("製茶流程") ||
          userText.includes("新芳春製茶") ||
          userText.includes("主題5") ||
          userText.includes("主題五")
        ) {
          currentGuideState.currentTopic = "teaProcess";
        } else if (
          userText.includes("茶箱") ||
          userText.includes("出口茶箱") ||
          userText.includes("木製茶箱") ||
          userText.includes("主題6") ||
          userText.includes("主題六")
        ) {
          currentGuideState.currentTopic = "teaBox";
        } else if (
          userText.includes("製茶工具") ||
          userText.includes("40~80年代") ||
          userText.includes("主題7") ||
          userText.includes("主題七")
        ) {
          currentGuideState.currentTopic = "teaTools";
        } else if (
          userText.includes("秤重") ||
          userText.includes("標價") ||
          userText.includes("主題8") ||
          userText.includes("主題八")
        ) {
          currentGuideState.currentTopic = "teaWeighing";
        } else if (
          userText.includes("包種茶") ||
          userText.includes("烏龍茶") ||
          userText.includes("主題9") ||
          userText.includes("主題九")
        ) {
          currentGuideState.currentTopic = "oolongTea";
        } else if (
          (userText.includes("下一個") ||
            userText.includes("繼續") ||
            userText.includes("下一題") ||
            userText.includes("完成") ||
            userText.includes("下一主題")) &&
          currentGuideState.currentTopic !== "intro"
        ) {
          // 用戶想進入下一個主題
          const currentIndex = topicOrder.indexOf(
            currentGuideState.currentTopic
          );
          if (currentIndex < topicOrder.length - 1) {
            currentGuideState.currentTopic = topicOrder[currentIndex + 1];
          }
        }

        // 添加當前主題內容作為系統訊息
        if (
          currentGuideState.currentTopic !== "intro" &&
          !currentGuideState.completedTopics.includes(
            currentGuideState.currentTopic
          )
        ) {
          currentGuideState.conversationHistory.push({
            role: "system",
            content: `請以茶農阿伯的身份分享以下關於${
              currentGuideState.currentTopic
            }的內容：${guideContent[currentGuideState.currentTopic]}`,
          });

          // 標記主題為已完成
          if (
            !currentGuideState.completedTopics.includes(
              currentGuideState.currentTopic
            )
          ) {
            currentGuideState.completedTopics.push(
              currentGuideState.currentTopic
            );
          }
        }
      }
    }

    // 基本的對話請求
    const completion = await openai.chat.completions.create({
      model: "o3-mini", // 或者您想使用的其他模型
      messages: currentGuideState.conversationHistory,
    });

    // 從 OpenAI 回應中提取 AI 的訊息
    const assistantMessage = completion.choices[0]?.message;

    if (!assistantMessage) {
      console.error("OpenAI response did not contain a message:", completion);
      return res
        .status(500)
        .json({ error: "Failed to get a valid response from AI." });
    }

    // 將AI回應添加到歷史中
    currentGuideState.conversationHistory.push(assistantMessage);

    res.status(200).json({
      message: assistantMessage,
      history: currentGuideState.conversationHistory,
    });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    // 區分 OpenAI 特定錯誤和一般錯誤
    if (error instanceof OpenAI.APIError) {
      res
        .status(error.status || 500)
        .json({ error: `OpenAI API Error: ${error.message}` });
    } else if (error.code === "insufficient_quota") {
      res.status(429).json({
        error:
          "OpenAI API quota exceeded. Please check your plan and billing details.",
      });
    } else {
      res.status(500).json({ error: "An internal server error occurred." });
    }
  }
}
