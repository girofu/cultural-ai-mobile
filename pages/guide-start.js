import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/GuideStart.module.css";
import TypingEffect from "../components/TypingEffect";

export default function GuideStart() {
  const router = useRouter();
  const { mode } = router.query;
  const isExploreMode = mode === "explore";

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: isExploreMode
        ? "阿～您好！\n\n我是茶農阿伯，有超過50年製茶經驗，同時也是新芳春茶行的資深導覽員。\n\n很高興今天能跟您聊聊茶葉和新芳春茶行的事情！\n\n您有什麼想了解的嗎？可以問我關於茶葉、茶文化、製茶流程或是新芳春茶行的任何問題喔！"
        : "阿～您好！\n\n我是茶農阿伯，有超過50年製茶經驗喔，同時也是新芳春茶行的資深導覽員。\n\n今天我要帶您了解新芳春茶行和茶葉的世界，我們有九個主題可以聊：\n\n1. 參觀資訊（開放時間、收費說明、特殊服務項目）\n2. 新芳春茶行的歷史\n3. 建築特色與空間配置\n4. 茶葉工廠介紹（揀梗間、風選間、焙茶間）\n5. 新芳春製茶流程\n6. 台灣木製出口茶箱\n7. 40~80年代製茶工具\n8. 茶葉的秤重與標價\n9. 包種茶的介紹\n\n您想先從哪個開始呢？可以直接說出主題名稱或輸入編號(1-9)喔！",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const dialogueEndRef = useRef(null);
  const dialogueContainerRef = useRef(null);

  useEffect(() => {
    if (dialogueEndRef.current) {
      dialogueEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleMenu = () => {
    router.push("/");
  };

  const handleStop = () => {
    router.push("/guide-end");
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const newUserMessage = { role: "user", content: messageText };
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          exploreMode: isExploreMode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      const assistantMessage = data.message;

      if (assistantMessage && assistantMessage.content) {
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } else {
        throw new Error("Invalid response structure from API.");
      }
    } catch (error) {
      console.error("Failed to send message or get response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: `抱歉，發生錯誤：${error.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      title="在地人AI導覽 - 開始導覽"
      handleMenu={handleMenu}
      handleStop={handleStop}
      onSendMessage={handleSendMessage}
    >
      <div className={styles.dialogueContainer} ref={dialogueContainerRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${styles[msg.role + "Message"]}`}
          >
            {msg.role === "assistant" ? (
              <TypingEffect text={msg.content} />
            ) : (
              msg.content
            )}
          </div>
        ))}
        <div ref={dialogueEndRef} />
      </div>
    </Layout>
  );
}
