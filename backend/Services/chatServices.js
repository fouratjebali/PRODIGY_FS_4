const { query } = require("../db");

const createChatRoom = async (roomData, creator) => {
  const { name, isPrivate = false, memberIds = [] } = roomData;
  const client = await query("BEGIN");
    console.log("Creator object:", creator);

  try {
    const insertRoomQuery = `
      INSERT INTO chat_rooms (name, is_private, creator_id)
      VALUES ($1, $2, $3)
      RETURNING id, name, is_private, creator_id, created_at, updated_at;
    `;
    const { rows: roomRows } = await query(insertRoomQuery, [name, isPrivate, creator.id]);
    if (roomRows.length === 0) {
      throw new Error("Chat room creation failed.");
    }
    const newRoom = roomRows[0];

    const allMemberIds = new Set([creator.id, ...memberIds]);

    const insertMemberQuery = `
      INSERT INTO chat_room_users (chat_room_id, user_id)
      VALUES ($1, $2);
    `;
    for (const userId of allMemberIds) {
      await query(insertMemberQuery, [newRoom.id, userId]);
    }

    await query("COMMIT");
    return newRoom;
  } catch (error) {
    await query("ROLLBACK");
    console.error("Error creating chat room in DB:", error);
    throw new Error("Error creating chat room.");
  }
};

const findRoomById = async (roomId) => {
  const selectQuery = `SELECT * FROM chat_rooms WHERE id = $1;`;
  try {
    const { rows } = await query(selectQuery, [roomId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error finding room by ID:", error);
    throw new Error("Error accessing database for chat room.");
  }
};

const getUserChatRooms = async (userId) => {
  const selectQuery = `
    SELECT cr.* 
    FROM chat_rooms cr
    JOIN chat_room_users cru ON cr.id = cru.chat_room_id
    WHERE cru.user_id = $1
    ORDER BY cr.updated_at DESC; 
  `;
  try {
    const { rows } = await query(selectQuery, [userId]);
    return rows;
  } catch (error) {
    console.error("Error fetching user chat rooms:", error);
    throw new Error("Error accessing database for user rooms.");
  }
};

const addUserToRoom = async (roomId, userId) => {
  const insertQuery = `INSERT INTO chat_room_users (chat_room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
  try {
    await query(insertQuery, [roomId, userId]);
  } catch (error) {
    console.error("Error adding user to room:", error);
    throw new Error("Error updating room members.");
  }
};

const createMessage = async (messageData, senderId) => {
  const { chatRoomId, content, fileId } = messageData;
  const insertQuery = `
    INSERT INTO messages (chat_room_id, sender_id, content, file_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, content, sender_id, chat_room_id, file_id, created_at, updated_at;
  `;
  try {
    const { rows } = await query(insertQuery, [chatRoomId, senderId, content || null, fileId || null]);
    if (rows.length === 0) {
      throw new Error("Message creation failed.");
    }
    await query(`UPDATE chat_rooms SET updated_at = NOW() WHERE id = $1`, [chatRoomId]);
    return rows[0];
  } catch (error) {
    console.error("Error creating message in DB:", error);
    throw new Error("Error creating message.");
  }
};

const getMessagesForRoom = async (roomId, limit = 50, offset = 0) => {
  const selectQuery = `
    SELECT 
      m.id, m.content, m.sender_id, m.chat_room_id, m.file_id, m.created_at, m.updated_at,
      u.username as sender_username, u.avatar_url as sender_avatar_url,
      f.filename as file_filename, f.originalname as file_originalname, f.mimetype as file_mimetype, f.size as file_size, f.path as file_path
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    LEFT JOIN files f ON m.file_id = f.id
    WHERE m.chat_room_id = $1
    ORDER BY m.created_at ASC
    LIMIT $2 OFFSET $3;
  `;
  try {
    const { rows } = await query(selectQuery, [roomId, limit, offset]);
    return rows.map(row => ({
      id: row.id,
      content: row.content,
      senderId: row.sender_id,
      chatRoomId: row.chat_room_id,
      fileId: row.file_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sender: {
        id: row.sender_id,
        username: row.sender_username,
        avatarUrl: row.sender_avatar_url,
      },
      file: row.file_id ? {
        id: row.file_id,
        filename: row.file_filename,
        originalname: row.file_originalname,
        mimetype: row.file_mimetype,
        size: row.file_size,
        path: row.file_path,
      } : null,
    }));
  } catch (error) {
    console.error("Error fetching messages for room:", error);
    throw new Error("Error accessing database for messages.");
  }
};



module.exports = {
  createChatRoom,
  findRoomById,
  getUserChatRooms,
  addUserToRoom,
  createMessage,
  getMessagesForRoom,
};