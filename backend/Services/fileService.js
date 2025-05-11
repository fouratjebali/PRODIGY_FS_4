const { query } = require("../db");

const saveFileMetadata = async (
    originalname,
    filename,
    mimetype,
    size,
    path,
    uploader
) => {
    const insertQuery = `
        INSERT INTO files (originalname, filename, mimetype, size, path, uploader_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, originalname, filename, mimetype, size, path, uploader_id, created_at;
    `;
    try {
        const { rows } = await query(insertQuery, [originalname, filename, mimetype, size, path, uploader.id]);
        if (rows.length === 0) {
            throw new Error("File metadata saving failed.");
        }
        const dbFile = rows[0];
        return {
            id: dbFile.id,
            originalname: dbFile.originalname,
            filename: dbFile.filename,
            mimetype: dbFile.mimetype,
            size: dbFile.size,
            path: dbFile.path,
            uploaderId: dbFile.uploader_id,
            createdAt: dbFile.created_at
        };
    } catch (error) {
        console.error("Error saving file metadata to DB:", error);
        throw new Error("Error saving file metadata.");
    }
};

const findFileById = async (fileId) => {
    const selectQuery = `SELECT * FROM files WHERE id = $1;`;
    try {
        const { rows } = await query(selectQuery, [fileId]);
        if (rows.length === 0) {
            return null;
        }
        const dbFile = rows[0];
        return {
            id: dbFile.id,
            originalname: dbFile.originalname,
            filename: dbFile.filename,
            mimetype: dbFile.mimetype,
            size: dbFile.size,
            path: dbFile.path,
            uploaderId: dbFile.uploader_id,
            createdAt: dbFile.created_at
        };
    } catch (error) {
        console.error("Error finding file by ID:", error);
        throw new Error("Error accessing database for file.");
    }
};

module.exports = {
    saveFileMetadata,
    findFileById
};
