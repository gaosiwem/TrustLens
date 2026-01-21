import { ENV } from "./config/env.js"; // Must be first to load .env
import { createServer } from "http";
import app from "./app.js";
import { initializeSocket } from "./utils/socket.js";

const server = createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(ENV.PORT, () => {
  console.log(`Server running on port ${ENV.PORT}`);
  console.log(`Socket.IO ready for real-time notifications`);
});
