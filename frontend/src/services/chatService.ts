import apiClient from "./api";
import { Message } from "../components/chat/MessageList"; // Assuming Message type is there

// Define types for API responses (these should match backend DTOs)
export interface ChatRoom {
  id: string;
  name: string;
  isPrivate: boolean;
  // users: User[]; // If backend sends user list
  // messages: Message[]; // If backend sends messages with room
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message; // Optional: for display in sidebar
}

export interface CreateChatRoomDto {
  name: string;
  isPrivate?: boolean;
  userIds?: string[]; // For creating DMs or private group chats
}

export interface SendMessageDto {
  chatRoomId: string;
  content?: string;
  fileId?: string; // If sending a file message
}

// API functions for chat operations

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const response = await apiClient.get("/api/chat/user-rooms");
    return response.data;
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    throw error;
  }
};

export const getChatRoomMessages = async (roomId: string): Promise<Message[]> => {
  try {
    const response = await apiClient.get(`/api/chat/messages/${roomId}`);
    // Transform backend message format to frontend Message type if necessary
    return response.data.map((msg: any) => ({
        id: msg.id,
        sender: {
            id: msg.sender.id,
            username: msg.sender.username,
            avatarUrl: msg.sender.avatarUrl, // Assuming backend provides this
        },
        content: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isOutgoing: false, // This will be set based on current user ID later
        messageType: msg.file ? (msg.file.mimetype.startsWith("image/") ? "image" : (msg.file.mimetype.startsWith("video/") ? "video" : "file")) : "text",
        file: msg.file ? {
            fileName: msg.file.originalname,
            fileUrl: `/media/${msg.file.filename}`, // Construct URL based on backend setup
            fileSize: `${(msg.file.size / 1024 / 1024).toFixed(2)} MB`,
            // fileTypeIcon: getFileIcon(msg.file.mimetype) // Helper function to get icon based on mimetype
        } : undefined,
        createdAt: msg.createdAt
    }));
  } catch (error) {
    console.error(`Error fetching messages for room ${roomId}:`, error);
    throw error;
  }
};

export const createChatRoom = async (roomData: { name: string; userIds: string[] }) => {
  try {
    const token = localStorage.getItem("token"); 
    if (!token) {
      throw new Error("No token found");
    }
    const response = await apiClient.post("/api/chat/create", roomData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating chat room:", error);
    throw error;
  }
};
export const sendMessage = async (messageData: SendMessageDto): Promise<Message> => {
  try {
    const response = await apiClient.post("/api/chat/message", messageData);
    return {
      id: response.data.id,
      sender: {
        id: response.data.sender.id,
        username: response.data.sender.username,
        avatarUrl: response.data.sender.avatarUrl, 
      },
      content: response.data.content,
      timestamp: new Date(response.data.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isOutgoing: true,
      messageType: response.data.file ? (response.data.file.mimetype.startsWith("image/") ? "image" : (response.data.file.mimetype.startsWith("video/") ? "video" : "file")) : "text",
      file: response.data.file ? {
        fileName: response.data.file.originalname,
        fileUrl: `/media/${response.data.file.filename}`, 
        fileSize: `${(response.data.file.size / 1024 / 1024).toFixed(2)} MB`,
      } : undefined,
      createdAt: response.data.createdAt
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
export const uploadFile = async (file: File, onUploadProgress?: (progressEvent: any) => void): Promise<{ id: string, filename: string, originalname: string, mimetype: string, size: number, path: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiClient.post("/api/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return response.data; // Backend should return file metadata including an ID
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

