import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserCircle, 
  faImage, 
  faVideo, 
  faFileAlt, 
  faDownload, 
  faSpinner,
  faExclamationCircle,
  faComments
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

export interface Message {
  id: string;
  sender: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  content: string | null;
  timestamp: string;
  isOutgoing: boolean;
  messageType: 'text' | 'image' | 'video' | 'file';
  file?: {
    fileName: string;
    fileUrl: string;
    fileSize?: string;
    fileTypeIcon?: IconDefinition;
  };
  createdAt: string;
  status?: 'sending' | 'delivered' | 'failed';
}

interface MessageItemProps {
  message: Message;
  onRetry?: (messageId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onRetry }) => {
  const avatarInitial = message.sender.username.substring(0, 1).toUpperCase();
  const isFailed = message.status === 'failed';

  const renderFileContent = () => {
    if (!message.file) return null;

    const filePreviewClasses = "rounded-md max-w-xs lg:max-w-sm xl:max-w-md mt-2 cursor-pointer hover:opacity-90 transition-opacity";

    switch (message.messageType) {
      case 'image':
        return (
          <div className="relative">
            <img 
              src={message.file.fileUrl} 
              alt={message.file.fileName} 
              className={filePreviewClasses}
              onClick={() => window.open(message.file?.fileUrl, '_blank')}
            />
            {isFailed && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 text-2xl" />
            </div>}
          </div>
        );
      case 'video':
        return (
          <div className="mt-2 max-w-xs lg:max-w-sm xl:max-w-md relative">
            <video controls className="rounded-md w-full" src={message.file.fileUrl}>
              Your browser does not support the video tag.
            </video>
            {isFailed && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 text-2xl" />
            </div>}
            <a 
              href={message.file.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block text-xs text-indigo-300 hover:text-indigo-200 mt-1"
            >
              {message.file.fileName}
            </a>
          </div>
        );
      case 'file':
        return (
          <div className="relative">
            <a 
              href={!isFailed ? message.file.fileUrl : '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`flex items-center ${isFailed ? 'bg-gray-700' : 'bg-gray-600 hover:bg-gray-500'} p-3 rounded-lg mt-2 transition-colors max-w-xs group`}
              onClick={isFailed ? (e) => e.preventDefault() : undefined}
            >
              <FontAwesomeIcon 
                icon={message.file.fileTypeIcon || faFileAlt} 
                className={`text-2xl ${isFailed ? 'text-gray-500' : 'text-gray-300 group-hover:text-indigo-300'} mr-3 transition-colors`} 
              />
              <div className="overflow-hidden">
                <span className={`text-sm ${isFailed ? 'text-gray-500' : 'text-gray-100 group-hover:text-white'} truncate block`}>
                  {message.file.fileName}
                </span>
                {message.file.fileSize && (
                  <span className={`text-xs ${isFailed ? 'text-gray-600' : 'text-gray-400'}`}>
                    {message.file.fileSize}
                  </span>
                )}
              </div>
              {!isFailed && (
                <FontAwesomeIcon 
                  icon={faDownload} 
                  className="ml-auto text-gray-400 group-hover:text-indigo-300 transition-colors" 
                />
              )}
            </a>
            {isFailed && (
              <div className="absolute inset-0 flex items-center justify-center">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500" />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-start mb-4 ${message.isOutgoing ? 'justify-end' : ''}`}>
      {!message.isOutgoing && (
        <div className="w-10 h-10 rounded-full mr-3 flex-shrink-0 bg-gray-600 flex items-center justify-center text-white font-semibold overflow-hidden">
          {message.sender.avatarUrl ? (
            <img src={message.sender.avatarUrl} alt={message.sender.username} className="w-full h-full object-cover" />
          ) : (
            avatarInitial
          )}
        </div>
      )}
      <div 
        className={`relative p-3 rounded-xl max-w-[70%] md:max-w-[60%] lg:max-w-[55%] shadow-md ${
          message.isOutgoing 
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-700 text-gray-200 rounded-bl-none'
        } ${
          isFailed ? 'opacity-80 border border-red-500' : ''
        }`}
      >
        {!message.isOutgoing && (
          <p className="text-xs font-semibold text-indigo-400 mb-0.5">{message.sender.username}</p>
        )}
        {message.content && (
          <p className={`text-sm whitespace-pre-wrap break-words ${isFailed ? 'text-gray-400' : ''}`}>
            {message.content}
          </p>
        )}
        {renderFileContent()}
        <div className="flex items-center justify-end mt-1.5 space-x-2">
          {isFailed && message.isOutgoing && onRetry && (
            <button 
              onClick={() => onRetry(message.id)}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
            >
              Retry
            </button>
          )}
          <p className={`text-xs ${message.isOutgoing ? 'text-indigo-200' : 'text-gray-500'}`}>
            {message.timestamp}
            {message.isOutgoing && message.status && (
              <span className="ml-1">
                {message.status === 'sending' && <FontAwesomeIcon icon={faSpinner} spin />}
                {message.status === 'delivered' && '✓'}
                {message.status === 'failed' && '✗'}
              </span>
            )}
          </p>
        </div>
      </div>
      {message.isOutgoing && (
        <div className="w-10 h-10 rounded-full ml-3 flex-shrink-0 bg-indigo-500 flex items-center justify-center text-white font-semibold overflow-hidden">
          {message.sender.avatarUrl ? (
            <img src={message.sender.avatarUrl} alt={message.sender.username} className="w-full h-full object-cover" />
          ) : (
            avatarInitial
          )}
        </div>
      )}
    </div>
  );
};

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  currentUserId: string;
  onRetryFailedMessage?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading, 
  currentUserId,
  onRetryFailedMessage 
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processedMessages = messages.map(msg => ({
    ...msg,
    isOutgoing: msg.sender.id === currentUserId
  }));

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-850">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-500" />
        <p className="ml-4 text-lg text-gray-400">Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-850 text-center">
        <FontAwesomeIcon icon={faComments} className="text-5xl text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-gray-400">No messages yet</h3>
        <p className="text-gray-500">Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto bg-gray-850 custom-scrollbar selection:bg-indigo-500 selection:text-white">
      {processedMessages.map(msg => (
        <MessageItem 
          key={msg.id} 
          message={msg} 
          onRetry={onRetryFailedMessage}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;