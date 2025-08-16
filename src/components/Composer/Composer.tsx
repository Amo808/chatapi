import React, { useState, useRef, useEffect } from 'react';
import { useChatApi } from '../../hooks/useChat';
import { useChat } from '../../context/ChatProvider';

interface ComposerProps {
  chatId: string;
}

export function Composer({ chatId }: ComposerProps) {
  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useChatApi();
  const { state } = useChat();

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

    setIsStreaming(true);
    try {
      await sendMessage(message, chatId, true); // Используем стриминг по умолчанию
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
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

  return (
    <div className="border-t border-divider bg-surface p-4">
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
            disabled={!message.trim() || isStreaming}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? 'Отправка...' : 'Отправить'}
          </button>
        </div>
      </form>
      
      <div className="text-xs text-muted mt-2 text-center">
        Ctrl+Enter для отправки • Shift+Enter для новой строки
      </div>
    </div>
  );
}
