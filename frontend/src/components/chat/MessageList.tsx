import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faImage, faVideo, faFileAlt, faDownload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';


// Define a Message type (this will likely come from a shared types folder or API definition later)
export interface Message {
  id: string;
  sender: {
    id: string;
    username: string;
    avatarUrl?: string; // Optional: URL to sender's avatar
  };
  content: string | null;
  timestamp: string; // Or Date object, then format it
  isOutgoing: boolean;
  messageType: 'text' | 'image' | 'video' | 'file'; // Add other types as needed
  file?: {
    fileName: string;
    fileUrl: string; // URL to download/view the file
    fileSize?: string; // e.g., "2.5 MB"
    fileTypeIcon?: IconDefinition;
  };
  createdAt: string; 
}

// Dummy messages for UI design
const dummyMessages: Message[] = [
  {
    id: '1',
    sender: { id: '1', username: 'Alice', avatarUrl: 'https://via.placeholder.com/150' },
    content: 'Hello, how are you?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isOutgoing: false,
    messageType: 'text',
    file: undefined,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    sender: { id: '2', username: 'Bob', avatarUrl: 'https://via.placeholder.com/150' },
    content: 'I am good, thanks! How about you?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isOutgoing: true,
    messageType: 'text',
    file: undefined,
    createdAt: new Date().toISOString(),
  },];

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const avatarInitial = message.sender.username.substring(0, 1).toUpperCase();

  const renderFileContent = () => {
    if (!message.file) return null;

    switch (message.messageType) {
      case 'image':
        return (
          <img 
            src={message.file.fileUrl} 
            alt={message.file.fileName} 
            className="rounded-md max-w-xs lg:max-w-sm xl:max-w-md mt-2 cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => window.open(message.file?.fileUrl, 
'_blank')} // Basic image viewer
          />
        );
      case 'video':
        return (
            <div className="mt-2 max-w-xs lg:max-w-sm xl:max-w-md">
                <video controls className="rounded-md w-full" src={message.file.fileUrl}>
                    Your browser does not support the video tag.
                </video>
                <a href={message.file.fileUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-indigo-300 hover:text-indigo-200 mt-1">
                    {message.file.fileName}
                </a>
            </div>
        );
      case 'file':
        return (
          <a 
            href={message.file.fileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center bg-gray-600 hover:bg-gray-500 p-3 rounded-lg mt-2 transition-colors max-w-xs group">
            <FontAwesomeIcon 
              icon={message.file.fileTypeIcon || faFileAlt} 
              className="text-2xl text-gray-300 group-hover:text-indigo-300 mr-3 transition-colors" 
            />
            <div className="overflow-hidden">
              <span className="text-sm text-gray-100 group-hover:text-white truncate block">{message.file.fileName}</span>
              {message.file.fileSize && <span className="text-xs text-gray-400">{message.file.fileSize}</span>}
            </div>
            <FontAwesomeIcon icon={faDownload} className="ml-auto text-gray-400 group-hover:text-indigo-300 transition-colors" />
          </a>
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
        className={`p-3 rounded-xl max-w-[70%] md:max-w-[60%] lg:max-w-[55%] shadow-md ${ 
          message.isOutgoing 
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-gray-700 text-gray-200 rounded-bl-none'
        }`}>
        {!message.isOutgoing && (
          <p className="text-xs font-semibold text-indigo-400 mb-0.5">{message.sender.username}</p>
        )}
        {message.content && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
        {renderFileContent()}
        <p className={`text-xs mt-1.5 ${message.isOutgoing ? 'text-indigo-200' : 'text-gray-500'} text-right`}>
          {message.timestamp}
        </p>
      </div>
      {message.isOutgoing && (
        <div className="w-10 h-10 rounded-full ml-3 flex-shrink-0 bg-indigo-500 flex items-center justify-center text-white font-semibold overflow-hidden">
          {/* Current user avatar placeholder */}
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
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = React.useRef<null | HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
        <div className="flex-1 flex items-center justify-center p-4 bg-gray-850">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-500" />
            <p className="ml-4 text-lg text-gray-400">Loading messages...</p>
        </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto bg-gray-850 custom-scrollbar selection:bg-indigo-500 selection:text-white">
      {messages.map(msg => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

// Example usage within a ChatArea component (not defined here)
// <MessageList messages={dummyMessages} />

export default MessageList;

