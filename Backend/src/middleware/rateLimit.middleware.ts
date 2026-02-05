import rateLimit from "express-rate-limit";

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // INCREASED FOR LOAD TESTING (was 5)
  message: "Too many authentication attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10000, // INCREASED FOR LOAD TESTING (was 100)
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for admin operations
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10000, // INCREASED FOR LOAD TESTING (was 30)
  message: "Too many admin requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
