import React, { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import ChatContent from "../components/ChatContent";
import styles from "../styles/GuideChat.module.css";

export default function GuideChat() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    {
      id: "1",
      content: "您好，我是茶農阿伯，很高興為您導覽！請問有什麼想了解的嗎？",
      type: "guide",
      timestamp: new Date(Date.now() - 5 * 60000),
    },
    {
      id: "2",
      content: "您好阿伯，我想了解關於茶葉的歷史",
      type: "user",
      timestamp: new Date(Date.now() - 4 * 60000),
    },
    {
      id: "3",
      content:
        "好的！茶葉在台灣有非常深厚的歷史。在清朝時期，台灣茶葉就已經開始出口到世界各地，特別是文山包種茶和烏龍茶。這裡的土壤和氣候非常適合茶樹生長。",
      type: "guide",
      timestamp: new Date(Date.now() - 3 * 60000),
    },
    {
      id: "4",
      content: "那麼製茶過程是怎樣的呢？",
      type: "user",
      timestamp: new Date(Date.now() - 2 * 60000),
    },
    {
      id: "5",
      content:
        "製茶過程主要包括採摘、萎凋、揉捻、發酵和烘焙這幾個步驟。不同種類的茶葉，在發酵程度上有所不同。例如，綠茶是不發酵的，烏龍茶是半發酵，而紅茶則是全發酵的。",
      type: "guide",
      timestamp: new Date(Date.now() - 1 * 60000),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleMenu = () => {
    router.push("/index");
  };

  const handleStop = () => {
    router.push("/guide-end");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // 新增用戶訊息
    const userMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      type: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setNewMessage("");

    // 模擬導覽員回覆
    setTimeout(() => {
      const guideMessage = {
        id: (Date.now() + 1).toString(),
        content: `我了解您對"${newMessage.trim()}"的興趣。在茶葉文化中，這是一個非常有趣的方面。讓我為您詳細解說...`,
        type: "guide",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, guideMessage]);
    }, 1000);
  };

  return (
    <Layout
      title="在地人AI導覽 - 即時對話"
      handleMenu={handleMenu}
      handleStop={handleStop}
    >
      {/* 聊天內容區域 */}
      <div className={styles.chatContentWrapper}>
        <ChatContent messages={messages} />
      </div>

      {/* 輸入框區域 */}
      <form className={styles.inputContainer} onSubmit={handleSendMessage}>
        <input
          type="text"
          className={styles.messageInput}
          placeholder="輸入您的問題..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className={styles.sendButton}>
          <img
            src="/images/all/icon-send.svg"
            alt="發送"
            className={styles.sendIcon}
          />
        </button>
      </form>
    </Layout>
  );
}
