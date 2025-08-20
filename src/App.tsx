import React, { useEffect } from 'react';
import { ChatProvider } from './context/ChatProvider';
import { useChat } from './hooks/useChatContext';
import { ApiKeyProvider } from './context/ApiKeyProvider';
import { ChatWindow } from './components/ChatWindow';
import { Sidebar } from './components/Sidebar';
import { initializeDefaultApiKeys } from './lib/models';
import './styles/index.css';

function AppContent() {
  const { state, createChat } = useChat();
  const [sidebarOpen, setSidebarOpen] = React.useState(true); // По умолчанию открыта

  console.log('🚀 AppContent: Rendered with state:', state);
  console.log('🚀 AppContent: Current chats count:', state.chats.length);
  console.log('🚀 AppContent: Current chat ID:', state.currentChatId);

  // Инициализируем API ключи при загрузке
  useEffect(() => {
    console.log('🚀 AppContent: Initializing API keys...');
    initializeDefaultApiKeys();
  }, []);

  // Создаем первый чат при загрузке, если чатов нет
  useEffect(() => {
    console.log('🚀 AppContent: useEffect triggered, chats count:', state.chats.length);
    if (state.chats.length === 0) {
      console.log('🚀 AppContent: No chats found, creating first chat...');
      createChat();
    } else {
      console.log('🚀 AppContent: Chats already exist, not creating new one');
    }
  }, [state.chats.length, createChat]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background text-text">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="flex-1 flex flex-col">
        {state.currentChatId ? (
          <ChatWindow chatId={state.currentChatId} onToggleSidebar={toggleSidebar} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-semibold mb-2">Добро пожаловать в AI Chat Bot</h2>
              <p className="text-lg mb-6">Создайте новый чат, чтобы начать общение с ИИ</p>
              <button
                onClick={createChat}
                className="btn-primary text-lg px-8 py-3"
              >
                Создать чат
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <ApiKeyProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </ApiKeyProvider>
  );
}

export default App;
