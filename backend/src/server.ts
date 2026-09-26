import dotenv from "dotenv";
import http from "http";
import app from "./app";
import { initializeSocket } from "./socket";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Synora Server running on port ${PORT}`);
});