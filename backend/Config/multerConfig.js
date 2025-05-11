const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Request } = require("express");

const uploadDir = process.env.UPLOAD_FOLDER || "uploads_express";
const absoluteUploadPath = path.resolve(__dirname, "../../", uploadDir);

if (!fs.existsSync(absoluteUploadPath)) {
  fs.mkdirSync(absoluteUploadPath, { recursive: true });
  console.log(`Upload directory created at: ${absoluteUploadPath}`);
} else {
  console.log(`Upload directory already exists at: ${absoluteUploadPath}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, absoluteUploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 25,
  },
  fileFilter: fileFilter,
});

module.exports = upload;
