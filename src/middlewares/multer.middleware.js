const multer = require("multer");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { ApiError } = require("../utils/ApiError.js");
const {
  fileSizeLimit,
  imageMimeTypes,
} = require("../constants/file.constants.js");
const { removeDirectory } = require("../utils/fileHandler.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uuid = crypto.randomUUID();
    const uploadDir = path.join(process.cwd(), "public", "temp", uuid);

    fs.mkdir(uploadDir, { recursive: true })
      .then(() => {
        req.uploadDir = uploadDir;
        req.addCleanup(() => removeDirectory(uploadDir));
        cb(null, uploadDir);
      })
      .catch((err) => {
        cb(err);
      });
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: fileSizeLimit,
  },
  fileFilter: (req, file, cb) => {
    if (!imageMimeTypes.includes(file.mimetype)) {
      return cb(
        new ApiError(400, "Only JPEG, PNG, WebP or GIF images are allowed"),
      );
    }

    cb(null, true);
  },
});

module.exports = { upload };
