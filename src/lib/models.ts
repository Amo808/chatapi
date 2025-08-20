import { LLMModel, LLMProvider } from '../types';

export const providers: LLMProvider[] = [
  {
    id: 'deepseek',
    name: 'deepseek',
    displayName: 'DeepSeek',
    icon: '🚀',
    color: '#6366f1',
    isAvailable: true,
  },
  {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    icon: '🤖',
    color: '#10a37f',
    isAvailable: false, // Временно отключено
  },
  {
    id: 'anthropic',
    name: 'anthropic',
    displayName: 'Anthropic',
    icon: '🧠',
    color: '#3b82f6',
    isAvailable: false, // Временно отключено
  },
  {
    id: 'google',
    name: 'google',
    displayName: 'Google',
    icon: '✨',
    color: '#8b5cf6',
    isAvailable: false, // Временно отключено
  },
  {
    id: 'ollama',
    name: 'ollama',
    displayName: 'Ollama',
    icon: '🦙',
    color: '#f59e0b',
    isAvailable: false, // Временно отключено
  },
  {
    id: 'qwen',
    name: 'qwen',
    displayName: 'Qwen',
    icon: '🌟',
    color: '#ec4899',
    isAvailable: false, // Временно отключено
  },
];

export const models: LLMModel[] = [
  {
    id: 'deepseek-chat',
    name: 'deepseek-chat',
    displayName: 'DeepSeek Chat',
    provider: providers[0], // DeepSeek
    contextLength: 32768,
    maxTokens: 4096,
    isAvailable: true,
    pricing: {
      input: 0.00014, // $0.14 за 1K токенов ввода
      output: 0.00028, // $0.28 за 1K токенов вывода
    },
  },
  {
    id: 'gpt-4o',
    name: 'gpt-4o',
    displayName: 'GPT-4o',
    provider: providers[1], // OpenAI
    contextLength: 128000,
    maxTokens: 4096,
    isAvailable: false, // Временно отключено
    pricing: {
      input: 0.0025,
      output: 0.01,
    },
  },
  {
    id: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    provider: providers[1], // OpenAI
    contextLength: 128000,
    maxTokens: 4096,
    isAvailable: false, // Временно отключено
    pricing: {
      input: 0.00015,
      output: 0.0006,
    },
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    provider: providers[1], // OpenAI
    contextLength: 16385,
    maxTokens: 4096,
    isAvailable: false, // Временно отключено
    pricing: {
      input: 0.0005,
      output: 0.0015,
    },
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'claude-3.5-sonnet',
    displayName: 'Claude 3.5 Sonnet',
    provider: providers[2], // Anthropic
    contextLength: 200000,
    maxTokens: 4096,
    isAvailable: false, // Временно отключено
    pricing: {
      input: 0.003,
      output: 0.015,
    },
  },
  {
    id: 'claude-3-haiku',
    name: 'claude-3-haiku',
    displayName: 'Claude 3 Haiku',
    provider: providers[2], // Anthropic
    contextLength: 200000,
    maxTokens: 4096,
    isAvailable: false, // Временно отключено
    pricing: {
      input: 0.00025,
      output: 0.00125,
    },
  },
  {
    id: 'gemini-1.5-pro',
    name: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
    provider: providers[3], // Google
    contextLength: 1000000,
    maxTokens: 8192,
    isAvailable: false, // Временно отключено
    pricing: {
      input: 0.0025,
      output: 0.0075,
    },
  },
  {
    id: 'gemini-1.5-flash',
    name: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash',
    provider: providers[3], // Google
    contextLength: 1000000,
    maxTokens: 8192,
    isAvailable: false, // Временно отключено
    pricing: {
      input: 0.000075,
      output: 0.0003,
    },
  },
  {
    id: 'llama-3.1-70b',
    name: 'llama-3.1-70b',
    displayName: 'Llama 3.1 70B',
    provider: providers[4], // Ollama
    contextLength: 8192,
    maxTokens: 4096,
    isAvailable: false, // Временно отключено
    pricing: {
      input: 0.0, // Локальная модель
      output: 0.0,
    },
  },
  {
    id: 'llama-3.1-8b',
    name: 'llama-3.1-8b',
    displayName: 'Llama 3.1 8B',
    provider: providers[4], // Ollama
    contextLength: 8192,
    maxTokens: 4096,
    isAvailable: false, // Временно отключено
    pricing: {
      input: 0.0, // Локальная модель
      output: 0.0,
    },
  },
  {
    id: 'qwen-2.5-72b',
    name: 'qwen-2.5-72b',
    displayName: 'Qwen 2.5 72B',
    provider: providers[5], // Qwen
    contextLength: 32768,
    maxTokens: 4096,
    isAvailable: false, // Временно отключено
    pricing: {
      input: 0.0006,
      output: 0.0012,
    },
  },
  {
    id: 'qwen-2.5-7b',
    name: 'qwen-2.5-7b',
    displayName: 'Qwen 2.5 7B',
    provider: providers[5], // Qwen
    contextLength: 32768,
    maxTokens: 4096,
    isAvailable: false, // Временно отключено
    pricing: {
      input: 0.0003,
      output: 0.0006,
    },
  },
];

