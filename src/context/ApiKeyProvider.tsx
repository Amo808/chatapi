import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ApiKeyState, ApiKeyAction } from '../types';
import { initializeDefaultApiKeys } from '../lib/models';

const ApiKeyContext = createContext<{
  state: ApiKeyState;
  setApiKey: (modelId: string, apiKey: string) => void;
  removeApiKey: (modelId: string) => void;
  getApiKey: (modelId: string) => string | null;
  hasApiKey: (modelId: string) => boolean;
} | null>(null);

const initialState: ApiKeyState = {
  apiKeys: {},
};

function apiKeyReducer(state: ApiKeyState, action: ApiKeyAction): ApiKeyState {
  switch (action.type) {
    case 'SET_API_KEY': {
      const { modelId, apiKey } = action.payload;
      return {
        ...state,
        apiKeys: {
          ...state.apiKeys,
          [modelId]: apiKey,
        },
      };
    }
    case 'REMOVE_API_KEY': {
      const { [action.payload]: removed, ...rest } = state.apiKeys;
      return {
        ...state,
        apiKeys: rest,
      };
    }
    case 'LOAD_API_KEYS': {
      try {
        const savedKeys = localStorage.getItem('ai-chat-bot-api-keys');
        if (savedKeys) {
          return {
            ...state,
            apiKeys: JSON.parse(savedKeys),
          };
        }
      } catch (error) {
        console.error('Error loading API keys from localStorage:', error);
      }
      return state;
    }
    default:
      return state;
  }
}

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(apiKeyReducer, initialState);

  // Инициализируем API ключи при монтировании
  useEffect(() => {
    console.log('🔑 ApiKeyProvider: Starting initialization...');
    
    // Инициализируем DeepSeek API ключ по умолчанию
    initializeDefaultApiKeys();
    
    // Загружаем API ключи из localStorage
    dispatch({ type: 'LOAD_API_KEYS' });
    
    console.log('🔑 ApiKeyProvider: Initialization complete');
  }, []);

  // Сохраняем API ключи в localStorage при изменении
  useEffect(() => {
    if (Object.keys(state.apiKeys).length > 0) {
      console.log('🔑 ApiKeyProvider: Saving API keys to localStorage:', state.apiKeys);
      localStorage.setItem('ai-chat-bot-api-keys', JSON.stringify(state.apiKeys));
    }
  }, [state.apiKeys]);

  const setApiKey = (modelId: string, apiKey: string) => {
    dispatch({ type: 'SET_API_KEY', payload: { modelId, apiKey } });
  };

  const removeApiKey = (modelId: string) => {
    dispatch({ type: 'REMOVE_API_KEY', payload: modelId });
  };

  const getApiKey = (modelId: string): string | null => {
    return state.apiKeys[modelId] || null;
  };

  const hasApiKey = (modelId: string): boolean => {
    return !!state.apiKeys[modelId];
  };

  return (
    <ApiKeyContext.Provider value={{
      state,
      setApiKey,
      removeApiKey,
      getApiKey,
      hasApiKey,
    }}>
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useApiKeys() {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKeys must be used within an ApiKeyProvider');
  }
  return context;
}
