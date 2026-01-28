import multer from "multer";
import path from "path";
import { ENV } from "../config/env.js";
import fs from "fs";
import logger from "../config/logger.js";

// Ensure upload directory exists
const uploadDir = ENV.UPLOAD_DIR || "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    logger.info(`Processing file upload: ${file.originalname} -> ${filename}`);
    cb(null, filename);
  },
});

function fileFilter(
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) {
  const allowed = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg+xml",
    "image/gif",
    "application/pdf",
  ];
  if (allowed.includes(file.mimetype)) {
    logger.info(
      `[UploadMiddleware] File accepted: ${file.originalname} (${file.mimetype})`,
    );
    cb(null, true);
  } else {
    logger.warn(
      `File upload rejected (invalid mimetype): ${file.originalname} (${file.mimetype})`,
    );
    const error = new Error(
      "Invalid file type. Only images and PDFs are allowed.",
    );
    (error as any).statusCode = 400;
    cb(error);
  }
}

export const upload = multer({
  storage,
  limits: { fileSize: ENV.MAX_FILE_SIZE },
  fileFilter,
});
