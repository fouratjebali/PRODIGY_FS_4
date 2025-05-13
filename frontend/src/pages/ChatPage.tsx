import React, { useState, useEffect, useCallback, useRef } from "react";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList, { Message } from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../contexts/AuthContext";
import { getChatRooms, getChatRoomMessages, createChatRoom, ChatRoom, uploadFile } from "../services/chatService";
import { Socket } from "socket.io-client";
import Sidebar from "../components/layout/Sidebar";

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
    if (!token) {
      logout();
      return;
    }

    const initializeSocket = () => {
      try {
        const socketInstance = getSocketInstance();

        if (!socketInstance) {
          throw new Error("Socket instance could not be created");
        }

        setSocket(socketInstance);

        const handleConnect = () => {
          console.log('Socket connected!', socketInstance.id);
        };

        const handleDisconnect = (reason: string) => {
          console.log('Socket disconnected:', reason);
          if (reason === 'io server disconnect') {
            socketInstance.connect();
          }
        };

        socketInstance.on('connect', handleConnect);
        socketInstance.on('disconnect', handleDisconnect);

        if (!socketInstance.connected) {
          socketInstance.connect();
        }

        return () => {
          socketInstance.off('connect', handleConnect);
          socketInstance.off('disconnect', handleDisconnect);
        };
      } catch (err) {
        console.error('Socket initialization failed:', err);
        setError('Failed to establish real-time connection');
        return () => { };
      }
    };

    const cleanup = initializeSocket();

    return () => {
      cleanup?.();
    };
  }, [token, logout]);

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

  // Replace your current message handling useEffect with this:
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: any) => {
      setMessages(prevMessages => {
        // Don't add if message already exists
        if (prevMessages.some(msg => msg.id === newMessage.id)) {
          return prevMessages;
        }

        const message: Message = {
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
        };

        // Only add if it belongs to current chat or no chat selected yet
        if (!currentChat || newMessage.chatRoomId === currentChat.id) {
          return [...prevMessages, message];
        }
        return prevMessages;
      });
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
    if (!socket || !socket.connected || !currentChat || !user) {
      setError("Not connected to chat server");
      return;
    }

    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;

    // Create optimistic message
    const optimisticMessage: Message = {
      id: tempId,
      sender: {
        id: user.id,
        username: user.username,
      },
      content: messageData.text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOutgoing: true,
      messageType: "text",
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    // Add file info if present
    if (messageData.files?.[0]) {
      const file = messageData.files[0];
      optimisticMessage.messageType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "file";
      optimisticMessage.file = {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileUrl: URL.createObjectURL(file) // Temporary local URL
      };
    }

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      let fileId: string | undefined;

      // Handle file upload if present
      if (messageData.files?.[0]) {
        const uploadedFile = await uploadFile(messageData.files[0]);
        fileId = uploadedFile.id;
      }

      const payload = {
        chatRoomId: currentChat.id,
        content: messageData.text,
        ...(fileId && { fileId })
      };

      socket.emit("sendMessage", payload, (response: { success: boolean; message?: any }) => {
        if (response.success && response.message) {
          setMessages(prev =>
            prev.filter(msg => msg.id !== tempId).concat({
              ...response.message,
              isOutgoing: true,
              timestamp: new Date(response.message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: 'delivered'
            })
          );
        } else {
          // Mark message as failed
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId ? { ...msg, status: 'failed' } : msg
            )
          );
          setError("Failed to send message");
        }
      });

    } catch (err) {
      console.error("Message send error:", err);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId ? { ...msg, status: 'failed' } : msg
        )
      );
      setError("Failed to send message");
    }
  };

  const handleCreateRoom = async (name: string, userIds: string[] = []) => {
    try {
      const newRoomData: { name: string; userIds: string[] } = { name, userIds: userIds || [] };
      const newRoom = await createChatRoom(newRoomData);

      setChatRooms(prev => [...prev, newRoom]);

      setCurrentChat(newRoom);

      setMessages([]);

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
              <MessageList
                messages={messages}
                currentUserId={user.id}
                onRetryFailedMessage={(messageId) => {
                  const failedMessage = messages.find(m => m.id === messageId);
                  if (!failedMessage || !socket || !socket.connected || !currentChat || !user) return;

                  const retryId = `retry-${Date.now()}`;

                  // Mise à jour optimiste du message avec nouveau ID et status
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === messageId
                        ? { ...msg, id: retryId, status: 'sending' }
                        : msg
                    )
                  );

                  try {
                    const payload = {
                      chatRoomId: currentChat.id,
                      content: failedMessage.content,
                      ...(failedMessage.file && { fileId: failedMessage.file.fileName }) // ou `fileId`, selon ton backend
                    };

                    socket.emit("sendMessage", payload, (response: { success: boolean; message?: any }) => {
                      if (response.success && response.message) {
                        setMessages(prev =>
                          prev.filter(m => m.id !== retryId).concat({
                            ...response.message,
                            isOutgoing: true,
                            timestamp: new Date(response.message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            status: 'delivered'
                          })
                        );
                      } else {
                        setMessages(prev =>
                          prev.map(m => m.id === retryId ? { ...m, status: 'failed' } : m)
                        );
                        setError("Message retry failed");
                      }
                    });
                  } catch (error) {
                    console.error("Retry error", error);
                    setMessages(prev =>
                      prev.map(m => m.id === retryId ? { ...m, status: 'failed' } : m)
                    );
                    setError("Retry failed");
                  }
                }
                }
              />
            ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <FontAwesomeIcon icon={faComments} className="text-5xl text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400">No messages yet</h3>
              <p className="text-gray-500">Be the first to send a message in {currentChat.name}!</p>
            </div>
            )}
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isLoadingMessages || !socket?.connected}
            />
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
