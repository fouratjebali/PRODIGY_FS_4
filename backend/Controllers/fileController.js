const { Request, Response, NextFunction } = require("express");
const fileService = require("../Services/fileService");

const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated for file upload." });
        }

        const { originalname, filename, mimetype, size, path: filePath } = req.file;
        
        const serverStoredFileName = filename;

        const fileMetadata = await fileService.saveFileMetadata(
            originalname,
            serverStoredFileName,
            mimetype,
            size,
            serverStoredFileName,
            req.user
        );

        res.status(201).json({
            message: "File uploaded successfully",
            file: fileMetadata,
        });
    } catch (error) {
        console.error("Error in fileController.uploadFile:", error);
        res.status(500).json({ message: error.message || "Error uploading file." });
    }
};

const getFile = async (req, res, next) => {
    try {
        const fileId = req.params.fileId;
        const fileMetadata = await fileService.findFileById(fileId);

        if (!fileMetadata) {
            return res.status(404).json({ message: "File not found." });
        }

        res.status(200).json(fileMetadata);
    } catch (error) {
        console.error("Error in fileController.getFile:", error);
        res.status(500).json({ message: error.message || "Error retrieving file metadata." });
    }
};

module.exports = { uploadFile, getFile };
