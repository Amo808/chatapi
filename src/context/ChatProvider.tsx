import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Chat, ChatState, ChatContextType, Message } from '../types';

type ChatAction =
  | { type: 'CREATE_CHAT'; payload: Chat }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'UPDATE_CHAT'; payload: { chatId: string; updates: Partial<Chat> } }
  | { type: 'SET_CURRENT_CHAT'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { chatId: string; messageId: string; updates: Partial<Message> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_CHATS'; payload: Chat[] };

const initialState: ChatState = {
  chats: [],
  currentChatId: null,
  isLoading: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'CREATE_CHAT':
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        currentChatId: action.payload.id,
      };

    case 'DELETE_CHAT':
      const updatedChats = state.chats.filter(chat => chat.id !== action.payload);
      const newCurrentChatId = state.currentChatId === action.payload
        ? (updatedChats[0]?.id || null)
        : state.currentChatId;
      
      return {
        ...state,
        chats: updatedChats,
        currentChatId: newCurrentChatId,
      };

    case 'UPDATE_CHAT':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.chatId
            ? { ...chat, ...action.payload.updates, updatedAt: new Date() }
            : chat
        ),
      };

    case 'SET_CURRENT_CHAT':
      return {
        ...state,
        currentChatId: action.payload,
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: [...chat.messages, action.payload.message],
                updatedAt: new Date(),
                title: chat.messages.length === 0
                  ? action.payload.message.content.slice(0, 50) + '...'
                  : chat.title,
              }
            : chat
        ),
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: chat.messages.map(message =>
                  message.id === action.payload.messageId
                    ? { ...message, ...action.payload.updates }
                    : message
                ),
              }
            : chat
        ),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'LOAD_CHATS':
      return {
        ...state,
        chats: action.payload,
      };

    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Загрузка чатов из localStorage при инициализации
  useEffect(() => {
    try {
      const savedChats = localStorage.getItem('ai-chat-bot-chats');
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        dispatch({ type: 'LOAD_CHATS', payload: parsedChats });
        
        // Устанавливаем последний активный чат
        if (parsedChats.length > 0) {
          dispatch({ type: 'SET_CURRENT_CHAT', payload: parsedChats[0].id });
        }
      }
    } catch (error) {
      console.error('Failed to load chats from localStorage:', error);
    }
  }, []);

  // Сохранение чатов в localStorage при изменении
  useEffect(() => {
    try {
      localStorage.setItem('ai-chat-bot-chats', JSON.stringify(state.chats));
    } catch (error) {
      console.error('Failed to save chats to localStorage:', error);
    }
  }, [state.chats]);

  const createChat = () => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: 'Новый чат',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      model: 'gpt-3.5-turbo',
    };
    dispatch({ type: 'CREATE_CHAT', payload: newChat });
  };

  const deleteChat = (chatId: string) => {
    dispatch({ type: 'DELETE_CHAT', payload: chatId });
  };

  const updateChat = (chatId: string, updates: Partial<Chat>) => {
    dispatch({ type: 'UPDATE_CHAT', payload: { chatId, updates } });
  };

  const setCurrentChat = (chatId: string) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chatId });
  };

  const addMessage = (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: { chatId, message: newMessage } });
  };

  const updateMessage = (chatId: string, messageId: string, updates: Partial<Message>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { chatId, messageId, updates } });
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
    
    dispatch({ type: 'LOAD_CHATS', payload: [...state.chats, ...processedChats] });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value: ChatContextType = {
    state,
    createChat,
    deleteChat,
    updateChat,
    setCurrentChat,
    addMessage,
    updateMessage,
    exportChats,
    importChats,
    clearError,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
