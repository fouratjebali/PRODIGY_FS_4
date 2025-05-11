const express = require("express");
const authController = require("../Controllers/authController");
const { protect } = require("../Middlewear/authMiddlewear");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", protect, authController.getProfile);

module.exports = router;
