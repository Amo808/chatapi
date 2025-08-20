
import { render, screen } from '@testing-library/react';
import { Message } from './Message';
import { Message as MessageType } from '../../types';

describe('Message Component', () => {
  const mockUserMessage: MessageType = {
    id: '1',
    role: 'user',
    content: 'Тестовое сообщение',
    timestamp: new Date('2024-01-01T12:00:00Z'),
    chatId: 'chat-1'
  };

  const mockAssistantMessage: MessageType = {
    id: '2',
    role: 'assistant',
    content: 'Ответ ассистента',
    timestamp: new Date('2024-01-01T12:01:00Z'),
    chatId: 'chat-1',
    meta: {
      usage: {
        total_tokens: 30
      }
    }
  };

  it('renders user message correctly', () => {
    render(<Message message={mockUserMessage} />);

    expect(screen.getByText('Тестовое сообщение')).toBeInTheDocument();
    // Проверяем, что время отображается (не важно какое именно)
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(<Message message={mockAssistantMessage} />);

    expect(screen.getByText('Ответ ассистента')).toBeInTheDocument();
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
    expect(screen.getByText('30 токенов')).toBeInTheDocument();
  });

  it('shows typing indicator when streaming', () => {
    render(<Message message={mockAssistantMessage} isStreaming={true} />);
    
    const typingIndicator = screen.getByTestId('typing-indicator');
    expect(typingIndicator).toHaveClass('animate-typing');
  });

  it('applies correct CSS classes for user message', () => {
    render(<Message message={mockUserMessage} />);

    const messageContainer = screen.getByText('Тестовое сообщение').closest('.chat-bubble');
    expect(messageContainer).toHaveClass('chat-bubble-user');
  });

  it('applies correct CSS classes for assistant message', () => {
    render(<Message message={mockAssistantMessage} />);

    const messageContainer = screen.getByText('Ответ ассистента').closest('.chat-bubble');
    expect(messageContainer).toHaveClass('chat-bubble-assistant');
  });
});
