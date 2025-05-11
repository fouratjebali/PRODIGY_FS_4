import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faUsers, faVideo, faPhone } from '@fortawesome/free-solid-svg-icons';

interface ChatHeaderProps {
  chatName: string;
  memberCount?: number; // Optional for rooms
  isOnline?: boolean; // Optional for DMs
  chatType: 'room' | 'dm';
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatName, memberCount, isOnline, chatType }) => {
  return (
    <header className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 z-10 select-none">
      <div className="flex items-center">
        {/* Placeholder for avatar/group icon */}
        <div className="w-10 h-10 bg-gray-700 rounded-full mr-3 flex items-center justify-center text-indigo-400 font-semibold">
          {chatName.substring(0, 1).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white truncate max-w-xs md:max-w-sm lg:max-w-md">{chatName}</h2>
          {chatType === 'room' && memberCount !== undefined && (
            <p className="text-xs text-gray-400">{memberCount} members</p>
          )}
          {chatType === 'dm' && isOnline !== undefined && (
            <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button className="text-gray-400 hover:text-indigo-400 transition-colors duration-150 p-2 rounded-full hover:bg-gray-700">
          <FontAwesomeIcon icon={faPhone} size="lg" />
        </button>
        <button className="text-gray-400 hover:text-indigo-400 transition-colors duration-150 p-2 rounded-full hover:bg-gray-700">
          <FontAwesomeIcon icon={faVideo} size="lg" />
        </button>
        <button className="text-gray-400 hover:text-indigo-400 transition-colors duration-150 p-2 rounded-full hover:bg-gray-700">
          <FontAwesomeIcon icon={faEllipsisV} size="lg" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;

