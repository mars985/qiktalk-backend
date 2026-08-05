const { sendMessage } = require("../services/messageServices");
const { getConversationUsers } = require("../services/conversationServices");

const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

module.exports = (io, socket) => {
  socket.on("sendMessage", async (data, callback) => {
    try {
      const loggedInUserId = socket.user._id;

      const newMessage = await sendMessage({
        message: data.message,
        conversationId: data.conversationId,
        loggedInUserId,
      });

      // Notify every participant (including the sender)
      const participants = await getConversationUsers({
        conversationId: data.conversationId,
        loggedInUserId,
      });

      participants.forEach((user) => {
        io.to(user._id.toString()).emit("newMessage", newMessage);
      });

      callback?.(new ApiResponse(200, newMessage, "Message sent"));
    } catch (err) {
      console.error("Error in sendMessage socket:", err);

      const error =
        err instanceof ApiError
          ? err
          : new ApiError(500, err.message || "Internal Server Error");

      callback?.({
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
      });

      socket.emit("errorMessage", {
        statusCode: error.statusCode,
        message: error.message,
      });
    }
  });
};