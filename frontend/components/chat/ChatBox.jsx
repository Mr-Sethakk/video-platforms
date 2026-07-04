'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { QUICK_QUESTIONS } from '@/lib/constants';

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <span className="w-2 h-2 bg-[#717171] rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-[#717171] rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-[#717171] rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

export default function ChatBox() {
  const {
    messages,
    sendMessage,
    isLoading,
    isStreaming,
    error,
  } = useChat();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSend = (messageText, imageFile) => {
    sendMessage(messageText, imageFile);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.length === 0 && (
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

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isStreaming={false}
          />
        ))}

        {/* Streaming indicator */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="bg-[#212121] rounded-2xl rounded-bl-md max-w-[85%]">
              <TypingIndicator />
            </div>
          </div>
        )}

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
        disabled={isLoading}
        quickQuestions={QUICK_QUESTIONS}
      />
    </div>
  );
}
