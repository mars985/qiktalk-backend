const { setOnline, setOffline } = require("../services/userServices");

module.exports = (io, socket) => {
  socket.on("userlogin", (userId) => {
    socket.join(userId);
    setOnline({ userId });
  });

  socket.on("disconnect", () => {
    if (socket.user._id) setOffline({ userId: socket.user._id });
  });

  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });
};
