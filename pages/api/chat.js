import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 導覽內容
const guideContent = {
  intro:
    "我是茶農阿伯，有超過50年製茶經驗喔。\n\n今天我要帶您了解茶葉的世界，我們有四個主題可以聊：\n\n1. 台灣木製出口茶箱\n2. 40~80年代製茶工具\n3. 茶葉的秤重與標價\n4. 包種茶的介紹\n\n您想先從哪個開始呢？",

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
};

// 茶農阿伯的角色設定
const teaFarmerPrompt = `您是一位在地老茶農阿伯，有超過50年製茶經驗。請您以親切、溫暖且充滿台灣鄉土味的口吻分享茶葉知識。
您說話時應該:
- 使用台灣長輩常用的表達方式，如「阿～」、「喔～」等語助詞
- 分享您多年來的製茶心得和小秘訣
- 使用具體、生動的例子來解釋複雜概念
- 偶爾提及自然和山林的智慧
- 保持謙遜且樂於分享的態度

您的回應格式應該:
- 將長段落分成短的組句（2-4句一組）
- 每個組句之間增加空行，提高可讀性
- 使用列表格式呈現關鍵點，如製茶流程步驟、茶葉等級評判標準、包種茶產地和特點等
- 適當斷句，避免一行太長
- 加強視覺層次，便於用戶閱讀和理解

您要執行一個固定的導覽流程，包含以下四個主題：
1. 台灣木製出口茶箱的歷史與保存茶葉香氣的方法
2. 40~80年代的製茶工具與製茶流程介紹
3. 茶葉的秤重與標價日常
4. 包種茶的說明，包含包種茶是烏龍茶的一種

導覽規則：
- 首次對話時，介紹您自己並說明有這四個主題可以導覽
- 完成一個主題後，詢問用戶是否有問題或想進入下一個主題
- 當用戶表示"完成"、"下一個"、"繼續"等意向時，按順序進入下一個主題
- 如果用戶明確指定要了解某個主題，直接跳轉到該主題
- 回答用戶的問題時，用您的專業知識結合上述導覽內容進行回答

請維持這個角色，不要表明您是AI，而是以茶農阿伯的身份回應所有問題。`;

// 用於追蹤當前導覽狀態的變數
let currentGuideState = {
  currentTopic: "intro", // 當前主題：intro, teaBox, teaTools, teaWeighing, oolongTea
  completedTopics: [], // 已完成的主題
  conversationHistory: [], // 對話歷史
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { messages, resetHistory } = req.body;

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

    // 如果歷史為空，添加系統訊息
    if (currentGuideState.conversationHistory.length === 0) {
      currentGuideState.conversationHistory.push({
        role: "system",
        content: teaFarmerPrompt,
      });

      // 初始提示也加入導覽內容
      currentGuideState.conversationHistory.push({
        role: "system",
        content: `這是導覽內容，根據用戶的互動提供相應資訊：
        ${JSON.stringify(guideContent)}
        當用戶首次連接時，請從intro開始。每完成一個主題後詢問用戶是否有問題，當用戶表示要繼續時，按順序進行下一主題。如果用戶明確指定某主題，直接跳到該主題。`,
      });
    }

    // 將新訊息添加到歷史中
    const userMessage = messages[messages.length - 1];
    if (userMessage && userMessage.role === "user") {
      currentGuideState.conversationHistory.push(userMessage);

      // 分析用戶訊息，判斷是否需要切換主題
      const userText = userMessage.content.toLowerCase();

      // 檢查是否要切換到特定主題
      if (
        userText.includes("茶箱") ||
        userText.includes("出口茶箱") ||
        userText.includes("木製茶箱")
      ) {
        currentGuideState.currentTopic = "teaBox";
      } else if (
        userText.includes("製茶工具") ||
        userText.includes("製茶流程")
      ) {
        currentGuideState.currentTopic = "teaTools";
      } else if (userText.includes("秤重") || userText.includes("標價")) {
        currentGuideState.currentTopic = "teaWeighing";
      } else if (userText.includes("包種茶") || userText.includes("烏龍茶")) {
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
        const topics = [
          "intro",
          "teaBox",
          "teaTools",
          "teaWeighing",
          "oolongTea",
        ];
        const currentIndex = topics.indexOf(currentGuideState.currentTopic);
        if (currentIndex < topics.length - 1) {
          currentGuideState.currentTopic = topics[currentIndex + 1];
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
