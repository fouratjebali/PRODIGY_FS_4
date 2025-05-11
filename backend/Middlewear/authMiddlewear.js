const authService = require("../Services/authServices");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = authService.verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ message: "Not authorized, token failed" });
      }

      req.user = decoded;
      next();
    } catch (error) {
      console.error("Error in authMiddleware:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = {
  protect
};
