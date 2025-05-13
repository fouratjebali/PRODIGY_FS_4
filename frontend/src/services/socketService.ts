import { io, Socket } from "socket.io-client";

const SOCKET_URL = "ws://localhost:3000";
let socket: Socket;

export const initSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, { auth: { token } });
  }
  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
};

export const connectSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Connected with ID:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
    if (reason === "io server disconnect") {
      setTimeout(() => socket.connect(), 1000);
    }
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error.message);
    if (error.message.includes("Invalid token")) {
      window.dispatchEvent(new CustomEvent("authError"));
    }
  });

  socket.on("exception", (error) => {
    console.error("Server exception:", error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};