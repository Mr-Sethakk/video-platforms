'use client';
import { useState, useCallback, useRef } from 'react';
import { apiFetchStream } from '@/lib/api';

export function useChat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是电影助手小影 🎬\n\n我可以帮你：\n- 根据喜好推荐电影\n- 介绍电影详细信息\n- 回答电影相关问题\n\n有什么我可以帮你的吗？',
      timestamp: Date.now(),
    },
  ]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const streamBuffer = useRef('');

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;
    if (streaming) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);
    setError(null);

    const assistantId = `assistant-${Date.now()}`;
    streamBuffer.current = '';

    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }]);

    await apiFetchStream(
      '/ai/chat',
      { message: content, history: messages.slice(-10).map(m => ({ role: m.role, content: m.content })) },
      (chunk) => {
        streamBuffer.current += chunk;
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: streamBuffer.current } : m
        ));
      },
      () => {
        setStreaming(false);
      },
      (err) => {
        setError(err.message);
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: streamBuffer.current || '抱歉，回复出错了，请重试。' } : m
        ));
        setStreaming(false);
      }
    );
  }, [messages, streaming]);

  const clearChat = useCallback(() => {
    setMessages([messages[0]]);
  }, [messages]);

  return { messages, streaming, error, sendMessage, clearChat };
}
