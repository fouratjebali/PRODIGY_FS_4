const chatService = require("../Services/chatServices"); // Adjust path if needed

const createRoom = async (req, res) => {
  const creator = req.user; // Assumes req.user is populated via auth middleware
  const roomData = req.body;

  try {
    const newRoom = await chatService.createChatRoom(roomData, creator);
    return res.status(201).json(newRoom);
  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({ error: "Failed to create chat room." });
  }
};

const getUserRooms = async (req, res) => {
  const userId = req.user?.id;

  try {
    const rooms = await chatService.getUserChatRooms(userId);
    return res.status(200).json(rooms);
  } catch (error) {
    console.error("Get user rooms error:", error);
    return res.status(500).json({ error: "Failed to fetch user chat rooms." });
  }
};

const getRoomById = async (req, res) => {
  const roomId = req.params.id;

  try {
    const room = await chatService.findRoomById(roomId);
    if (!room) {
      return res.status(404).json({ error: "Chat room not found." });
    }
    return res.status(200).json(room);
  } catch (error) {
    console.error("Find room error:", error);
    return res.status(500).json({ error: "Failed to retrieve chat room." });
  }
};

const joinRoom = async (req, res) => {
  const roomId = req.params.id;
  const userId = req.user?.id;

  try {
    await chatService.addUserToRoom(roomId, userId);
    return res.status(200).json({ message: "User added to room." });
  } catch (error) {
    console.error("Join room error:", error);
    return res.status(500).json({ error: "Failed to join chat room." });
  }
};

const sendMessage = async (req, res) => {
  const senderId = req.user?.id;
  const messageData = req.body;

  try {
    const message = await chatService.createMessage(messageData, senderId);
    return res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: "Failed to send message." });
  }
};

const getMessages = async (req, res) => {
  const roomId = req.params.id;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const messages = await chatService.getMessagesForRoom(roomId, limit, offset);
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    return res.status(500).json({ error: "Failed to get messages." });
  }
};

module.exports = {
  createRoom,
  getUserRooms,
  getRoomById,
  joinRoom,
  sendMessage,
  getMessages,
};
