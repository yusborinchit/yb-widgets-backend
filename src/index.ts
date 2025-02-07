import { config } from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import tmi from "tmi.js";

config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

const clients: Record<string, tmi.Client> = {};

const chatNamespace = io.of("/chat");
chatNamespace.on("connection", (socket) => {
  console.log(`✅ ${socket.id} connected [chat]`);

  socket.on("chat_connect", (channelName: string) => {
    if (!channelName) return;

    if (!clients[channelName]) {
      const client = new tmi.Client({
        connection: { reconnect: true },
        channels: [channelName],
      });

      client.on("message", (_channel, tags, message, self) => {
        if (self) return;

        chatNamespace.to(channelName).emit("chat_message", {
          user: {
            avatar: tags["user-avatar-url"],
            badges: tags["badges"],
            name: tags["display-name"],
          },
          message,
        });
      });

      client.connect();
      clients[channelName] = client;
    }

    socket.join(channelName);
  });

  socket.on("disconnect", () => {
    console.log(`❌${socket.id} disconnected [chat]`);
  });
});

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "http://localhost";

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on ${HOST}:${PORT}`);
});
