import { apiClient } from './api';
import { ApiRequest } from '../types';

// Mock fetch globally
Object.defineProperty(window, 'fetch', {
  value: jest.fn(),
  writable: true,
});

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessageMock', () => {
    it('should return a mock response', async () => {
      const request: ApiRequest = {
        chatId: 'test-chat',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        model: 'gpt-3.5-turbo',
        stream: false,
      };

      const response = await apiClient.sendMessageMock(request);

      expect(response).toHaveProperty('reply');
      expect(response).toHaveProperty('finishReason');
      expect(response).toHaveProperty('meta');
      expect(response.meta).toHaveProperty('model');
      expect(response.meta).toHaveProperty('usage');
      expect(typeof response.reply).toBe('string');
      expect(response.reply.length).toBeGreaterThan(0);
    });

    it('should include usage information', async () => {
      const request: ApiRequest = {
        chatId: 'test-chat',
        messages: [
          { role: 'user', content: 'Test message' }
        ],
        stream: false,
      };

      const response = await apiClient.sendMessageMock(request);

      expect(response.meta?.usage).toBeDefined();
      expect(response.meta?.usage?.prompt_tokens).toBeGreaterThan(0);
      expect(response.meta?.usage?.completion_tokens).toBeGreaterThan(0);
      expect(response.meta?.usage?.total_tokens).toBeGreaterThan(0);
    });
  });

  describe('sendMessageStreamMock', () => {
    it('should call onChunk with delta chunks', async () => {
      const request: ApiRequest = {
        chatId: 'test-chat',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        stream: true,
      };

      const onChunk = jest.fn();
      
      await apiClient.sendMessageStreamMock(request, onChunk);

      // Should have multiple delta chunks
      expect(onChunk).toHaveBeenCalledTimes(expect.any(Number));
      
      // Check that we get delta chunks
      const deltaCalls = onChunk.mock.calls.filter((call: any) => call[0].type === 'delta');
      expect(deltaCalls.length).toBeGreaterThan(0);
      
      // Check that we get a done chunk
      const doneCall = onChunk.mock.calls.find((call: any) => call[0].type === 'done');
      expect(doneCall).toBeDefined();
    });

    it('should accumulate content in delta chunks', async () => {
      const request: ApiRequest = {
        chatId: 'test-chat',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        stream: true,
      };

      const chunks: string[] = [];
      const onChunk = jest.fn((chunk: any) => {
        if (chunk.type === 'delta' && chunk.delta) {
          chunks.push(chunk.delta);
        }
      });
      
      await apiClient.sendMessageStreamMock(request, onChunk);

      // Should have accumulated some content
      expect(chunks.length).toBeGreaterThan(0);
      const fullContent = chunks.join('');
      expect(fullContent.length).toBeGreaterThan(0);
    });
  });

  describe('makeRequest', () => {
    it('should make HTTP requests with correct headers', async () => {
      const mockResponse = { data: 'test' };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // This will test the private makeRequest method indirectly
      // through the public sendMessage method
      const request: ApiRequest = {
        chatId: 'test-chat',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        stream: false,
      };

      try {
        await apiClient.sendMessage(request);
      } catch (error) {
        // Expected to fail in test environment, but we can verify fetch was called
      }

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });
});
