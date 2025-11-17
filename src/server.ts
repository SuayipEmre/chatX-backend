import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { registerSocketHandlers } from "./socket/index.js";
import { PORT } from "./config/env.js";
import conntectDB from "./config/db.js";

conntectDB()
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// tüm socket eventlerini yükle
registerSocketHandlers(io);

server.listen(PORT, () => console.log("Server running on port 5000"));
