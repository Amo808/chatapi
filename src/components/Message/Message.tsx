
import { Message as MessageType } from '../../types';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

export function Message({ message, isStreaming = false }: MessageProps) {
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
          {isStreaming && isAssistant && (
            <span className="inline-block w-2 h-4 ml-1 bg-current animate-typing" />
          )}
        </div>
        
        <div className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-muted'}`}>
          {formatTime(message.timestamp)}
          
          {message.meta?.usage && (
            <span className="ml-2">
              {message.meta.usage.total_tokens} токенов
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
