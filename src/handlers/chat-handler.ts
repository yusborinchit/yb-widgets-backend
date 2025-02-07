import { type Namespace, Socket } from "socket.io";
import tmi from "tmi.js";

const clients: Record<string, tmi.Client> = {};

export function chatHandler(namespace: Namespace, socket: Socket) {
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

        namespace.to(channelName).emit("chat_message", {
          id: tags["id"],
          color: tags["color"],
          emotes: tags["emotes"],
          isFirstMessage: tags["first-message"],
          isModerator: tags["mod"],
          isSubscriber: tags["subscriber"],
          username: tags["display-name"],
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
}
