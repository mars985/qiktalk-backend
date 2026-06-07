const { sendMessage } = require("../services/messageServices");
const { getUsers } = require("../services/conversationServices");

module.exports = (io, socket) => {
  socket.on("sendMessage", async (data) => {
    try {
      const newMessage = await sendMessage({
        message: data.message,
        conversationId: data.conversationId,
        senderId: socket.user._id,
      });

      // Fan the message out to every participant (the sender included, so
      // their own client receives the persisted/populated message back).
      const participants = await getUsers({
        conversationId: data.conversationId,
      });

      participants.forEach((user) => {
        io.to(user._id.toString()).emit("newMessage", newMessage);
      });
    } catch (err) {
      socket.emit("errorMessage", err.message);
      console.error("Error in sendMessage socket", err);
    }
  });
};
