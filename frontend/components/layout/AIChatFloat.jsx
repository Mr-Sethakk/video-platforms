'use client';
import { useState, useCallback } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatBox from '@/components/chat/ChatBox';

export default function AIChatFloat() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* ===== Closed state: Floating circular button ===== */}
      {!isOpen && (
        <button
          type="button"
          onClick={toggle}
          className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#6366F1] shadow-xl hover:bg-[#4F46E5] hover:scale-110 transition-all flex items-center justify-center"
          aria-label="打开AI助手"
>
          <MessageCircle size={24} strokeWidth={1.5} className="text-white" />
          {/* Green online indicator dot */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-[#0F0F0F]" />
        </button>
      )}

      {/* ===== Open state: Chat drawer panel ===== */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full z-50 bg-[#0F0F0F] border-l border-[#303030] shadow-2xl flex flex-col w-full sm:w-[380px]">
          {/* Header */}
          <header className="bg-[#212121] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎬</span>
              <span className="text-white text-sm font-medium">电影助手</span>
              <span className="text-[#AAAAAA] text-xs">· 在线</span>
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 ml-1" />
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-8 h-8 rounded-full hover:bg-[#3F3F3F] flex items-center justify-center transition-colors"
              aria-label="关闭聊天"
            >
              <X size={20} strokeWidth={1.5} className="text-white" />
            </button>
          </header>

          {/* Body: ChatBox component */}
          <div className="flex-1 overflow-y-auto">
            <ChatBox />
          </div>
        </div>
      )}
    </>
  );
}
