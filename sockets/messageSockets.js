const { sendMessage, getMessages } = require("../services/messageServices");

module.exports = (io, socket) => {
  // Join a conversation room
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const newMessage = await sendMessage({
        message: data.message,
        conversationId: data.conversationId,
        senderId: socket.user._id, // ← from auth, not client
      });

      io.to(data.conversationId).emit("newMessage", newMessage);
    } catch (err) {
      socket.emit("errorMessage", err.message);
    }
  });
};
