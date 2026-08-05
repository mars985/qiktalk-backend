const {
  createDM,
  createGroup,
  addToGroup,
  getUsers,
} = require("../services/conversationServices");

const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");

module.exports = (io, socket) => {
  socket.on("createConversation", async (data, callback) => {
    try {
      let conversation, participantIds;

      switch (data.conversationType) {
        case "dm":
          conversation = await createDM({
            targetUserId: data.targetUserId,
            loggedInUserId: socket.user._id,
          });

          participantIds = [
            socket.user._id.toString(),
            data.targetUserId.toString(),
          ];
          break;

        case "group":
          conversation = await createGroup({
            participantIds: data.participantIds,
            groupName: data.groupName,
            loggedInUserId: socket.user._id,
          });

          participantIds = [
            ...data.participantIds.map((id) => id.toString()),
            socket.user._id.toString(),
          ];
          break;

        default:
          throw new ApiError(400, "Invalid conversation type");
      }

      participantIds.forEach((id) => {
        io.to(id).emit("newConversation", conversation);
      });

      callback?.(new ApiResponse(200, conversation, "Conversation created"));
    } catch (err) {
      console.error("Error in createConversation socket:", err);

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
    }
  });

  socket.on("addToGroup", async (data, callback) => {
    try {
      const updatedGroup = await addToGroup({
        participantIds: data.participantIds,
        groupId: data.groupId,
      });

      const participants = await getUsers({
        conversationId: data.groupId,
      });

      participants.forEach((user) => {
        io.to(user._id.toString()).emit("newConversation", updatedGroup);
      });

      callback?.(new ApiResponse(200, updatedGroup, "Users added to group"));
    } catch (err) {
      console.error("Error in addToGroup socket:", err);

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