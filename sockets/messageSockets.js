const { sendMessage } = require("../services/messageServices");
const { getUsers } = require("../services/conversationServices");

module.exports = (io, socket) => {
  socket.on("joinConversation", (conversationId) => {
    socket.join(conversationId);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const newMessage = await sendMessage({
        message: data.message,
        conversationId: data.conversationId,
        senderId: socket.user._id,
      });

      const participantIds = await getUsers({
        conversationId: data.conversationId,
      });

      participantIds.forEach((id) => {
        io.to(id).emit("newMessage", newMessage);
      });

      for (const user of participantIds) {
        const sockets = await io.in(user._id.toString()).fetchSockets();
        io.to(user._id.toString()).emit("newMessage", newMessage);
      }
    } catch (err) {
      socket.emit("errorMessage", err.message);
      console.error("Error in sendMessage socket", err);
    }
  });
};
