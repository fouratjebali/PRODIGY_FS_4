import React, { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "../components/layout/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList, { Message } from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../contexts/AuthContext";
import { getChatRooms, getChatRoomMessages, createChatRoom, ChatRoom, uploadFile } from "../services/chatService";
import { Socket } from "socket.io-client";

const ChatPage: React.FC = () => {
  const { user, logout, getSocketInstance, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (token) {
    if (!socket || !socket.connected) {
      const socketInstance = getSocketInstance();
      setSocket(socketInstance);
    }
  } else {
    logout();
  }
}, [token, socket, getSocketInstance, logout]);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoadingRooms(true);
      setError(null);
      try {
        const rooms = await getChatRooms();
        setChatRooms(rooms);
      } catch (err) {
        setError("Failed to load chat rooms.");
        console.error(err);
      }
      setIsLoadingRooms(false);
    };
    if (user) {
      fetchRooms();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: any) => {
      if (currentChat && newMessage.chatRoomId === currentChat.id) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: newMessage.id,
            sender: {
              id: newMessage.sender.id,
              username: newMessage.sender.username,
              avatarUrl: newMessage.sender.avatarUrl,
            },
            content: newMessage.content,
            timestamp: new Date(newMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isOutgoing: newMessage.sender.id === user?.id,
            messageType: newMessage.file
              ? newMessage.file.mimetype.startsWith("image/")
                ? "image"
                : newMessage.file.mimetype.startsWith("video/")
                ? "video"
                : "file"
              : "text",
            file: newMessage.file
              ? {
                  fileName: newMessage.file.originalname,
                  fileUrl: `/media/${newMessage.file.filename}`,
                  fileSize: `${(newMessage.file.size / 1024 / 1024).toFixed(2)} MB`,
                }
              : undefined,
            createdAt: newMessage.createdAt,
          },
        ]);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, currentChat, user?.id]);

  const handleSelectChat = useCallback(async (roomId: string, roomType: "room" | "dm", roomName: string) => {
    const selectedRoom = chatRooms.find((r) => r.id === roomId);
    if (!selectedRoom) {
      setError("Selected chat room not found.");
      return;
    }
    setCurrentChat(selectedRoom);
    setIsLoadingMessages(true);
    setError(null);
    try {
      const fetchedMessages = await getChatRoomMessages(roomId);
      setMessages(fetchedMessages.map((msg) => ({ ...msg, isOutgoing: msg.sender.id === user?.id })).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    } catch (err) {
      setError(`Failed to load messages for ${roomName}.`);
      console.error(err);
      setMessages([]);
    }
    setIsLoadingMessages(false);
  }, [chatRooms, user?.id]);

  const handleSendMessage = async (messageData: { text: string; files?: File[] }) => {
    if (!socket || !currentChat || !user) return;

    let fileId: string | undefined = undefined;
    let fileInfoForMessage: Message["file"] = undefined;

    if (messageData.files && messageData.files.length > 0) {
      const fileToUpload = messageData.files[0];
      try {
        const uploadedFile = await uploadFile(fileToUpload, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        });
        fileId = uploadedFile.id;
        fileInfoForMessage = {
          fileName: uploadedFile.originalname,
          fileUrl: `/media/${uploadedFile.filename}`,
          fileSize: `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`,
        };
      } catch (uploadError) {
        console.error("File upload failed:", uploadError);
        setError("Failed to upload file. Message not sent.");
        return;
      }
    }

    const payload: { chatRoomId: string; content?: string; fileId?: string } = {
      chatRoomId: currentChat.id,
    };
    if (messageData.text) {
      payload.content = messageData.text;
    }
    if (fileId) {
      payload.fileId = fileId;
    }

    if (!payload.content && !payload.fileId) {
      return;
    }

    socket.emit("sendMessage", payload);
  };

  const handleCreateRoom = async (name: string, isPrivate: boolean = false, userIds: string[] = []) => {
    if (!user) return;
    try {
      const newRoomData: { name: string; isPrivate?: boolean; userIds?: string[] } = { name };
      if (isPrivate) newRoomData.isPrivate = true;
      if (userIds.length > 0) newRoomData.userIds = userIds;
      else if (!isPrivate) newRoomData.userIds = [user.id];

      const newRoom = await createChatRoom(newRoomData);
      setChatRooms((prev) => [...prev, newRoom]);
      handleSelectChat(newRoom.id, newRoom.isPrivate ? "dm" : "room", newRoom.name);
    } catch (err) {
      setError("Failed to create room.");
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-gray-900 text-white antialiased overflow-hidden">
      <Sidebar
        chatRooms={chatRooms}
        directMessages={[]}
        onSelectChat={handleSelectChat}
        currentUser={user}
        onLogout={logout}
        onCreateRoom={handleCreateRoom}
        isLoading={isLoadingRooms}
      />
      <main className="flex-1 flex flex-col bg-gray-850">
        {currentChat ? (
          <>
            <ChatHeader chatName={currentChat.name} chatType={currentChat.isPrivate ? "dm" : "room"} />
            {isLoadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-indigo-500" />
              </div>
            ) : messages.length > 0 ? (
              <MessageList messages={messages} currentUserId={user.id} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <FontAwesomeIcon icon={faComments} className="text-5xl text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400">No messages yet</h3>
                <p className="text-gray-500">Be the first to send a message in {currentChat.name}!</p>
              </div>
            )}
            <MessageInput onSendMessage={handleSendMessage} disabled={isLoadingMessages || !socket?.connected} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <FontAwesomeIcon icon={faComments} className="text-6xl text-gray-600 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-400">Select or Create a Chat</h2>
            <p className="text-gray-500 mt-2">
              Choose a room from the sidebar, or create a new one to start messaging.
            </p>
            {isLoadingRooms && <FontAwesomeIcon icon={faSpinner} spin className="text-indigo-500 mt-4" size="2x" />}
          </div>
        )}
        {error && <div className="absolute bottom-4 right-4 bg-red-500 text-white p-3 rounded-md shadow-lg">{error}</div>}
      </main>
    </div>
  );
};

export default ChatPage;
