const { sendMessage } = require("../services/messageServices");
const { getConversationUsers } = require("../services/conversationServices");

const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { validateData } = require("../middlewares/validate");
const { sendMessageSchema } = require("../validators/messageValidator");

module.exports = (io, socket) => {
  socket.on("sendMessage", async (data, callback) => {
    try {
      const loggedInUserId = socket.user._id;
      const result = validateData(sendMessageSchema, data);

      if (!result.success) {
        throw new ApiError(400, "Validation failed", result.error.issues);
      }

      const newMessage = await sendMessage({
        message: result.data.message,
        conversationId: result.data.conversationId,
        loggedInUserId,
      });

      const participants = await getConversationUsers({
        conversationId: result.data.conversationId,
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

/*
aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
*/