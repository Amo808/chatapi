import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { Chat, Message, ChatAction, ChatState } from '../types';

const STORAGE_KEY = 'ai-chat-bot-chats';

// Функция для загрузки чатов из localStorage
const loadChatsFromStorage = (): Chat[] => {
  try {
    // Проверяем, доступен ли localStorage (может не работать в SSR)
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('✅ Загружены чаты из localStorage:', parsed.length);
      // Преобразуем строки дат обратно в объекты Date
      return parsed.map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        updatedAt: new Date(chat.updatedAt),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    }
  } catch (error) {
    console.error('❌ Ошибка загрузки чатов:', error);
    // Очищаем поврежденные данные
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('❌ Не удалось очистить localStorage:', e);
    }
  }
  return [];
};

// Функция для сохранения чатов в localStorage
const saveChatsToStorage = (chats: Chat[]) => {
  try {
    // Проверяем, доступен ли localStorage
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    console.log('✅ Чаты сохранены в localStorage:', chats.length);
  } catch (error) {
    console.error('❌ Ошибка сохранения чатов:', error);
  }
};

export const ChatContext = createContext<{
  state: ChatState;
  createChat: () => void;
  deleteChat: (chatId: string) => void;
  setCurrentChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  togglePinChat: (chatId: string) => void;
  exportChats: () => void;
  importChats: (chats: Chat[]) => void;
} | null>(null);

