import React, { useState, useRef, useEffect } from 'react';
import { useChatApi } from '../../hooks/useChat';
import { useSimpleChat } from '../../hooks/useSimpleChat';
import { useChat } from '../../hooks/useChatContext';
import { ModelSelector } from '../ModelSelector';
import { getModelDescription } from '../../lib/models';

interface ComposerProps {
  chatId: string;
}

export function Composer({ chatId }: ComposerProps) {
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage: sendMessageApi, error, clearError } = useChatApi();
  const { sendMessage: sendMessageSimple, isLoading, streamingMessageId } = useSimpleChat();
  const { state, updateChat } = useChat();

  const currentChat = state.chats.find(chat => chat.id === chatId);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentChat) return;

    console.log('📝 Composer: handleSubmit called with message:', message);
    console.log('📝 Composer: currentChat:', currentChat);
    console.log('📝 Composer: chatId:', chatId);

    setIsStreaming(true);
    try {
      console.log('📝 Composer: Using simple chat for DeepSeek');
      
      // Используем простую версию для DeepSeek
      if (currentChat?.model === 'deepseek-chat' || !currentChat?.model) {
        await sendMessageSimple(chatId, message);
      } else {
        // Для других моделей используем обычный API
        await sendMessageApi(chatId, message, true);
      }
      
      console.log('📝 Composer: sendMessage completed successfully');
      setMessage('');
    } catch (error) {
      console.error('❌ Composer: Failed to send message:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Реализовать загрузку файлов
      console.log('File upload:', file.name);
    }
  };

  const handleModelChange = (modelId: string) => {
    if (currentChat) {
      updateChat(chatId, { model: modelId });
    }
  };

  return (
    <div className="border-t border-divider bg-surface p-4">
      {/* Статус загрузки */}
      {(isLoading || streamingMessageId) && (
        <div className="mb-2 flex items-center gap-2 text-sm text-muted animate-pulse">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <span>DeepSeek думает...</span>
        </div>
      )}
      
      {/* Выбор модели */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Модель:</span>
          <ModelSelector
            selectedModel={currentChat?.model || 'deepseek-chat'}
            onModelChange={handleModelChange}
          />
        </div>
        
        {currentChat?.model && (
          <div className="text-xs text-muted">
            {getModelDescription(currentChat.model)}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите сообщение... (Shift+Enter для новой строки)"
            className="input-field w-full resize-none min-h-[44px] max-h-32"
            rows={1}
            disabled={isStreaming}
          />
          
          <div className="absolute bottom-2 right-2 text-xs text-muted">
            {message.length > 0 && `${message.length} символов`}
          </div>
        </div>

        <div className="flex gap-2">
          <label className="btn-secondary cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".txt,.md,.pdf,.doc,.docx"
              disabled={isStreaming}
            />
            📎
          </label>
          
          <button
            type="submit"
            disabled={!message.trim() || isStreaming || isLoading || !!streamingMessageId}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isStreaming || isLoading || streamingMessageId) ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>
      
      <div className="text-xs text-muted mt-2 text-center">
        Ctrl+Enter для отправки • Shift+Enter для новой строки
      </div>
      
      {/* Отображение ошибок */}
      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-red-500 text-sm">{error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
