import { ENV } from "./config/env.js"; // Must be first to load .env
import { createServer } from "http";
import app from "./app.js";
import { initializeSocket } from "./utils/socket.js";
import { initSentimentWorker } from "./workers/sentiment.worker.js";
import { initEmailWorker } from "./workers/email.worker.js";
import logger from "./config/logger.js";
import { CronService } from "./services/cron.service.js"; // Import CronService

const server = createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Initialize Scheduled Jobs
CronService.init();

// Initialize workers (gracefully handles Redis unavailability)
try {
  const sentimentWorker = initSentimentWorker();
  const emailWorker = initEmailWorker();

  if (sentimentWorker) {
    logger.info("Sentiment worker started");
  } else {
    logger.warn("Sentiment worker not started (Redis unavailable)");
  }

  if (emailWorker) {
    logger.info("Email worker started");
  } else {
    logger.warn("Email worker not started (Redis unavailable)");
  }
} catch (error) {
  logger.error("Failed to initialize workers:", error);
}

const runningServer = server.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
  console.log(`Socket.IO ready for real-time notifications`);
});

// Graceful Shutdown
const shutdown = () => {
  console.log("Stopping server...");
  runningServer.close(() => {
    console.log("Server stopped");
    process.exit(0);
  });
  // Force close if it takes too long
  setTimeout(() => {
    console.error("Forcing server shutdown");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
