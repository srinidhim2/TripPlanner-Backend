const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads/profilephoto');
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Use userId from req.params.id (for /user/:id/photo route), plus a uuid
        const userId = req.params.id || 'unknown';
        const ext = path.extname(file.originalname);
        cb(null, `${userId}_${uuidv4()}${ext}`);
    }
});

const uploadProfilePhoto = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

module.exports = uploadProfilePhoto;
