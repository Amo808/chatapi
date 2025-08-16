import React, { useState } from 'react';
import { useChat } from '../../context/ChatProvider';
import { Chat } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { state, createChat, deleteChat, updateChat, setCurrentChat, exportChats, importChats } = useChat();
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleImportChats = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const chats: Chat[] = JSON.parse(text);
      importChats(chats);
      setShowImport(false);
      setImportFile(null);
    } catch (error) {
      console.error('Failed to import chats:', error);
      alert('Ошибка при импорте чатов. Проверьте формат файла.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/json') {
      setImportFile(file);
    } else {
      alert('Пожалуйста, выберите JSON файл.');
    }
  };

  // Utility function to format date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Сегодня';
    } else if (days === 1) {
      return 'Вчера';
    } else if (days < 7) {
      return `${days} дн. назад`;
    } else {
      return date.toLocaleDateString('ru-RU');
    }
  };

  const pinnedChats = state.chats.filter(chat => chat.isPinned);
  const regularChats = state.chats.filter(chat => !chat.isPinned);

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-surface border-r border-divider
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Заголовок */}
          <div className="p-4 border-b border-divider">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-text">AI Chat Bot</h1>
              <button
                onClick={onClose}
                className="lg:hidden p-2 hover:bg-accent-dark/20 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Кнопка нового чата */}
          <div className="p-4">
            <button
              onClick={createChat}
              className="btn-primary w-full"
            >
              + Новый чат
            </button>
          </div>

          {/* Закрепленные чаты */}
          {pinnedChats.length > 0 && (
            <div className="px-4 mb-4">
              <h3 className="text-sm font-medium text-muted mb-2">Закрепленные</h3>
              <div className="space-y-1">
                {pinnedChats.map(chat => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === state.currentChatId}
                    onSelect={() => setCurrentChat(chat.id)}
                    onDelete={() => deleteChat(chat.id)}
                    onTogglePin={() => updateChat(chat.id, { isPinned: !chat.isPinned })}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Обычные чаты */}
          <div className="flex-1 px-4 overflow-y-auto">
            <h3 className="text-sm font-medium text-muted mb-2">Недавние чаты</h3>
            <div className="space-y-1">
              {regularChats.map(chat => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === state.currentChatId}
                  onSelect={() => setCurrentChat(chat.id)}
                  onDelete={() => deleteChat(chat.id)}
                  onTogglePin={() => updateChat(chat.id, { isPinned: !chat.isPinned })}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>

          {/* Нижняя панель */}
          <div className="p-4 border-t border-divider space-y-2">
            <button
              onClick={exportChats}
              className="btn-secondary w-full text-sm"
            >
              📤 Экспорт чатов
            </button>
            
            <button
              onClick={() => setShowImport(true)}
              className="btn-secondary w-full text-sm"
            >
              📥 Импорт чатов
            </button>
          </div>
        </div>

        {/* Модал импорта */}
        {showImport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Импорт чатов</h3>
              
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="mb-4"
              />
              
              <div className="flex gap-2">
                <button
                  onClick={handleImportChats}
                  disabled={!importFile}
                  className="btn-primary flex-1"
                >
                  Импортировать
                </button>
                <button
                  onClick={() => {
                    setShowImport(false);
                    setImportFile(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  formatDate: (date: Date) => string;
}

function ChatListItem({ chat, isActive, onSelect, onDelete, onTogglePin, formatDate }: ChatListItemProps) {
  const lastMessage = chat.messages[chat.messages.length - 1];
  const preview = lastMessage?.content.slice(0, 50) || 'Новый чат';

  return (
    <div className={`
      sidebar-item ${isActive ? 'active' : ''}
      group relative
    `}>
      <button
        onClick={onSelect}
        className="flex-1 text-left min-w-0"
      >
        <div className="truncate font-medium">
          {chat.title}
        </div>
        <div className="text-xs text-muted truncate">
          {preview}
        </div>
        <div className="text-xs text-muted">
          {formatDate(chat.updatedAt)}
        </div>
      </button>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <button
            onClick={onTogglePin}
            className="p-1 hover:bg-accent-dark/20 rounded text-xs"
            title={chat.isPinned ? 'Открепить' : 'Закрепить'}
          >
            {chat.isPinned ? '📌' : '📍'}
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-500/20 rounded text-xs text-red-400"
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
