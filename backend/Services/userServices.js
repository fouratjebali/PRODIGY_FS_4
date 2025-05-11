const { query } = require("../db");
const bcrypt = require("bcryptjs");

const createUser = async (userData) => {
  const { username, email, password } = userData;
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const insertQuery = `
    INSERT INTO users (username, email, password_hash, avatar_url)
    VALUES ($1, $2, $3, $4)
    RETURNING id, username, email, avatar_url, "createdAt", "updatedAt";
  `;
  const avatarUrl = userData.avatarUrl || null;

  try {
    const { rows } = await query(insertQuery, [username, email, passwordHash, avatarUrl]);
    if (rows.length === 0) {
      throw new Error("User creation failed, no rows returned.");
    }
    const newUser = {
      id: rows[0].id,
      username: rows[0].username,
      email: rows[0].email,
      avatarUrl: rows[0].avatar_url,
      createdAt: rows[0].createdAt,
      updatedAt: rows[0].updatedAt,
    };
    return newUser;
  } catch (error) {
    if (error.code === '23505') {
      if (error.constraint === 'users_username_key') {
        throw new Error('Username already exists.');
      }
      if (error.constraint === 'users_email_key') {
        throw new Error('Email already exists.');
      }
    }
    console.error("Error creating user in DB:", error);
    throw new Error("Error creating user.");
  }
};

const findUserByEmail = async (email) => {
  const selectQuery = `
    SELECT id, username, email, password_hash, avatar_url, "createdAt", "updatedAt"
    FROM users
    WHERE email = $1;
  `;
  try {
    const { rows } = await query(selectQuery, [email]);
    if (rows.length === 0) {
      return null;
    }
    const userFromDb = rows[0];
    return {
      id: userFromDb.id,
      username: userFromDb.username,
      email: userFromDb.email,
      passwordHash: userFromDb.password_hash,
      avatarUrl: userFromDb.avatar_url,
      createdAt: userFromDb.createdAt,
      updatedAt: userFromDb.updatedAt,
    };
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw new Error("Error accessing database.");
  }
};

const findUserById = async (id) => {
  const selectQuery = `
    SELECT id, username, email, avatar_url, "createdAt", "updatedAt"
    FROM users
    WHERE id = $1;
  `;
  try {
    const { rows } = await query(selectQuery, [id]);
    if (rows.length === 0) {
      return null;
    }
    const userFromDb = rows[0];
    return {
      id: userFromDb.id,
      username: userFromDb.username,
      email: userFromDb.email,
      avatarUrl: userFromDb.avatar_url,
      createdAt: userFromDb.createdAt,
      updatedAt: userFromDb.updatedAt,
    };
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw new Error("Error accessing database.");
  }
};


module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};
