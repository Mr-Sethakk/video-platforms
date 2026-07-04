'use client';

import { useState, useRef } from 'react';
import { Send, Image } from 'lucide-react';

export default function ChatInput({ onSend, disabled, quickQuestions = [] }) {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if ((!trimmed && !imageFile) || disabled) return;
    onSend(trimmed, imageFile || undefined);
    setMessage('');
    setImageFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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

      {/* Image preview chip */}
      {imageFile && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-2 bg-[#272727] rounded-full px-3 py-1">
            <Image size={14} className="text-[#AAAAAA]" />
            <span className="text-xs text-[#AAAAAA] truncate max-w-[120px]">
              {imageFile.name}
            </span>
            <button
              type="button"
              onClick={() => setImageFile(null)}
              className="text-[#717171] hover:text-white transition-colors"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-full hover:bg-[#272727] flex items-center justify-center text-[#AAAAAA] cursor-pointer transition-colors flex-shrink-0"
          disabled={disabled}
        >
          <Image size={24} strokeWidth={1.5} />
        </button>

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
          disabled={disabled || (!message.trim() && !imageFile)}
          className="w-9 h-9 rounded-full bg-[#6366F1] flex items-center justify-center text-white hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <Send size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
