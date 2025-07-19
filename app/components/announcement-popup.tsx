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
    if (current < messages.length) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setCurrent((prev) => prev + 1);
          setVisible(true);
        }, 300); // short fade between messages
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [current, duration, messages.length]);

  if (current >= messages.length || !visible) return null;

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
    }}>
      <strong>Announcement:</strong> {messages[current]}
    </div>
  );
};

export default AnnouncementPopup;
