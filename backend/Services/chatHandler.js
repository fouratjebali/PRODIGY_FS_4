const { Server } = require("socket.io");
const chatService = require("./chatServices");
const userService = require("./userServices");

const handleSocketEvents = (socket, io) => {
    const userId = socket.user?.id;
    if (!userId) {
        console.error("Socket connected without authenticated user. This should not happen.");
        socket.disconnect(true);
        return;
    }

    socket.join(userId);
    console.log(`User ${userId} (${socket.user?.username}) joined their personal socket room: ${userId}`);

    chatService.getUserChatRooms(userId)
        .then(rooms => {
            rooms.forEach(room => {
                socket.join(room.id);
                console.log(`User ${userId} auto-joined room ${room.id} (${room.name}) on connect`);
            });
        })
        .catch(error => {
            console.error(`Error fetching or auto-joining rooms for user ${userId}:`, error);
        });

    socket.on("createRoom", async (roomData, callback) => {
        if (!socket.user) return callback?.({ error: "User not authenticated" });
        console.log(`"createRoom" event from ${socket.user.id}, data:`, roomData);
        try {
            const newRoom = await chatService.createChatRoom(roomData, socket.user);
            socket.join(newRoom.id);
            io.to(newRoom.id).emit("roomCreated", newRoom);
            if (callback) callback({ room: newRoom });
        } catch (error) {
            console.error("Error handling createRoom:", error);
            if (callback) callback({ error: error.message || "Could not create room" });
        }
    });

    socket.on("joinRoom", async (data, callback) => {
        if (!socket.user) return callback?.({ error: "User not authenticated" });
        const roomId = typeof data === "string" ? data : data.chatRoomId;
        console.log(`"joinRoom" event from ${socket.user.id} for room: ${roomId}`);
        try {
            const room = await chatService.findRoomById(roomId);
            if (!room) {
                return callback?.({ error: "Room not found" });
            }
            await chatService.addUserToRoom(roomId, socket.user.id);
            socket.join(roomId);
            const messages = await chatService.getMessagesForRoom(roomId);
            if (callback) callback({ roomId, messages });
            socket.emit("joinedRoom", { roomId, name: room.name, messages });
            socket.to(roomId).emit("userJoined", { roomId, userId: socket.user.id, username: socket.user.username });
        } catch (error) {
            console.error("Error handling joinRoom:", error);
            if (callback) callback({ error: error.message || "Could not join room" });
        }
    });

    socket.on("leaveRoom", (roomId, callback) => {
        if (!socket.user) return callback?.({ error: "User not authenticated" });
        console.log(`"leaveRoom" event from ${socket.user.id} for room: ${roomId}`);
        socket.leave(roomId);
        socket.to(roomId).emit("userLeft", { roomId, userId: socket.user.id, username: socket.user.username });
        if (callback) callback({ message: `Successfully left room ${roomId}` });
    });

    socket.on("sendMessage", async (messageData, callback) => {
        if (!socket.user) return callback?.({ error: "User not authenticated" });
        console.log(`"sendMessage" event from ${socket.user.id} to room ${messageData.chatRoomId}`);
        try {
            const message = await chatService.createMessage(messageData, socket.user.id);
            const senderDetails = await userService.findUserById(socket.user.id);
            
            const messageToSend = {
                ...message,
                sender: senderDetails ? { id: senderDetails.id, username: senderDetails.username, avatarUrl: senderDetails.avatarUrl } : { id: socket.user.id, username: socket.user.username },
            };

            io.to(messageData.chatRoomId).emit("newMessage", messageToSend);
            if (callback) callback({ message: messageToSend });
        } catch (error) {
            console.error("Error handling sendMessage:", error);
            if (callback) callback({ error: error.message || "Could not send message" });
        }
    });

    socket.on("typing", (data) => {
        if (!socket.user) return;
        socket.to(data.chatRoomId).emit("userTyping", {
            userId: socket.user.id,
            username: socket.user.username,
            chatRoomId: data.chatRoomId,
            isTyping: data.isTyping,
        });
    });
};

module.exports = {
    handleSocketEvents,
};
