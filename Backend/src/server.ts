import { ENV } from "./config/env.js"; // Must be first to load .env
import { createServer } from "http";
import app from "./app.js";
import { initializeSocket } from "./utils/socket.js";
import { initSentimentWorker } from "./workers/sentiment.worker.js";
import { initEmailWorker } from "./workers/email.worker.js";
import logger from "./config/logger.js";

const server = createServer(app);

// Initialize Socket.IO
initializeSocket(server);

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

server.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
  console.log(`Socket.IO ready for real-time notifications`);
});
