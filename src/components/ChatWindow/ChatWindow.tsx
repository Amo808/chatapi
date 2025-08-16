import { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatProvider';
import { Message } from '../Message';
import { Composer } from '../Composer';

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { state } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const currentChat = state.chats.find(chat => chat.id === chatId);
  const messages = currentChat?.messages || [];

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted">
          <h3 className="text-xl font-semibold mb-2">Чат не найден</h3>
          <p>Выберите существующий чат или создайте новый</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Заголовок чата */}
      <div className="border-b border-divider bg-surface px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">
              {currentChat.title}
            </h2>
            <p className="text-sm text-muted">
              {currentChat.messages.length} сообщений • 
              {currentChat.model && ` Модель: ${currentChat.model}`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {currentChat.systemPrompt && (
              <button className="btn-secondary text-xs">
                Системный промпт
              </button>
            )}
            <button className="btn-secondary text-xs">
              Настройки
            </button>
          </div>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-2">Начните новый разговор</h3>
              <p>Отправьте первое сообщение, чтобы начать чат с ИИ</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              isStreaming={message.content === '' && message.role === 'assistant'}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Композер */}
      <Composer chatId={chatId} />
    </div>
  );
}
