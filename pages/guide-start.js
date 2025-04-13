import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import styles from "../styles/GuideStart.module.css";
import TypingEffect from "../components/TypingEffect";

export default function GuideStart() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "阿～您好！\n\n我是茶農阿伯，有超過50年製茶經驗喔。\n\n今天我要帶您了解茶葉的世界。\n\n我們有四個主題可以聊：\n\n1. 台灣木製出口茶箱\n2. 40~80年代製茶工具\n3. 茶葉的秤重與標價\n4. 包種茶的介紹\n\n您對哪個主題比較有興趣呢？\n\n隨時告訴我，阿伯很樂意為您解說喔！",
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
        body: JSON.stringify({ messages: updatedMessages }),
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
