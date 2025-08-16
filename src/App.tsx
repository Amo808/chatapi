import { useState, useEffect } from 'react';
import { ChatProvider } from './context/ChatProvider';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { useChat } from './context/ChatProvider';

function AppContent() {
  const { state, createChat } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Создаем первый чат при загрузке, если чатов нет
  useEffect(() => {
    if (state.chats.length === 0) {
      createChat();
    }
  }, [state.chats.length, createChat]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-bg-very-dark">
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        <main className="flex-1 flex flex-col">
          {state.currentChatId ? (
            <ChatWindow chatId={state.currentChatId} />
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
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}
