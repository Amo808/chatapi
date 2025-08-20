import { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChatContext';
import { Message } from '../Message';
import { Composer } from '../Composer';
import { getModelIcon, getModelDisplayName } from '../../lib/models';
import { Menu } from 'lucide-react';

interface ChatWindowProps {
  chatId: string;
  onToggleSidebar?: () => void;
}

export function ChatWindow({ chatId, onToggleSidebar }: ChatWindowProps) {
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
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 hover:bg-accent-dark/20 rounded-lg"
                title="Открыть боковую панель"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="typography-h2 mb-0">
                {currentChat.title}
              </h2>
              <div className="flex items-center gap-3 typography-small">
                <span>{currentChat.messages.length} сообщений</span>
                {currentChat.model && (
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>Модель:</span>
                    <span className="font-medium text-text">
                      {getModelIcon(currentChat.model)} {getModelDisplayName(currentChat.model)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
            <h3 className="typography-h3">Начните новый разговор</h3>
            <p className="typography-body text-muted">Отправьте первое сообщение, чтобы начать чат с ИИ</p>
          </div>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              isStreaming={message.content === '' && message.role === 'assistant'}
              model={currentChat.model}
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
