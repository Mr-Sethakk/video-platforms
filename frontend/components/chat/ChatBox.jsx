'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { QUICK_QUESTIONS } from '@/lib/constants';

export default function ChatBox() {
  const {
    messages,
    sendMessage,
    streaming,
    error,
  } = useChat();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streaming]);

  const handleSend = (messageText) => {
    sendMessage(messageText);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.slice(1).length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-[#AAAAAA] text-sm">
                与我对话，发现你喜欢的电影
              </p>
              <p className="text-[#717171] text-xs mt-1">
                尝试点击下方的快捷问题，或直接输入你想看的电影类型
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isLastAssistant = msg.role === 'assistant' && streaming && msg === messages[messages.length - 1];
          return (
            <ChatMessage
              key={msg.id}
              message={msg}
              isStreaming={isLastAssistant}
            />
          );
        })}

        {/* Error display */}
        {error && (
          <div className="text-center text-sm text-[#EF4444] py-2">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        onSend={handleSend}
        disabled={streaming}
        quickQuestions={QUICK_QUESTIONS}
      />
    </div>
  );
}
