"use client"
import React, { useEffect, useState } from 'react';

interface AnnouncementPopupProps {
  messages: string[];
  duration?: number; // in milliseconds
}

const AnnouncementPopup: React.FC<AnnouncementPopupProps> = ({ messages, duration = 30000 }) => {
  const [visible, setVisible] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current < messages.length && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setCurrent((prev) => prev + 1);
          setVisible(true);
        }, 300); // short fade between messages
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [current, duration, messages.length, visible]);

  if (current >= messages.length || !visible) return null;

  // Helper to render links in the message as clickable <a> tags
  function renderMessageWithLinks(text: string) {
    // Simple URL regex (http/https only)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#60a5fa', textDecoration: 'underline', wordBreak: 'break-all' }}
          >
            {part}
          </a>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 9999,
      background: 'rgba(30, 41, 59, 0.95)',
      color: 'white',
      padding: '1rem 2rem',
      borderRadius: '0.5rem',
      boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
      fontSize: '1rem',
      maxWidth: '90vw',
      minWidth: '250px',
      pointerEvents: 'auto',
      transition: 'opacity 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <strong>Announcement:</strong> {renderMessageWithLinks(messages[current])}
      <button
        aria-label="Dismiss announcement"
        onClick={() => {
          setVisible(false);
          setTimeout(() => {
            setCurrent((prev) => prev + 1);
            setVisible(true);
          }, 300);
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '1.2rem',
          cursor: 'pointer',
          marginLeft: 'auto',
        }}
      >
        &#10005;
      </button>
    </div>
  );
};

export default AnnouncementPopup;
