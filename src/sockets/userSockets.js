const presence = require("../services/presence");
const { setLastSeen } = require("../services/userServices");

module.exports = (io, socket) => {
  const userId = socket.user._id.toString();

  socket.join(userId);

  // If it's the user's first live socket, they just came online
  if (presence.addConnection(userId)) {
    io.emit("presence:update", { userId, online: true });
  }

  socket.emit("presence:snapshot", presence.getOnlineUserIds());

  socket.on("presence:request", () => {
    socket.emit("presence:snapshot", presence.getOnlineUserIds());
  });

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("disconnect", async () => {
    // Only flip to offline once the user's LAST socket disconnects.
    if (presence.removeConnection(userId)) {
      const lastSeen = await setLastSeen({ userId });
      io.emit("presence:update", { userId, online: false, lastSeen });
    }
  });
};
