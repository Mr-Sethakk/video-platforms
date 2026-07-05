'use client';

import { useState, useEffect } from 'react';
import Markdown from '@/components/chat/Markdown';

function ThinkingDots() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="text-[#AAAAAA] italic text-sm">
      thinking{dots}
    </span>
  );
}

export default function ChatMessage({ message, isStreaming }) {
  const isUser = message.role === 'user';

  // Streaming state: show thinking animation inside the bubble
  if (isStreaming && !message.content) {
    return (
      <div className="flex justify-start">
        <div className="bg-[#212121] rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
          <ThinkingDots />
        </div>
      </div>
    );
  }

  return (
    <div className={isUser ? 'flex justify-end' : 'flex justify-start'}>
      <div className={isUser ? 'max-w-[80%] ml-auto' : 'max-w-[85%]'}>
        {/* Message bubble */}
        <div
          className={
            isUser
              ? 'bg-[#6366F1] text-white rounded-2xl rounded-br-md px-4 py-2'
              : 'bg-[#212121] text-white rounded-2xl rounded-bl-md px-4 py-2'
          }
        >
          {isUser ? (
            <span className="text-sm whitespace-pre-wrap">{message.content}</span>
          ) : (
            <Markdown text={message.content} />
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <p className="text-[10px] text-[#717171] mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