const initialState: ChatState = {
  chats: loadChatsFromStorage(),
  currentChatId: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  console.log('🔄 ChatProvider: Reducer called with action:', action.type);
  console.log('🔄 ChatProvider: Current state:', state);
  
  let newState: ChatState | null = null;
  
  switch (action.type) {
    case 'CREATE_CHAT': {
      console.log('🔄 ChatProvider: Processing CREATE_CHAT');
      const newChat: Chat = {
        id: `chat-${Date.now()}`,
        title: 'Новый чат',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPinned: false,
        model: 'deepseek-chat', // Используем DeepSeek по умолчанию
      };
      
      console.log('🔄 ChatProvider: Created new chat:', newChat);
      
      newState = {
        ...state,
        chats: [newChat, ...state.chats],
        currentChatId: newChat.id,
      };
      
      console.log('🔄 ChatProvider: New state after CREATE_CHAT:', newState);
      break;
    }
    case 'DELETE_CHAT': {
      const updatedChats = state.chats.filter(chat => chat.id !== action.payload);
      const newCurrentChatId = state.currentChatId === action.payload 
        ? (updatedChats[0]?.id || null)
        : state.currentChatId;
      
      newState = {
        ...state,
        chats: updatedChats,
        currentChatId: newCurrentChatId,
      };
      break;
    }
    case 'SET_CURRENT_CHAT': {
      newState = {
        ...state,
        currentChatId: action.payload,
      };
      break;
    }
    case 'ADD_MESSAGE': {
      const { chatId, message } = action.payload;
      const updatedChats = state.chats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, message],
            updatedAt: new Date(),
            title: chat.messages.length === 0 && message.role === 'user' 
              ? message.content.slice(0, 50) 
              : chat.title,
          };
        }
        return chat;
      });
      
      newState = {
        ...state,
        chats: updatedChats,
      };
      break;
    }
    case 'UPDATE_CHAT': {
      const { chatId, updates } = action.payload;
      console.log('🔄 ChatProvider: UPDATE_CHAT called with:', { chatId, updates });
      
      const updatedChats = state.chats.map(chat => {
        if (chat.id === chatId) {
          const updatedChat = {
            ...chat,
            ...updates,
            updatedAt: new Date(),
          };
          console.log('🔄 ChatProvider: Updated chat:', updatedChat);
          return updatedChat;
        }
        return chat;
      });
      
      console.log('🔄 ChatProvider: All updated chats:', updatedChats);
      
      newState = {
        ...state,
        chats: updatedChats,
      };
      break;
    }
    case 'TOGGLE_PIN_CHAT': {
      const { chatId } = action.payload;
      const updatedChats = state.chats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            isPinned: !chat.isPinned,
          };
        }
        return chat;
      });
      
      // Сортируем: закрепленные чаты сверху
      const sortedChats = updatedChats.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
      
      newState = {
        ...state,
        chats: sortedChats,
      };
      break;
    }
    case 'LOAD_CHATS': {
      newState = {
        ...state,
        chats: action.payload,
      };
      break;
    }
    default:
      return state;
  }
  
  // Автосохранение в localStorage
  if (newState) {
    saveChatsToStorage(newState.chats);
    return newState;
  }
  
  return state;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  console.log('🏗️ ChatProvider: Initialized with state:', state);

  // Загружаем чаты из localStorage при монтировании
  useEffect(() => {
    console.log('🏗️ ChatProvider: Loading chats from localStorage...');
    try {
      // ВАЖНО: используем loadChatsFromStorage, чтобы восстановить Date-поля
      const parsedChats = loadChatsFromStorage();

      if (parsedChats.length > 0) {
        // Обновляем все чаты, чтобы использовать DeepSeek по умолчанию
        const updatedChats = parsedChats.map((chat: Chat) => ({
          ...chat,
          // гарантируем корректные типы дат на случай старых сохранений
          createdAt: chat.createdAt instanceof Date ? chat.createdAt : new Date(chat.createdAt as any),
          updatedAt: chat.updatedAt instanceof Date ? chat.updatedAt : new Date(chat.updatedAt as any),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp as any),
          })),
          model: (chat as any).model || 'deepseek-chat',
        }));

        console.log('🏗️ ChatProvider: Updated chats with DeepSeek model:', updatedChats);

        dispatch({
          type: 'LOAD_CHATS',
          payload: updatedChats,
        } as ChatAction);

        dispatch({
          type: 'SET_CURRENT_CHAT',
          payload: updatedChats[0].id,
        });
      } else {
        console.log('🏗️ ChatProvider: No saved chats found in localStorage');
      }
    } catch (error) {
      console.error('❌ ChatProvider: Error loading chats from localStorage:', error);
    }
  }, []);

  // Сохраняем чаты в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('ai-chat-bot-chats', JSON.stringify(state.chats));
  }, [state.chats]);

  const createChat = () => {
    console.log('🏗️ ChatProvider: createChat called');
    dispatch({ type: 'CREATE_CHAT' });
    console.log('🏗️ ChatProvider: CREATE_CHAT dispatched');
  };

  const deleteChat = (chatId: string) => {
    dispatch({ type: 'DELETE_CHAT', payload: chatId });
  };

  const setCurrentChat = (chatId: string) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chatId });
  };

  const addMessage = (chatId: string, message: Message) => {
    console.log('🏗️ ChatProvider: addMessage called with:', { chatId, message });
    
    // Проверяем, что чат существует
    const existingChat = state.chats.find(chat => chat.id === chatId);
    if (!existingChat) {
      console.error('❌ ChatProvider: addMessage - Chat not found:', chatId);
      return;
    }
    
    console.log('🏗️ ChatProvider: Found existing chat:', existingChat);
    dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message } });
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    console.log('🏗️ ChatProvider: updateChat called with:', { chatId, updates });
    
    // Проверяем, что чат существует
    const existingChat = state.chats.find(chat => chat.id === chatId);
    if (!existingChat) {
      console.error('❌ ChatProvider: updateChat - Chat not found:', chatId);
      return;
    }
    
    console.log('🏗️ ChatProvider: Found existing chat:', existingChat);
    dispatch({ type: 'UPDATE_CHAT', payload: { chatId, updates } });
  };

  const togglePinChat = (chatId: string) => {
    dispatch({ type: 'TOGGLE_PIN_CHAT', payload: { chatId } });
  };

  const exportChats = () => {
    const dataStr = JSON.stringify(state.chats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-chat-bot-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importChats = (chats: Chat[]) => {
    const processedChats = chats.map(chat => ({
      ...chat,
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: chat.messages.map(msg => ({
        ...msg,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      })),
    }));
    
    // Добавляем импортированные чаты к существующим
    const allChats = [...state.chats, ...processedChats];
    dispatch({ type: 'LOAD_CHATS', payload: allChats });
  };

  return (
    <ChatContext.Provider value={{
      state,
      createChat,
      deleteChat,
      setCurrentChat,
      addMessage,
      updateChat,
      togglePinChat,
      exportChats,
      importChats,
    }}>
      {children}
    </ChatContext.Provider>
  );
}
