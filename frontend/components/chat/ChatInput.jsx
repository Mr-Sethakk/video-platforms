'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSend, disabled, quickQuestions = [] }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question) => {
    onSend(question);
  };

  return (
    <div className="border-t border-[#303030] p-3 bg-[#0F0F0F]">
      {/* Quick question chips */}
      {quickQuestions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-2 scrollbar-hide">
          {quickQuestions.map((question, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickQuestion(question)}
              className="rounded-full bg-[#272727] px-3 py-1 text-xs text-[#AAAAAA] hover:bg-[#3F3F3F] hover:text-white cursor-pointer transition-colors whitespace-nowrap flex-shrink-0"
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Text input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入您的问题..."
          disabled={disabled}
          className="flex-1 bg-[#212121] rounded-full px-4 py-2 text-sm text-white placeholder:text-[#717171] border border-transparent focus:border-[#6366F1] focus:outline-none transition-colors"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="w-9 h-9 rounded-full bg-[#6366F1] flex items-center justify-center text-white hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Send size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
