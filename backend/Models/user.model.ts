export interface User {
  id: string; 
  username: string;
  email: string;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  avatarUrl?: string | null;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

