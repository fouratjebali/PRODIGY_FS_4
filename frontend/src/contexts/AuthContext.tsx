import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import apiClient from "../services/api"; // apiClient for HTTP requests
import { Socket } from "socket.io-client"; 
import { connectSocket, disconnectSocket, getSocket, initSocket } from "../services/socketService"; // socket service
import { jwtDecode } from "jwt-decode"; // To decode JWT
import { useNavigate } from "react-router-dom"; // Import useNavigate


export interface User {
  id: string;
  username: string;
  email: string;
  // Add other user properties as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: (email_or_username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getAuthToken: () => string | null;
  getSocketInstance: () => Socket | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const navigate = useNavigate(); 

  const verifyTokenAndSetUser = useCallback(async (currentToken: string | null) => {
    if (currentToken) {
      try {
        const decodedToken: any = jwtDecode(currentToken);
        if (decodedToken.exp * 1000 < Date.now()) {
          console.log("Token expired.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setToken(null);
          if (socketInstance) disconnectSocket();
          setSocketInstance(null);
          return;
        }
        
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser({ id: decodedToken.sub, email: decodedToken.email, username: decodedToken.username || "User" }); 
        }
        setToken(currentToken);
        const newSocket = connectSocket(currentToken);
        setSocketInstance(newSocket);

      } catch (error) {
        console.error("Invalid token or error decoding token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setToken(null);
        if (socketInstance) disconnectSocket();
        setSocketInstance(null);
      }
    } else {
        setUser(null);
        setToken(null);
        if (socketInstance) disconnectSocket();
        setSocketInstance(null);
    }
    setIsLoading(false);
  }, [socketInstance]); // Added socketInstance to dependencies

  useEffect(() => {
  const currentToken = localStorage.getItem("token");
  verifyTokenAndSetUser(currentToken);

  const handleAuthError = () => {
    console.log("AuthContext: Received authError event. Logging out.");
    logout();
  };
  window.addEventListener("authError", handleAuthError);

  return () => {
    window.removeEventListener("authError", handleAuthError);
  };
}, []); // verifyTokenAndSetUser is memoized

  const login = async (email_or_username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/api/auth/login", { email: email_or_username, password });
      const { token, user: userData } = response.data;
      localStorage.setItem("token",token);
      console.log("Login successful, access token:",token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setToken(token);
      const newSocket = connectSocket(token);
      setSocketInstance(newSocket);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Login failed:", error);
      throw error; // Re-throw to be caught by the calling component
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      await apiClient.post("/api/auth/register", { username, email, password });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = useCallback(() => {
    console.log("Logging out user.");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    if (socketInstance) {
        console.log("Disconnecting socket on logout");
        disconnectSocket();
    }
    setSocketInstance(null);
    navigate("/auth"); 
    
  }, [socketInstance]);

  const getAuthToken = () => token;

  const getSocketInstance = () => {
  console.log("token", token);
  if (!socketInstance || !socketInstance.connected) {
    if (token) {
      if (socketInstance && !socketInstance.connected) {
        console.warn("Socket is already reconnecting. Waiting for connection...");
        return socketInstance;
      }
      console.warn("Socket not connected or instance missing, attempting to reconnect...");
      const newSocket = connectSocket(token);
      setSocketInstance(newSocket);
      return newSocket;
    }
    console.error("Cannot get socket instance: no token or not connected.");
    return null;
  }
  return socketInstance;
};

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, token, isLoading, login, register, logout, getAuthToken, getSocketInstance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

