const { sendMessage } = require("../services/messageServices");

module.exports = (io, socket) => {
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    // console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const newMessage = await sendMessage({
        message: data.message,
        conversationId: data.conversationId,
        senderId: socket.user._id,
      });

      io.to(data.conversationId).emit("newMessage", newMessage);
    } catch (err) {
      socket.emit("errorMessage", err.message);
    }
  });
};
