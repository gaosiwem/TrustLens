import type { Request, Response, NextFunction } from "express";
import logger from "../config/logger.js";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error for debugging
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Don't expose internal error details to client
  let statusCode = err.statusCode || err.status || 500;
  let message = "An error occurred processing your request";

  // Handle Multer errors or other client-side errors
  if (
    err.name === "MulterError" ||
    err.code === "LIMIT_FILE_SIZE" ||
    statusCode < 500
  ) {
    if (statusCode === 500) statusCode = 400;
    message = err.message;
  }

  res.status(statusCode).json({
    error: message,
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "Resource not found",
  });
}
