const presence = require("../services/presence.service");
const { setLastSeen } = require("../services/user.service");

module.exports = (io, socket) => {
  const userId = socket.user._id.toString();

  socket.join(userId);

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
    if (presence.removeConnection(userId)) {
      const lastSeen = await setLastSeen({ userId });
      io.emit("presence:update", { userId, online: false, lastSeen });
    }
  });
};
