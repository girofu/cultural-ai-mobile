import React, { useRef, useEffect } from "react";
import styles from "../styles/ChatContent.module.css";

// 聊天消息類型定義:
// {
//   id: string,
//   content: string,
//   type: 'user' | 'guide', // 用戶或導覽員
//   timestamp: Date
// }

export default function ChatContent({ messages = [], onScroll }) {
  const contentRef = useRef(null);

  // 當消息列表更新時，滾動到底部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [messages]);

  // 處理滾動事件
  const handleScroll = (e) => {
    if (onScroll) {
      onScroll(e);
    }
  };

  // 格式化時間
  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={styles.chatContainer}
      ref={contentRef}
      onScroll={handleScroll}
    >
      {messages.length > 0 ? (
        messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.messageItem} ${
              message.type === "user" ? styles.userMessage : styles.guideMessage
            }`}
          >
            <div className={styles.messageContent}>{message.content}</div>
            <div className={styles.messageTime}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))
      ) : (
        <div className={styles.emptyMessage}>
          開始聊天吧！用上下滾動來查看歷史訊息。
        </div>
      )}
    </div>
  );
}
