import React from 'react';
import logo from '../../../src/assets/logo.png';
import { ChatRoom } from "../../services/chatService";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { User } from "../../contexts/AuthContext"; 
import { useAuth } from "../../contexts/AuthContext";
import { faCommentDots, faUsers, faSignOutAlt, faSearch, faPlus, faCog, faUserCircle } from '@fortawesome/free-solid-svg-icons';

interface SidebarProps {
  onSelectChat: (chatId: string, chatType: 'room' | 'dm', chatName: string) => void;
  chatRooms: ChatRoom[];
  directMessages: ChatRoom[];
  currentUser: User;
  onLogout: () => void;
  onCreateRoom: (name: string, isPrivate?: boolean, userIds?: string[]) => Promise<void>;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  onSelectChat,
  chatRooms,
  directMessages,
  currentUser,
  onLogout,
  onCreateRoom,
  isLoading
}) => {
  const { logout, user } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredChatRooms = chatRooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDirectMessages = directMessages.filter(dm => 
    dm.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-full md:w-72 lg:w-80 bg-gray-800 flex flex-col h-full border-r border-gray-700 select-none">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <img src={logo} alt="Converse Logo" className="w-8 h-8 mr-2" />
          <h1 className="text-xl font-bold text-white">Converse</h1>
        </div>
        <button className="text-gray-400 hover:text-white">
          <FontAwesomeIcon icon={faCog} />
        </button>
      </div>

      {/* Search and New Chat */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search chats..." 
            className="w-full bg-gray-700 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 ease-in-out" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={() => {
            const roomName = prompt("Enter a new room name:");
            if (roomName) {
              onCreateRoom(roomName);
            }
          }}
          className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> New Chat
        </button>
      </div>

      {/* Chat List */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Rooms */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Chat Rooms</h2>
          <ul className="space-y-1">
            {filteredChatRooms.map(room => (
              <li key={room.id}>
                <button 
                  onClick={() => onSelectChat(room.id, room.type as 'room' | 'dm', room.name)}
                  className="w-full flex items-center p-2.5 text-sm text-gray-300 hover:bg-gray-700 rounded-lg group transition-colors duration-150 ease-in-out focus:outline-none focus:bg-gray-700 focus:ring-1 focus:ring-indigo-500">
                  <FontAwesomeIcon icon={faCommentDots} className="mr-3 text-gray-400 group-hover:text-indigo-400 transition-colors duration-150 ease-in-out" />
                  <span className="flex-1 truncate">{room.name}</span>
                  {"unread" in room && room.unread! > 0 && (
                    <span className="ml-auto text-xs bg-indigo-500 text-white font-semibold rounded-full px-2 py-0.5">
                      {room.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Direct Messages */}
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Direct Messages</h2>
          <ul className="space-y-1">
            {filteredDirectMessages.map(dm => (
              <li key={dm.id}>
                <button 
                  onClick={() => onSelectChat(dm.id, dm.type as 'room' | 'dm', dm.name)}
                  className="w-full flex items-center p-2.5 text-sm text-gray-300 hover:bg-gray-700 rounded-lg group transition-colors duration-150 ease-in-out focus:outline-none focus:bg-gray-700 focus:ring-1 focus:ring-indigo-500">
                  <span className={`w-2.5 h-2.5 rounded-full mr-3 ${dm.online ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  <span className="flex-1 truncate">{dm.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User Profile / Logout */}
      <div className="p-4 border-t border-gray-700 mt-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faUserCircle} className="text-2xl text-gray-400 mr-2" />
            <span className="text-sm font-medium text-white">{user?.username || "Guest"}</span>
          </div>
          <button className="text-gray-400 hover:text-white" onClick={logout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
