import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { messages } = req.body; // 預期前端會傳送 messages 陣列

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error:
          "Messages are required in the request body and should be a non-empty array.",
      });
    }

    // 基本的對話請求
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 或者您想使用的其他模型，例如 "gpt-4"
      messages: messages, // 將從前端收到的對話歷史傳給 OpenAI
    });

    // 從 OpenAI 回應中提取 AI 的訊息
    const assistantMessage = completion.choices[0]?.message;

    if (!assistantMessage) {
      console.error("OpenAI response did not contain a message:", completion);
      return res
        .status(500)
        .json({ error: "Failed to get a valid response from AI." });
    }

    res.status(200).json({ message: assistantMessage });
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
