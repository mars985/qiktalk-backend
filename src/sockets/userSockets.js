const presence = require("../services/presence");
const { setLastSeen } = require("../services/userServices");

module.exports = (io, socket) => {
  // `socket.user` is set by the socketAuth middleware, so we trust the
  // authenticated identity instead of an id sent by the client.
  const userId = socket.user._id.toString();

  // Join a personal room so messages/conversations can be delivered to this
  // user across every tab and device they have open. Doing this on connect
  // (rather than waiting for a client "userlogin" event) means delivery and
  // presence can never get out of sync.
  socket.join(userId);

  // Mark this connection. If it's the user's first live socket, they just came
  // online — let everyone know in real time.
  if (presence.addConnection(userId)) {
    io.emit("presence:update", { userId, online: true });
  }

  // Give the freshly-connected client the current online roster so it can
  // render presence immediately without waiting for the next change.
  socket.emit("presence:snapshot", presence.getOnlineUserIds());

  // Allow a client to re-request the roster (e.g. after a reconnect).
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
