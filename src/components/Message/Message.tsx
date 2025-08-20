
import { Message as MessageType } from '../../types';
import { getModelIcon, getModelDisplayName } from '../../lib/models';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
  model?: string;
}

export function Message({ message, isStreaming = false, model }: MessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
        <div className="whitespace-pre-wrap break-words">
          {message.content}
          {isStreaming && (
            <span 
              className="inline-block w-2 h-4 ml-1 bg-current animate-typing"
              data-testid="typing-indicator"
            />
          )}
        </div>
        
        <div className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-muted'}`}>
          <div className="flex items-center justify-between">
            <span>{formatTime(message.timestamp)}</span>
            
            {isAssistant && model && (
              <div className="flex items-center gap-1 text-muted">
                <span>{getModelIcon(model)}</span>
                <span>{getModelDisplayName(model)}</span>
              </div>
            )}
          </div>
          
          {message.meta?.usage && (
            <div className="mt-1 text-muted">
              {message.meta.usage.total_tokens} токенов
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
