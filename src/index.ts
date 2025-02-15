import cors from "cors";
import { config } from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { chatHandler } from "./handlers/chat-handler";
import { notificationHandler } from "./handlers/notification-handler";

config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const chatNamespace = io.of("/chat");
chatNamespace.on("connection", (socket) => {
  chatHandler(chatNamespace, socket);
});

const notificationNamespace = io.of("/notification");
notificationNamespace.on("connection", (socket) => {
  notificationHandler(notificationNamespace, socket);
});

app.get("/", (_req, res) => {
  res.json({ github: "https://github.com/yusborinchit" });
});

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "http://localhost";

server.listen(PORT, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
});
