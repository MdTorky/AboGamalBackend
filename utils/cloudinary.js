const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// 1. Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configure Multer (Use Memory Storage)
// We store the file in RAM temporarily so we can pass it directly to Cloudinary
const storage = multer.memoryStorage();

// 3. Initialize Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Optional: Limit to 5MB
});

module.exports = { cloudinary, upload };