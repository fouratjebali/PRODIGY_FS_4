import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faPlus, faSearch, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { ChatRoom } from "../../services/chatService";
import { User } from "../../contexts/AuthContext";

interface SidebarProps {
  chatRooms: ChatRoom[];
  directMessages: ChatRoom[];
  onSelectChat: (roomId: string, roomType: "room" | "dm", roomName: string) => void;
  currentUser: User;
  onLogout: () => void;
  onCreateRoom: (name: string, userIds?: string[]) => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  chatRooms,
  directMessages,
  onSelectChat,
  currentUser,
  onLogout,
  onCreateRoom,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter chat rooms and direct messages based on the search term
  const filteredChatRooms = chatRooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDirectMessages = directMessages.filter((dm) =>
    dm.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Chat App</h1>
        <p className="text-sm text-gray-400 mt-1">Hello, {currentUser.username}</p>
        {/* Search Input */}
        <div className="mt-3">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1 text-sm bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Chat Rooms */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-2">Rooms</h2>
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading rooms...</p>
          ) : (
            <ul className="space-y-1">
              {filteredChatRooms.map((room) => (
                <li
                  key={room.id}
                  className="cursor-pointer px-2 py-1 rounded hover:bg-gray-700"
                  onClick={() => onSelectChat(room.id, "room", room.name)}
                >
                  {room.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Direct Messages */}
        <div className="p-4">
          <h2 className="text-sm text-gray-400 uppercase mb-2">Direct Messages</h2>
          <ul className="space-y-1">
            {filteredDirectMessages.map((dm) => (
              <li
                key={dm.id}
                className="cursor-pointer px-2 py-1 rounded hover:bg-gray-700"
                onClick={() => onSelectChat(dm.id, "dm", dm.name)}
              >
                {dm.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          className="w-full py-1 bg-indigo-600 rounded hover:bg-indigo-500 text-sm"
          onClick={() => {
            const roomName = prompt("Enter new room name:");
            if (roomName) onCreateRoom(roomName);
          }}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Create Room
        </button>
        <button
          className="mt-2 text-sm text-red-400 hover:underline flex items-center"
          onClick={onLogout}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;