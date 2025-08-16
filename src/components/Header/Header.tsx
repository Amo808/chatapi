import React, { useState } from 'react';
import { useChat } from '../../context/ChatProvider';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { state, exportChats, importChats } = useChat();
  const [showSettings, setShowSettings] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleImportChats = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const chats = JSON.parse(text);
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

  return (
    <>
      <header className="bg-surface border-b border-divider px-4 py-3 flex items-center justify-between">
        {/* Левая часть */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-accent-dark/20 rounded-lg"
          >
            ☰
          </button>
          
          <h1 className="text-lg font-semibold text-text">AI Chat Bot</h1>
          
          {state.currentChatId && (
            <span className="text-sm text-muted">
              {state.chats.find(chat => chat.id === state.currentChatId)?.title}
            </span>
          )}
        </div>

        {/* Правая часть */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-accent-dark/20 rounded-lg text-muted hover:text-text"
            title="Настройки"
          >
            ⚙️
          </button>
          
          <button
            onClick={exportChats}
            className="p-2 hover:bg-accent-dark/20 rounded-lg text-muted hover:text-text"
            title="Экспорт чатов"
          >
            📤
          </button>
          
          <button
            onClick={() => setShowImport(true)}
            className="p-2 hover:bg-accent-dark/20 rounded-lg text-muted hover:text-text"
            title="Импорт чатов"
          >
            📥
          </button>
        </div>
      </header>

      {/* Модал настроек */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Настройки</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Модель по умолчанию</label>
                <select className="input-field w-full">
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Тема</label>
                <select className="input-field w-full">
                  <option value="dark">Тёмная</option>
                  <option value="light">Светлая</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="btn-primary flex-1"
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="btn-secondary flex-1"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}
