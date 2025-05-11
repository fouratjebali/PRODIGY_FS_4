const authService = require("../Services/authServices");

const register = async (req, res, next) => {
  try {
    const createUserDto = req.body;
    if (!createUserDto.email || !createUserDto.password || !createUserDto.username) {
      return res.status(400).json({ message: "Username, email, and password are required." });
    }
    const { user, token } = await authService.registerUser(createUserDto);
    res.status(201).json({ message: "User registered successfully", user, token });
  } catch (error) {
    if (error.message.includes("already exists")) {
      return res.status(409).json({ message: error.message });
    }
    console.error("Error in authController.register:", error);
    res.status(500).json({ message: error.message || "Error registering user." });
  }
};

const login = async (req, res, next) => {
  try {
    const loginUserDto = req.body;
    if (!loginUserDto.email || !loginUserDto.password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const result = await authService.loginUser(loginUserDto.email, loginUserDto.password);
    if (!result) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const { user, token } = result;
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Error in authController.login:", error);
    res.status(500).json({ message: error.message || "Error logging in." });
  }
};

const getProfile = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "User not authenticated or ID missing." });
  }
  res.status(200).json({ user: req.user });
};

module.exports = {
  register,
  login,
  getProfile
};
