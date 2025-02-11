import { type Namespace, Socket } from "socket.io";
// @ts-expect-error: No type definitions available
import emoteParser from "tmi-emote-parse";
import tmi from "tmi.js";

const clients: Record<string, tmi.Client> = {};

export function chatHandler(namespace: Namespace, socket: Socket) {
  console.log(`✅ ${socket.id} connected [chat]`);

  socket.on("chat_connect", async (channelName: string) => {
    if (!channelName) return;

    if (!clients[channelName]) {
      emoteParser.loadAssets(channelName);

      const client = new tmi.Client({
        connection: { reconnect: true },
        channels: [channelName],
      });

      client.on("message", (channel, tags, message, self) => {
        if (self) return;

        namespace.to(channelName).emit("chat_message", {
          id: tags["id"],
          color: tags["color"],
          isFirstMessage: tags["first-message"],
          isModerator: tags["mod"],
          isSubscriber: tags["subscriber"],
          username: tags["display-name"],
          message: emoteParser.replaceEmotes(message, tags, channel, self),
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
