import React, { useState, useEffect } from "react";

function TypingEffect({ text = "", speed = 50, onComplete }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText(""); // Reset when text changes
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      // Cleanup function
      return () => clearTimeout(timer);
    } else if (
      currentIndex === text.length &&
      displayedText.length === text.length
    ) {
      // Optionally call a callback when typing is complete
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, displayedText, onComplete]); // Add displayedText and onComplete to dependencies

  return <>{displayedText}</>; // Use Fragment to avoid extra div
}

export default TypingEffect;
