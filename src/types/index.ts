export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  meta?: {
    model?: string;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  systemPrompt?: string;
  model?: string;
}

export interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatContextType {
  state: ChatState;
  createChat: () => void;
  deleteChat: (chatId: string) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  setCurrentChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  exportChats: () => void;
  importChats: (chats: Chat[]) => void;
  clearError: () => void;
}

export interface ApiResponse {
  reply: string;
  finishReason?: string;
  meta?: any;
}

export interface ApiRequest {
  chatId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    id?: string;
  }>;
  model?: string;
  stream?: boolean;
}

export interface StreamingChunk {
  type: 'delta' | 'done';
  delta?: string;
  meta?: any;
}
