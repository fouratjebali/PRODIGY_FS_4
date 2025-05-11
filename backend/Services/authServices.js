const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { findUserByEmail, createUser } = require("./userServices");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your-default-secret";
const JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION || "1h";

const registerUser = async (userData) => {
  try {
    const newUser = await createUser(userData);
    const userForToken = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    };
    const token = jwt.sign(userForToken, JWT_SECRET, { expiresIn: JWT_EXPIRATION_TIME });
    return { user: newUser, token };
  } catch (error) {
    console.error("Error in authService.registerUser:", error);
    throw error;
  }
};

const loginUser = async (email, password_provided) => {
  try {
    const userWithPassword = await findUserByEmail(email);
    if (!userWithPassword) {
      return null;
    }

    const isMatch = await bcrypt.compare(password_provided, userWithPassword.passwordHash);
    if (!isMatch) {
      return null;
    }

    const userPayload = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      username: userWithPassword.username,
    };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: JWT_EXPIRATION_TIME });

    const { passwordHash, ...userWithoutPassword } = userWithPassword;

    return { user: userWithoutPassword, token };
  } catch (error) {
    console.error("Error in authService.loginUser:", error);
    throw error;
  }
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyToken
};
