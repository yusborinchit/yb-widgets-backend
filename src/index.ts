import { config } from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { chatHandler } from "./handlers/chat-handler";

config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

const chatNamespace = io.of("/chat");
chatNamespace.on("connection", (socket) => {
  chatHandler(chatNamespace, socket);
});

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "http://localhost";

app.get("/", (_req, res) => {
  res.json({ message: "Hello World" });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
});
