
import { render, screen } from '@testing-library/react';
import { Message } from './Message';
import { Message as MessageType } from '../../types';

const mockMessage: MessageType = {
  id: '1',
  role: 'user',
  content: 'Тестовое сообщение',
  timestamp: new Date('2024-01-01T12:00:00Z'),
};

const mockAssistantMessage: MessageType = {
  id: '2',
  role: 'assistant',
  content: 'Ответ ассистента',
  timestamp: new Date('2024-01-01T12:01:00Z'),
  meta: {
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
    },
  },
};

describe('Message Component', () => {
  it('renders user message correctly', () => {
    render(<Message message={mockMessage} />);
    
    expect(screen.getByText('Тестовое сообщение')).toBeInTheDocument();
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(<Message message={mockAssistantMessage} />);
    
    expect(screen.getByText('Ответ ассистента')).toBeInTheDocument();
    expect(screen.getByText('12:01')).toBeInTheDocument();
    expect(screen.getByText('30 токенов')).toBeInTheDocument();
  });

  it('shows typing indicator when streaming', () => {
    render(<Message message={mockAssistantMessage} isStreaming={true} />);
    
    const typingIndicator = screen.getByRole('generic');
    expect(typingIndicator).toHaveClass('animate-typing');
  });

  it('applies correct CSS classes for user message', () => {
    render(<Message message={mockMessage} />);
    
    const messageContainer = screen.getByText('Тестовое сообщение').closest('div');
    expect(messageContainer).toHaveClass('chat-bubble-user');
  });

  it('applies correct CSS classes for assistant message', () => {
    render(<Message message={mockAssistantMessage} />);
    
    const messageContainer = screen.getByText('Ответ ассистента').closest('div');
    expect(messageContainer).toHaveClass('chat-bubble-assistant');
  });
});
