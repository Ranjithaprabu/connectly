const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = allowedTypes[file.mimetype];

    if (!extension) {
      return cb(
        new Error("Only JPEG, PNG, WEBP, and GIF images are allowed.")
      );
    }

    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes[file.mimetype]) {
      return cb(
        new Error("Only JPEG, PNG, WEBP, and GIF images are allowed.")
      );
    }

    cb(null, true);
  },
});

module.exports = { uploadAvatar, uploadDir };