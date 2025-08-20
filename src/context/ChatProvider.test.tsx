
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatProvider } from './ChatProvider';
import { useChat } from '../hooks/useChatContext';
import { ApiKeyProvider } from './ApiKeyProvider';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Test component to access context
function TestComponent() {
  const { state, createChat, deleteChat, setCurrentChat } = useChat();
  
  return (
    <div>
      <div data-testid="chat-count">{state.chats.length}</div>
      <div data-testid="current-chat">{state.currentChatId || 'none'}</div>
      <button data-testid="create-chat" onClick={() => createChat()}>
        Create Chat
      </button>
      <button 
        data-testid="delete-chat" 
        onClick={() => state.currentChatId && deleteChat(state.currentChatId)}
      >
        Delete Chat
      </button>
      <button 
        data-testid="set-current" 
        onClick={() => state.chats[0] && setCurrentChat(state.chats[0].id)}
      >
        Set Current
      </button>
    </div>
  );
}

describe('ChatProvider', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('creates a new chat', async () => {
    render(
      <ApiKeyProvider>
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      </ApiKeyProvider>
    );

    expect(screen.getByTestId('chat-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('create-chat'));

    await waitFor(() => {
      expect(screen.getByTestId('chat-count')).toHaveTextContent('1');
    });
  });

  it('deletes a chat', async () => {
    render(
      <ApiKeyProvider>
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      </ApiKeyProvider>
    );

    // Create a chat first
    fireEvent.click(screen.getByTestId('create-chat'));
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-count')).toHaveTextContent('1');
    });

    // Set it as current
    fireEvent.click(screen.getByTestId('set-current'));
    
    await waitFor(() => {
      expect(screen.getByTestId('current-chat')).not.toHaveTextContent('none');
    });

    // Delete the chat
    fireEvent.click(screen.getByTestId('delete-chat'));

    await waitFor(() => {
      expect(screen.getByTestId('chat-count')).toHaveTextContent('0');
    });
  });

  it('provides initial state', () => {
    render(
      <ApiKeyProvider>
        <ChatProvider>
          <TestComponent />
        </ChatProvider>
      </ApiKeyProvider>
    );

    expect(screen.getByTestId('chat-count')).toHaveTextContent('0');
    expect(screen.getByTestId('current-chat')).toHaveTextContent('none');
  });
});
