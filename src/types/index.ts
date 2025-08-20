export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  chatId: string;
  meta?: {
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens: number;
    };
    model?: string;
    finish_reason?: string;
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  model: string;
}

export interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
}

export type ChatAction =
  | { type: 'CREATE_CHAT' }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'SET_CURRENT_CHAT'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'UPDATE_CHAT'; payload: { chatId: string; updates: Partial<Chat> } }
  | { type: 'TOGGLE_PIN_CHAT'; payload: { chatId: string } }
  | { type: 'LOAD_CHATS'; payload: Chat[] };

export interface ApiRequest {
  chatId: string;
  messages: { role: string; content: string }[];
  model: string;
  stream: boolean;
}

export interface ApiResponse {
  reply: string;
  finishReason?: string;
  meta?: any;
}

// New interfaces for LLM models
export interface LLMModel {
  id: string;
  name: string;
  displayName: string;
  provider: LLMProvider;
  contextLength: number;
  maxTokens: number;
  isAvailable: boolean;
  pricing?: {
    input: number; // цена за 1K токенов ввода
    output: number; // цена за 1K токенов вывода
  };
  apiKey?: string; // API ключ для модели
  hasApiKey?: boolean; // есть ли подключенный API ключ
}

export interface LLMProvider {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  isAvailable: boolean;
}

export interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

// Новые типы для управления API ключами
export type ApiKeyAction =
  | { type: 'SET_API_KEY'; payload: { modelId: string; apiKey: string } }
  | { type: 'REMOVE_API_KEY'; payload: string }
  | { type: 'LOAD_API_KEYS' };

export interface ApiKeyState {
  apiKeys: Record<string, string>; // modelId -> apiKey
}
