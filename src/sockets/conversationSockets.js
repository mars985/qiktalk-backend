const {
  createDM,
  createGroup,
  addToGroup,
  getUsers,
} = require("../services/conversationServices");

const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { validateData } = require("../middlewares/validate");
const { createDMSchema, createGroupSchema } = require("../validators/conversationValidator");

module.exports = (io, socket) => {
  socket.on("createConversation", async (data, callback) => {
    try {
      let conversation, participantIds, result;

      switch (data.conversationType) {
        case "dm": {
          result = validateData(createDMSchema, data);

          if (!result.success) {
            throw new ApiError(400, "Validation failed", result.error.issues);
          }

          conversation = await createDM({
            targetUserId: result.data.targetUserId,
            loggedInUserId: socket.user._id,
          });

          participantIds = conversation.participants.map((id) => id.toString());
          break;
        }

        case "group": {
          const validationData = {
            ...data,
            loggedInUserId: socket.user._id.toString(),
          };

          result = validateData(createGroupSchema, validationData);

          if (!result.success) {
            throw new ApiError(400, "Validation failed", result.error.issues);
          }

          conversation = await createGroup({
            participants: result.data.participantIds,
            groupName: result.data.groupName
          });

          participantIds = conversation.participants.map((id) => id.toString());
          break;
        }

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