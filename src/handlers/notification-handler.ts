import { ApiClient } from "@twurple/api";
import { EventSubWsListener } from "@twurple/eventsub-ws";
import { type Namespace, type Socket } from "socket.io";
import { getAuthProvider } from "../lib/utils";

const notificationListeners: Record<string, EventSubWsListener> = {};

export function notificationHandler(namespace: Namespace, socket: Socket) {
  console.log(`✅ ${socket.id} connected [notification]`);

  socket.on("notification_connect", async (channelName, refreshToken) => {
    if (!channelName || !refreshToken) return;

    const authProvider = getAuthProvider(refreshToken);
    const apiClient = new ApiClient({ authProvider });

    const channel = await apiClient.users.getUserByName(channelName);
    const channelId = channel?.id;

    if (!channelId) return;

    if (!notificationListeners[channelName]) {
      const listener = new EventSubWsListener({ apiClient });

      listener.onChannelFollow(channelId, channelId, (event) => {
        namespace.to(channelName).emit("notification_event", {
          type: "follow",
          username: event.userName,
        });
      });

      listener.onChannelSubscription(channelId, (event) => {
        namespace.to(channelName).emit("notification_event", {
          type: "subscription",
          tier: event.tier,
          isGift: event.isGift,
          username: event.userName,
        });
      });

      notificationListeners[channelName] = listener;
      listener.start();
    }

    socket.join(channelName);
  });

  socket.on("disconnect", () => {
    console.log(`❌ ${socket.id} disconnected [notification]`);
  });
}