export const getModelIcon = (modelId: string): string => {
  const model = models.find(m => m.id === modelId);
  return model?.provider.icon || '🤖';
};

export const getModelDisplayName = (modelId: string): string => {
  const model = models.find(m => m.id === modelId);
  return model?.displayName || 'Unknown Model';
};

export const getModelDescription = (modelId: string): string => {
  const model = models.find(m => m.id === modelId);
  if (!model) return 'Модель не найдена';
  
  if (model.id === 'deepseek-chat') {
    return '🚀 Мощная модель от DeepSeek с контекстом 32K токенов';
  }
  
  return `${model.provider.displayName} модель с контекстом ${formatContextLength(model.contextLength)}`;
};

export const formatContextLength = (length: number): string => {
  if (length >= 1000000) {
    return `${(length / 1000000).toFixed(1)}M`;
  }
  if (length >= 1000) {
    return `${(length / 1000).toFixed(0)}K`;
  }
  return length.toString();
};

// Инициализация API ключа DeepSeek по умолчанию
export const initializeDefaultApiKeys = () => {
  try {
    console.log('🔑 Initializing default API keys...');
    
    // Проверяем, доступен ли localStorage
    if (typeof window === 'undefined' || !window.localStorage) {
      console.log('⚠️ localStorage not available (probably in test environment)');
      return;
    }
    
    // Считываем DeepSeek API ключ из env при наличии (никаких хардкодов)
    const deepseekKey = (
      (typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_DEEPSEEK_API_KEY : undefined) ||
      (typeof process !== 'undefined' ? (process as any).env?.VITE_DEEPSEEK_API_KEY : undefined) ||
      ''
    );
    
    // Простая и надежная установка ключа
    try {
      // Получаем существующие ключи
      const existingKeys = localStorage.getItem('ai-chat-bot-api-keys');
      let apiKeys: Record<string, string> = {};
      
      if (existingKeys) {
        try {
          apiKeys = JSON.parse(existingKeys);
          console.log('🔑 Existing API keys found:', Object.keys(apiKeys));
        } catch (e) {
          console.log('⚠️ Failed to parse existing keys, starting fresh');
          apiKeys = {};
        }
      }
      
      // Если ключ из env задан и похож на реальный, добавим его. Иначе ничего не записываем
      if (typeof deepseekKey === 'string' && deepseekKey.startsWith('sk-')) {
        apiKeys['deepseek-chat'] = deepseekKey;
      }
      
      // Сохраняем обновленные ключи
      if (Object.keys(apiKeys).length > 0) {
        localStorage.setItem('ai-chat-bot-api-keys', JSON.stringify(apiKeys));
        console.log('✅ API keys updated successfully:', Object.keys(apiKeys));
      } else {
        console.log('ℹ️ No API keys to set from env');
      }
      
      // Проверяем сохранение
      const verifyKeys = localStorage.getItem('ai-chat-bot-api-keys');
      if (verifyKeys) {
        const parsedVerify = JSON.parse(verifyKeys);
        if (deepseekKey && parsedVerify['deepseek-chat'] === deepseekKey) {
          console.log('✅ DeepSeek API key verified successfully!');
        } else {
          console.log('❌ DeepSeek API key verification failed!');
        }
      }
      
    } catch (error) {
      console.error('❌ Error setting API keys:', error);
    }
    
  } catch (error) {
    console.error('❌ Error initializing default API keys:', error);
  }
};
