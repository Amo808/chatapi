import { ApiRequest, ApiResponse, StreamingChunk } from '../types';

// TODO: Замените на реальный API endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

class ApiClient {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      defaultHeaders['Authorization'] = `Bearer ${API_KEY}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async sendMessage(request: ApiRequest): Promise<ApiResponse> {
    return this.makeRequest<ApiResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async sendMessageStream(
    request: ApiRequest,
    onChunk: (chunk: StreamingChunk) => void
  ): Promise<void> {
    const url = `${API_BASE_URL}/chat`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

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
              onChunk({ type: 'done' });
              return;
            }

            try {
              const parsed: StreamingChunk = JSON.parse(data);
              onChunk(parsed);
            } catch (e) {
              console.warn('Failed to parse streaming chunk:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Mock API для демонстрации (удалите в продакшене)
  async sendMessageMock(request: ApiRequest): Promise<ApiResponse> {
    // Имитация задержки API
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const lastMessage = request.messages[request.messages.length - 1];
    const mockResponses = [
      "Это интересный вопрос! Позвольте мне объяснить...",
      "Отличная мысль! Вот что я думаю об этом...",
      "Спасибо за вопрос. Вот подробный ответ...",
      "Интересная тема! Давайте разберем её детально...",
      "Хороший вопрос. Вот мой анализ ситуации..."
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    return {
      reply: randomResponse,
      finishReason: 'stop',
      meta: {
        model: request.model || 'gpt-3.5-turbo',
        usage: {
          prompt_tokens: lastMessage.content.length,
          completion_tokens: randomResponse.length,
          total_tokens: lastMessage.content.length + randomResponse.length
        }
      }
    };
  }

  async sendMessageStreamMock(
    _request: ApiRequest,
    onChunk: (chunk: StreamingChunk) => void
  ): Promise<void> {
    // const lastMessage = _request.messages[_request.messages.length - 1];
    const mockResponses = [
      "Это интересный вопрос! Позвольте мне объяснить...",
      "Отличная мысль! Вот что я думаю об этом...",
      "Спасибо за вопрос. Вот подробный ответ...",
      "Интересная тема! Давайте разберем её детально...",
      "Хороший вопрос. Вот мой анализ ситуации..."
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    
    // Имитация стриминга
    const words = randomResponse.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      onChunk({
        type: 'delta',
        delta: words[i] + (i < words.length - 1 ? ' ' : '')
      });
    }
    
    onChunk({ type: 'done' });
  }
}

export const apiClient = new ApiClient();
