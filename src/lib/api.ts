import { models } from './models';

const API_BASE_URLS = {
  'deepseek': 'https://api.deepseek.com/v1',
  'openai': 'https://api.openai.com/v1',
  'anthropic': 'https://api.anthropic.com/v1',
  'google': 'https://generativelanguage.googleapis.com/v1',
  'ollama': 'http://localhost:11434',
  'qwen': 'https://dashscope.aliyuncs.com/api/v1',
};

interface ApiRequest {
  chatId: string;
  messages: { role: string; content: string }[];
  model: string;
  stream: boolean;
}

interface ApiResponse {
  reply: string;
  finishReason?: string;
  meta?: any;
}

class ApiClient {
  private getApiKey(modelId: string): string | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.log('⚠️ localStorage not available in getApiKey');
        return null;
      }
      
      const savedKeys = localStorage.getItem('ai-chat-bot-api-keys');
      console.log('🔑 Getting API key for model:', modelId);
      console.log('🔑 Saved keys from localStorage:', savedKeys);
      
      if (savedKeys) {
        try {
          const apiKeys = JSON.parse(savedKeys);
          const apiKey = apiKeys[modelId] || null;
          console.log('🔑 Found API key for', modelId, ':', apiKey ? 'YES' : 'NO');
          if (apiKey) {
            console.log('🔑 API key starts with:', apiKey.substring(0, 10) + '...');
          }
          return apiKey;
        } catch (parseError) {
          console.error('❌ Error parsing API keys:', parseError);
          return null;
        }
      } else {
        console.log('🔑 No saved keys found in localStorage');
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting API key:', error);
    }
    return null;
  }

  private getProviderFromModel(modelId: string): string {
    // Используем импортированные модели для получения провайдера
    const model = models.find(m => m.id === modelId);
    
    if (model && model.provider && model.provider.id) {
      console.log(`🔍 Provider for ${modelId}: ${model.provider.id}`);
      return model.provider.id;
    }
    
    // Фоллбек на старую логику
    if (modelId.includes('gpt')) return 'openai';
    if (modelId.includes('claude')) return 'anthropic';
    if (modelId.includes('gemini')) return 'google';
    if (modelId.includes('llama')) return 'ollama';
    if (modelId.includes('qwen')) return 'qwen';
    if (modelId.includes('deepseek')) return 'deepseek';
    
    console.log(`⚠️ Provider not found for ${modelId}, using deepseek as default`);
    return 'deepseek'; // по умолчанию
  }

  private async makeRequest(endpoint: string, options: RequestInit, provider: string, apiKey: string): Promise<Response> {
    const baseUrl = API_BASE_URLS[provider as keyof typeof API_BASE_URLS];
    if (!baseUrl) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    const url = `${baseUrl}${endpoint}`;
    console.log('🌐 Making request to:', url);
    console.log('🌐 Provider:', provider);
    console.log('🌐 Request body:', options.body);
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Добавляем заголовки в зависимости от провайдера
    if (provider === 'openai' || provider === 'deepseek') {
      defaultHeaders['Authorization'] = `Bearer ${apiKey}`;
      console.log('🔐 Using Authorization header with Bearer token');
    } else if (provider === 'anthropic') {
      defaultHeaders['x-api-key'] = apiKey;
      defaultHeaders['anthropic-version'] = '2023-06-01';
      console.log('🔐 Using x-api-key header');
    } else if (provider === 'google') {
      defaultHeaders['Authorization'] = `Bearer ${apiKey}`;
      console.log('🔐 Using Authorization header with Bearer token');
    } else if (provider === 'qwen') {
      defaultHeaders['Authorization'] = `Bearer ${apiKey}`;
      console.log('🔐 Using Authorization header with Bearer token');
    }

    console.log('🌐 Final headers:', defaultHeaders);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    console.log('🌐 Response status:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  async sendMessage(request: ApiRequest): Promise<ApiResponse> {
    try {
      console.log('🚀 Starting sendMessage with request:', request);
      
      const provider = this.getProviderFromModel(request.model);
      const apiKey = this.getApiKey(request.model);
      
      console.log('🚀 API Request details:', { 
        model: request.model, 
        provider, 
        hasApiKey: !!apiKey,
        messagesCount: request.messages.length 
      });
      
      // Если нет API ключа, возвращаем сообщение о необходимости подключения
      if (!apiKey && provider !== 'ollama') {
        console.log('⚠️ No API key found for model:', request.model);
        return {
          reply: `🔑 Для использования модели ${request.model} необходимо подключить API ключ.\n\n` +
                 `📝 Как подключить:\n` +
                 `1. Нажмите на кнопку "Добавить API ключ" рядом с моделью\n` +
                 `2. Введите ваш API ключ от ${provider}\n` +
                 `3. Нажмите "Сохранить"\n\n` +
                 `💡 После подключения API ключа вы сможете общаться с этой моделью!`,
          finishReason: 'no_api_key',
          meta: {
            model: request.model,
            provider,
            error: 'API_KEY_REQUIRED',
          },
        };
      }

      let endpoint = '';
      let body: any = {};

      // Настраиваем запрос в зависимости от провайдера
      if (provider === 'openai' || provider === 'deepseek') {
        endpoint = '/chat/completions';
        body = {
          model: request.model,
          messages: request.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          max_tokens: 4096,
          temperature: 0.7,
          stream: false,
        };
      } else if (provider === 'anthropic') {
        endpoint = '/messages';
        body = {
          model: request.model,
          max_tokens: 4096,
          messages: request.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        };
      } else if (provider === 'google') {
        endpoint = '/models/gemini-1.5-pro:generateContent';
        body = {
          contents: request.messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })),
          generationConfig: {
            maxOutputTokens: 4096,
            temperature: 0.7,
          },
        };
      } else if (provider === 'ollama') {
        endpoint = '/api/generate';
        body = {
          model: request.model,
          prompt: request.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
          stream: false,
        };
      } else if (provider === 'qwen') {
        endpoint = '/services/aigc/text-generation/generation';
        body = {
          model: request.model,
          input: {
            messages: request.messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          },
          parameters: {
            max_tokens: 4096,
            temperature: 0.7,
          },
        };
      }

      try {
        const response = await this.makeRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(body),
        }, provider, apiKey || '');

        console.log('✅ API Response received for', provider);
        
        const data = await response.json();
        console.log('✅ API Response data:', data);
        
        // Обрабатываем ответ в зависимости от провайдера
        let reply = '';
        if (provider === 'openai' || provider === 'deepseek') {
          reply = data.choices?.[0]?.message?.content || 'Нет ответа от модели';
        } else if (provider === 'anthropic') {
          reply = data.content?.[0]?.text || 'Нет ответа от модели';
        } else if (provider === 'google') {
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Нет ответа от модели';
        } else if (provider === 'ollama') {
          reply = data.response || 'Нет ответа от модели';
        } else if (provider === 'qwen') {
          reply = data.output?.text || 'Нет ответа от модели';
        }

        if (!reply || reply === 'Нет ответа от модели') {
          console.warn('⚠️ Empty or invalid response from API');
          reply = 'Извините, не удалось получить ответ от модели. Попробуйте отправить сообщение еще раз.';
        }

        console.log('✅ Final reply:', reply);

        return {
          reply,
          finishReason: 'stop',
          meta: {
            model: request.model,
            provider,
            usage: data.usage || {},
          },
        };
      } catch (apiError) {
        console.error('❌ API Error:', apiError);
        
        // Возвращаем понятное сообщение об ошибке API
        let errorMessage = '❌ Произошла ошибка при обращении к API';
        
        if (apiError instanceof Error) {
          if (apiError.message.includes('401') || apiError.message.includes('Unauthorized')) {
            errorMessage = `🔐 Ошибка авторизации API. Возможно, API ключ неверный или истек срок действия.\n\n` +
                          `📝 Проверьте ваш API ключ для модели ${request.model}`;
          } else if (apiError.message.includes('429') || apiError.message.includes('Too Many Requests')) {
            errorMessage = `⏰ Превышен лимит запросов к API. Попробуйте позже или обновите ваш план подписки.`;
          } else if (apiError.message.includes('500') || apiError.message.includes('Internal Server Error')) {
            errorMessage = `🛠️ Временная ошибка сервера API. Попробуйте отправить сообщение еще раз через несколько минут.`;
          } else {
            errorMessage = `❌ Ошибка API: ${apiError.message}\n\n` +
                          `📝 Попробуйте позже или обратитесь в поддержку.`;
          }
        }
        
        return {
          reply: errorMessage,
          finishReason: 'error',
          meta: {
            model: request.model,
            provider,
            error: 'API_ERROR',
            errorDetails: apiError instanceof Error ? apiError.message : 'Unknown error',
          },
        };
      }
    } catch (error) {
      console.error('❌ Unexpected error in sendMessage:', error);
      
      return {
        reply: `❌ Произошла неожиданная ошибка: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
               `📝 Попробуйте отправить сообщение еще раз или обратитесь в поддержку.`,
        finishReason: 'error',
        meta: {
          model: request.model,
          provider: this.getProviderFromModel(request.model),
          error: 'UNEXPECTED_ERROR',
          errorDetails: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async sendMessageStream(request: ApiRequest, onChunk: (chunk: string) => void): Promise<void> {
    try {
      const provider = this.getProviderFromModel(request.model);
      const apiKey = this.getApiKey(request.model);
      
      // Если нет API ключа, отправляем сообщение о необходимости подключения
      if (!apiKey && provider !== 'ollama') {
        const noApiMessage = `🔑 Для использования модели ${request.model} необходимо подключить API ключ.\n\n` +
                           `📝 Как подключить:\n` +
                           `1. Нажмите на кнопку "Добавить API ключ" рядом с моделью\n` +
                           `2. Введите ваш API ключ от ${provider}\n` +
                           `3. Нажмите "Сохранить"\n\n` +
                           `💡 После подключения API ключа вы сможете общаться с этой моделью!`;
        
        // Имитируем потоковую передачу для сообщения об ошибке
        for (let i = 0; i < noApiMessage.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 20));
          onChunk(noApiMessage[i]);
        }
        return;
      }

      let endpoint = '';
      let body: any = {};

      // Настраиваем запрос для стриминга
      if (provider === 'openai' || provider === 'deepseek') {
        endpoint = '/chat/completions';
        body = {
          model: request.model,
          messages: request.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          max_tokens: 4096,
          temperature: 0.7,
          stream: true,
        };
      } else if (provider === 'anthropic') {
        endpoint = '/messages';
        body = {
          model: request.model,
          max_tokens: 4096,
          messages: request.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          stream: true,
        };
      } else if (provider === 'ollama') {
        endpoint = '/api/generate';
        body = {
          model: request.model,
          prompt: request.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n'),
          stream: true,
        };
      } else {
        // Для других провайдеров используем обычный запрос
        const response = await this.sendMessage(request);
        onChunk(response.reply);
        return;
      }

      try {
        const response = await this.makeRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(body),
        }, provider, apiKey || '');

        if (!response.body) {
          throw new Error('No response body for streaming');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  let content = '';
                  
                  if (provider === 'openai' || provider === 'deepseek') {
                    content = parsed.choices?.[0]?.delta?.content;
                  } else if (provider === 'anthropic') {
                    content = parsed.delta?.text;
                  } else if (provider === 'ollama') {
                    content = parsed.response;
                  }
                  
                  if (content) {
                    onChunk(content);
                  }
                } catch (e) {
                  // Игнорируем ошибки парсинга для неполных чанков
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } catch (apiError) {
        console.error('❌ API Error in streaming:', apiError);
        
        // Отправляем сообщение об ошибке API
        let errorMessage = '❌ Произошла ошибка при обращении к API';
        
        if (apiError instanceof Error) {
          if (apiError.message.includes('401') || apiError.message.includes('Unauthorized')) {
            errorMessage = `🔐 Ошибка авторизации API. Возможно, API ключ неверный или истек срок действия.\n\n` +
                          `📝 Проверьте ваш API ключ для модели ${request.model}`;
          } else if (apiError.message.includes('429') || apiError.message.includes('Too Many Requests')) {
            errorMessage = `⏰ Превышен лимит запросов к API. Попробуйте позже или обновите ваш план подписки.`;
          } else if (apiError.message.includes('500') || apiError.message.includes('Internal Server Error')) {
            errorMessage = `🛠️ Временная ошибка сервера API. Попробуйте отправить сообщение еще раз через несколько минут.`;
          } else {
            errorMessage = `❌ Ошибка API: ${apiError.message}\n\n` +
                          `📝 Попробуйте позже или обратитесь в поддержку.`;
          }
        }
        
        // Отправляем сообщение об ошибке по частям
        for (let i = 0; i < errorMessage.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 20));
          onChunk(errorMessage[i]);
        }
      }
    } catch (error) {
      console.error('❌ Unexpected error in streaming:', error);
      
      const errorMessage = `❌ Произошла неожиданная ошибка: ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
                          `📝 Попробуйте отправить сообщение еще раз или обратитесь в поддержку.`;
      
      // Отправляем сообщение об ошибке по частям
      for (let i = 0; i < errorMessage.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20));
        onChunk(errorMessage[i]);
      }
    }
  }

  // Мок функции для тестирования
  async sendMessageMock(request: ApiRequest): Promise<ApiResponse> {
    // Имитируем задержку API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      reply: `Это мок ответ от ${request.model}. Ваше сообщение: "${request.messages[request.messages.length - 1]?.content}"`,
      finishReason: 'stop',
      meta: {
        model: request.model,
        usage: {
          prompt_tokens: Math.floor(Math.random() * 100) + 10,
          completion_tokens: Math.floor(Math.random() * 200) + 20,
          total_tokens: Math.floor(Math.random() * 300) + 30,
        },
      },
    };
  }

  async sendMessageStreamMock(request: ApiRequest, onChunk: (chunk: any) => void): Promise<void> {
    const mockResponse = `Это мок потоковый ответ от ${request.model}. Ваше сообщение: "${request.messages[request.messages.length - 1]?.content}". `;
    
    // Имитируем потоковую передачу
    for (let i = 0; i < mockResponse.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50));
      onChunk({
        type: 'delta',
        delta: mockResponse[i],
      });
    }
    
    onChunk({
      type: 'done',
      meta: {
        model: request.model,
        usage: {
          prompt_tokens: Math.floor(Math.random() * 100) + 10,
          completion_tokens: Math.floor(Math.random() * 200) + 20,
          total_tokens: Math.floor(Math.random() * 300) + 30,
        },
      },
    });
  }
}

export const apiClient = new ApiClient();
