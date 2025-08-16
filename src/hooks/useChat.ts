import { useState, useCallback } from 'react';
import { useChat } from '../context/ChatProvider';
import { apiClient } from '../lib/api';
import { Message, ApiRequest } from '../types';

export function useChatApi() {
  const { state, addMessage, updateMessage } = useChat();
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (
    content: string,
    chatId: string,
    useStreaming: boolean = false
  ) => {
    if (!content.trim()) return;

    const currentChat = state.chats.find(chat => chat.id === chatId);
    if (!currentChat) return;

    // Добавляем сообщение пользователя
    const userMessage: Omit<Message, 'id' | 'timestamp'> = {
      role: 'user',
      content: content.trim(),
    };
    addMessage(chatId, userMessage);

    // Создаем временное сообщение ассистента
    const tempAssistantMessage: Omit<Message, 'id' | 'timestamp'> = {
      role: 'assistant',
      content: '',
    };
    addMessage(chatId, tempAssistantMessage);

    // Получаем ID последнего сообщения (сообщение ассистента)
    const updatedChat = state.chats.find(chat => chat.id === chatId);
    const assistantMessage = updatedChat?.messages[updatedChat.messages.length - 1];
    if (!assistantMessage) return;

    try {
      if (useStreaming) {
        await sendMessageStream(content, chatId, assistantMessage.id);
      } else {
        await sendMessageRegular(content, chatId, assistantMessage.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Обновляем сообщение с ошибкой
      updateMessage(chatId, assistantMessage.id, {
        content: 'Произошла ошибка при отправке сообщения. Попробуйте еще раз.',
      });
    }
  }, [state.chats, addMessage, updateMessage]);

  const sendMessageRegular = useCallback(async (
    _content: string,
    chatId: string,
    messageId: string
  ) => {
    const currentChat = state.chats.find(chat => chat.id === chatId);
    if (!currentChat) return;

    const request: ApiRequest = {
      chatId,
      messages: currentChat.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      model: currentChat.model,
      stream: false,
    };

    try {
      // Используем mock API для демонстрации
      const response = await apiClient.sendMessageMock(request);
      
      updateMessage(chatId, messageId, {
        content: response.reply,
        meta: response.meta,
      });
    } catch (error) {
      throw error;
    }
  }, [state.chats, updateMessage]);

  const sendMessageStream = useCallback(async (
    _content: string,
    chatId: string,
    messageId: string
  ) => {
    const currentChat = state.chats.find(chat => chat.id === chatId);
    if (!currentChat) return;

    const request: ApiRequest = {
      chatId,
      messages: currentChat.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      model: currentChat.model,
      stream: true,
    };

    setIsStreaming(true);
    let fullContent = '';

    try {
      // Используем mock streaming API для демонстрации
      await apiClient.sendMessageStreamMock(request, (chunk) => {
        if (chunk.type === 'delta' && chunk.delta) {
          fullContent += chunk.delta;
          updateMessage(chatId, messageId, {
            content: fullContent,
          });
        } else if (chunk.type === 'done') {
          setIsStreaming(false);
          // Обновляем сообщение с метаданными
          updateMessage(chatId, messageId, {
            content: fullContent,
            meta: chunk.meta,
          });
        }
      });
    } catch (error) {
      setIsStreaming(false);
      throw error;
    }
  }, [state.chats, updateMessage]);

  return {
    sendMessage,
    isStreaming,
  };
}
