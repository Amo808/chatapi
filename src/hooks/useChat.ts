import { useState, useCallback, useRef, useEffect } from 'react';
import { useChat as useChatContext } from './useChatContext';
import { apiClient } from '../lib/api';
import { Message } from '../types';

export function useChatApi() {
  console.log('🔧 useChatApi: Hook initialized');
  
  const { state, addMessage, updateChat } = useChatContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Используем ref для хранения актуального состояния
  const stateRef = useRef(state);
  
  // Обновляем ref при изменении state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  console.log('🔧 useChatApi: Current state:', state);
  console.log('🔧 useChatApi: Current chats count:', state.chats.length);

  const sendMessageRegular = useCallback(async (chatId: string, content: string) => {
    if (!content.trim()) return;

    console.log('💬 sendMessageRegular called with:', { chatId, content });
    
    setIsLoading(true);
    setError(null);

    try {
      const currentChat = state.chats.find(chat => chat.id === chatId);
      if (!currentChat) {
        throw new Error('Чат не найден');
      }

      console.log('💬 Current chat found:', currentChat);
      console.log('💬 Current chat model:', currentChat.model);

      // Добавляем сообщение пользователя
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        chatId,
      };

      console.log('💬 Adding user message:', userMessage);
      addMessage(chatId, userMessage);

      // Создаем пустое сообщение ассистента для стриминга
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '🤔 Думаю...',
        timestamp: new Date(),
        chatId,
      };

      console.log('💬 Adding assistant message:', assistantMessage);
      addMessage(chatId, assistantMessage);

      // Отправляем запрос к API
      const request = {
        chatId,
        messages: currentChat.messages.concat(userMessage).map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        model: currentChat.model || 'deepseek-chat',
        stream: false,
      };

      console.log('💬 Sending API request:', request);

      const response = await apiClient.sendMessage(request);

      console.log('💬 API response received:', response);

      // Обновляем сообщение ассистента с полученным ответом
      const updatedMessage: Message = {
        ...assistantMessage,
        content: response.reply,
        meta: {
          usage: response.meta?.usage,
          model: response.meta?.model,
          finish_reason: response.finishReason,
        },
      };

      console.log('💬 Updating assistant message with:', updatedMessage);

      // Получаем актуальное состояние чата из ref
      const freshChat = stateRef.current.chats.find(chat => chat.id === chatId);
      if (!freshChat) {
        console.error('❌ Fresh chat not found');
        return;
      }

      // Заменяем пустое сообщение на полное
      const updatedMessages = freshChat.messages.map(msg => 
        msg.id === assistantMessage.id ? updatedMessage : msg
      );

      console.log('💬 Final messages array:', updatedMessages);
      updateChat(chatId, { messages: updatedMessages });

    } catch (err) {
      console.error('❌ Error in sendMessageRegular:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при отправке сообщения');
      
      // Показываем ошибку пользователю
      const errorMessage: Message = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        content: `❌ Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`,
        timestamp: new Date(),
        chatId,
      };
      
      addMessage(chatId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [state.chats, addMessage, updateChat]);

  const sendMessageStream = useCallback(async (chatId: string, content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentChat = state.chats.find(chat => chat.id === chatId);
      if (!currentChat) {
        throw new Error('Чат не найден');
      }

      // Добавляем сообщение пользователя
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
        chatId,
      };

      addMessage(chatId, userMessage);

      // Создаем пустое сообщение ассистента для стриминга
      const assistantMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: '🤔 Думаю...',
        timestamp: new Date(),
        chatId,
      };

      addMessage(chatId, assistantMessage);

      // Отправляем запрос к API с стримингом
      const request = {
        chatId,
        messages: currentChat.messages.concat(userMessage).map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        model: currentChat.model || 'deepseek-chat',
        stream: true,
      };

      let fullResponse = '';

      await apiClient.sendMessageStream(request, (chunk: string) => {
        fullResponse += chunk;
        
        // Получаем актуальное состояние чата из ref
        const freshChat = stateRef.current.chats.find(chat => chat.id === chatId);
        if (!freshChat) {
          console.error('❌ Fresh chat not found during streaming');
          return;
        }

        // Обновляем сообщение ассистента в реальном времени
        const updatedMessage: Message = {
          ...assistantMessage,
          content: fullResponse,
        };

        const updatedMessages = freshChat.messages.map(msg => 
          msg.id === assistantMessage.id ? updatedMessage : msg
        );

        updateChat(chatId, { messages: updatedMessages });
      });

      // Финальное обновление с метаданными
      const finalMessage: Message = {
        ...assistantMessage,
        content: fullResponse,
        meta: {
          model: currentChat.model || 'deepseek-chat',
          usage: {
            total_tokens: Math.floor(fullResponse.length * 0.3), // Примерная оценка токенов
          },
          finish_reason: 'stop',
        },
      };

      // Получаем финальное состояние чата из ref
      const finalChat = stateRef.current.chats.find(chat => chat.id === chatId);
      if (!finalChat) {
        console.error('❌ Final chat not found');
        return;
      }

      const finalMessages = finalChat.messages.map(msg => 
        msg.id === assistantMessage.id ? finalMessage : msg
      );

      updateChat(chatId, { messages: finalMessages });

    } catch (err) {
      console.error('❌ Error in sendMessageStream:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка при отправке сообщения');
      
      // Показываем ошибку пользователю
      const errorMessage: Message = {
        id: `msg-${Date.now() + 2}`,
        role: 'assistant',
        content: `❌ Ошибка: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`,
        timestamp: new Date(),
        chatId,
      };
      
      addMessage(chatId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [state.chats, addMessage, updateChat]);

  const sendMessage = useCallback(async (chatId: string, content: string, useStreaming = false) => {
    console.log('💬 sendMessage called with:', { chatId, content, useStreaming });
    
    if (useStreaming) {
      return sendMessageStream(chatId, content);
    } else {
      return sendMessageRegular(chatId, content);
    }
  }, [sendMessageRegular, sendMessageStream]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
    clearError,
  };
}
