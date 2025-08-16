
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatProvider, useChat } from './ChatProvider';
import { Chat } from '../types';

// Test component that uses the context
function TestComponent() {
  const { state, createChat, deleteChat, setCurrentChat } = useChat();
  
  return (
    <div>
      <div data-testid="chat-count">{state.chats.length}</div>
      <div data-testid="current-chat">{state.currentChatId || 'none'}</div>
      <button onClick={createChat} data-testid="create-chat">Create Chat</button>
      <button onClick={() => deleteChat('chat-1')} data-testid="delete-chat">Delete Chat</button>
      <button onClick={() => setCurrentChat('chat-2')} data-testid="set-current">Set Current</button>
    </div>
  );
}

describe('ChatProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('provides initial state', () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    expect(screen.getByTestId('chat-count')).toHaveTextContent('0');
    expect(screen.getByTestId('current-chat')).toHaveTextContent('none');
  });

  it('creates a new chat', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    fireEvent.click(screen.getByTestId('create-chat'));

    await waitFor(() => {
      expect(screen.getByTestId('chat-count')).toHaveTextContent('1');
    });
    
    expect(screen.getByTestId('current-chat')).not.toHaveTextContent('none');
  });

  it('deletes a chat', async () => {
    // First create a chat
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    fireEvent.click(screen.getByTestId('create-chat'));
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-count')).toHaveTextContent('1');
    });

    // Then delete it
    fireEvent.click(screen.getByTestId('delete-chat'));
    
    await waitFor(() => {
      expect(screen.getByTestId('chat-count')).toHaveTextContent('0');
    });
  });

  it('sets current chat', async () => {
    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    // Create a chat first
    fireEvent.click(screen.getByTestId('create-chat'));
    
    await waitFor(() => {
      expect(screen.getByTestId('current-chat')).not.toHaveTextContent('none');
    });

    // Set a different current chat
    fireEvent.click(screen.getByTestId('set-current'));
    
    await waitFor(() => {
      expect(screen.getByTestId('current-chat')).toHaveTextContent('chat-2');
    });
  });

  it('loads chats from localStorage on mount', () => {
    const mockChats: Chat[] = [
      {
        id: 'chat-1',
        title: 'Test Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPinned: false,
      },
    ];

    localStorage.setItem('ai-chat-bot-chats', JSON.stringify(mockChats));

    render(
      <ChatProvider>
        <TestComponent />
      </ChatProvider>
    );

    expect(screen.getByTestId('chat-count')).toHaveTextContent('1');
  });
});
