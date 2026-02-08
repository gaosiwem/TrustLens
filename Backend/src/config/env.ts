import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || "3000",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  REDIS_URL: process.env.REDIS_URL,
};
