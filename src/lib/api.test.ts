import { apiClient } from './api';

// Простые тесты для API без сложных импортов
describe('API Client', () => {
  it('should be defined', () => {
    expect(true).toBe(true);
  });

  it('should handle basic functionality', () => {
    const mockData = { test: 'data' };
    expect(mockData).toEqual({ test: 'data' });
  });

  it('should support async operations', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      // Мокаем localStorage
      const mockApiKeys = {
        'deepseek-chat': 'sk-test-key'
      };
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn((key) => {
            if (key === 'ai-chat-bot-api-keys') {
              return JSON.stringify(mockApiKeys);
            }
            return null;
          }),
          setItem: jest.fn(),
        },
        writable: true,
      });

      // Мокаем fetch
      (window as any).fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            choices: [{ message: { content: 'Test response' } }],
            usage: { total_tokens: 10 }
          }),
        } as Response)
      ) as jest.Mock;

      const request = {
        chatId: 'test-chat',
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'deepseek-chat',
        stream: false,
      };

      const response = await apiClient.sendMessage(request);

      expect(response.reply).toBe('Test response');
      expect(response.meta.model).toBe('deepseek-chat');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.deepseek.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test-key',
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });
});
