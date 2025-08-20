import { useState, useRef, useEffect } from 'react';
import { useChat } from './useChatContext';
import { Message } from '../types';

const getDeepseekApiKey = (): string => {
  const fromEnv = (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_DEEPSEEK_API_KEY : undefined)
    || (typeof process !== 'undefined' ? (process as any).env?.VITE_DEEPSEEK_API_KEY : undefined)
    || '';
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem('ai-chat-bot-api-keys');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed['deepseek-chat']) return parsed['deepseek-chat'];
      }
    } catch {}
  }
  return typeof fromEnv === 'string' ? fromEnv : '';
};

export function useSimpleChat() {
  const { addMessage, updateChat, state } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const sendMessage = async (chatId: string, content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    console.log('🚀 Simple chat: Sending message:', content);

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      chatId,
    };
    addMessage(chatId, userMessage);

    // Создаем ПУСТОЕ сообщение ассистента для потоковой передачи
    const assistantMessageId = `msg-${Date.now() + 1}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      chatId,
    };
    addMessage(chatId, assistantMessage);
    setStreamingMessageId(assistantMessageId);

    try {

      // Отправляем запрос к API с потоковой передачей
      const apiKey = getDeepseekApiKey();
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: content }],
          max_tokens: 1000,
          temperature: 0.7,
          stream: true
        })
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      // Обрабатываем потоковый ответ
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullResponse += content;
                
                // Обновляем сообщение в реальном времени
                const currentChat = stateRef.current.chats.find(chat => chat.id === chatId);
                if (currentChat) {
                  const updatedMessages = currentChat.messages.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: fullResponse }
                      : msg
                  );
                  updateChat(chatId, { messages: updatedMessages });
                }
              }
            } catch (e) {
              // Игнорируем ошибки парсинга
            }
          }
        }
      }

      // Финальное обновление с метаданными
      const finalChat = stateRef.current.chats.find(chat => chat.id === chatId);
      if (finalChat) {
        const finalMessages = finalChat.messages.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: fullResponse,
                meta: {
                  model: 'deepseek-chat',
                  finish_reason: 'stop'
                }
              }
            : msg
        );
        updateChat(chatId, { messages: finalMessages });
      }

    } catch (error) {
      console.error('❌ Error:', error);
      
      // Удаляем пустое сообщение и добавляем сообщение об ошибке
      if (streamingMessageId) {
        const currentChat = stateRef.current.chats.find(chat => chat.id === chatId);
        if (currentChat) {
          const filteredMessages = currentChat.messages.filter(msg => msg.id !== streamingMessageId);
          updateChat(chatId, { messages: filteredMessages });
        }
      }
      
      // Добавляем сообщение об ошибке
      const errorMessage: Message = {
        id: `msg-${Date.now() + 3}`,
        role: 'assistant',
        content: `❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        timestamp: new Date(),
        chatId,
      };
      addMessage(chatId, errorMessage);
    } finally {
      setIsLoading(false);
      setStreamingMessageId(null);
    }
  };

  return { sendMessage, isLoading, streamingMessageId };
}
