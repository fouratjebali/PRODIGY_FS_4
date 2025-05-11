const express = require("express");
const fileController = require("../Controllers/fileController");
const { protect } = require("../Middlewear/authMiddlewear");
const upload = require("../Config/multerConfig");

const router = express.Router();

router.post("/upload", protect, upload.single("file"), fileController.uploadFile);
router.get("/:fileId", protect, fileController.getFile);

module.exports = router;
