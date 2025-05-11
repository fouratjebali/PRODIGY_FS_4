import { User, JwtPayload } from "./user.model";

export interface ChatRoom {
  id: string; 
  name: string;
  isPrivate: boolean;
  creatorId?: string | null; 
  members?: User[]; 
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string; 
  content?: string | null; 
  senderId: string; 
  chatRoomId: string; 
  fileId?: string | null; 
  sender?: Pick<User, "id" | "username" | "avatarUrl">; 
  file?: { 
    id: string;
    filename: string;
    originalname: string; 
    mimetype: string;
    size: number;
    path: string; 
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomDto {
  name: string;
  isPrivate?: boolean;
  memberIds?: string[]; 
}

export interface JoinRoomDto {
  chatRoomId: string;
}

export interface SendMessageDto {
  chatRoomId: string;
  content?: string;
  fileId?: string; 
}

