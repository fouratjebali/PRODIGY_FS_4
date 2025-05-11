import { io, Socket } from "socket.io-client";

const SOCKET_URL = "ws://localhost:3000"; 

let socket: Socket;

export const initSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL as string, {
      auth: { token },
    });
  }
  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error("Socket not initialized. Call connectSocket first.");
  }
  return socket;
};

export const connectSocket = (token: string): Socket => {
  if (socket && socket.connected) {
    // If already connected and token is the same, or if we don't want to reconnect on every call
    // For simplicity, let's assume we might want to reconnect if token changes or ensure connection
    // socket.disconnect(); 
    console.log("Socket already connected or attempting to reconnect.");
  }

  // Ensure previous connection is closed before creating a new one if it exists
  if (socket) {
    socket.disconnect();
  }

  console.log(`Attempting to connect to WebSocket server at ${SOCKET_URL} with token.`);
  socket = io(SOCKET_URL, {
    // path: "/socket.io", // Default path, ensure it matches server config if changed
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"], // Specify transports, websocket preferred
    // autoConnect: false, // Set to true if you want it to connect immediately, or manage with socket.connect()
  });

  socket.on("connect", () => {
    console.log("Successfully connected to WebSocket server with ID:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected from WebSocket server:", reason);
    // Handle disconnection logic, e.g., attempt to reconnect or notify user
    if (reason === "io server disconnect") {
      // The server intentionally disconnected the socket, or auth failed on server side
      socket.connect(); // Or handle more gracefully
    }
  });

  socket.on("connect_error", (error) => {
    console.error("WebSocket connection error:", error.message);
    // Handle connection errors (e.g., server down, network issue, auth failure during handshake)
    // error.data might contain more info from WsException
    if (error.message.includes("Authentication token not found") || error.message.includes("Invalid token")){
        // This indicates an auth issue, might need to logout user or refresh token
        console.error("WebSocket authentication failed. Consider logging out the user.");
        // Potentially dispatch a global event for logout
        window.dispatchEvent(new CustomEvent("authError"));
    }
  });

  // Generic error listener from server
  socket.on("exception", (error) => {
    console.error("WebSocket server exception:", error);
    // Display error to user or handle specific error types
  });

  return socket;
};

export const disconnectSocket = () => {
  console
  if (socket && socket.connected) {
    console.log("Disconnecting WebSocket...");
    socket.disconnect();
  }
  // socket = null; // Clear the instance if you want a fresh one on next connect
};


