const {
  createDM,
  createGroup,
  addToGroup,
  getUsers,
} = require("../services/conversation.service");

const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { handleSocketError } = require("../utils/handleSocketError");
const { validateData } = require("../middlewares/validate.middleware");
const {
  createDMSchema,
  createGroupSchema,
} = require("../validators/conversation.validator");

module.exports = (io, socket) => {
  socket.on("createDM", async (data, callback) => {
    try {
      const result = validateData(createDMSchema, data);
      if (!result.success) {
        throw new ApiError(400, "Validation failed", result.error.issues);
      }

      const conversation = await createDM({
        targetUserId: result.data.targetUserId,
        loggedInUserId: socket.user._id,
      });

      callback?.(new ApiResponse(200, conversation, "DM created"));
    } catch (err) {
      handleSocketError(err, callback);
    }
  });

  socket.on("createGroup", async (data, callback) => {
    try {
      const validationData = {
        ...data,
        loggedInUserId: socket.user._id.toString(),
      };

      const result = validateData(createGroupSchema, validationData);
      if (!result.success) {
        throw new ApiError(400, "Validation failed", result.error.issues);
      }

      const conversation = await createGroup({
        participants: result.data.participantIds,
        groupName: result.data.groupName,
      });

      conversation.participants.forEach((id) => {
        io.to(id.toString()).emit("newGroup", conversation);
      });

      callback?.(new ApiResponse(200, conversation, "Group created"));
    } catch (err) {
      handleSocketError(err, callback);
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
        io.to(user._id.toString()).emit("newGroup", updatedGroup);
      });

      callback?.(new ApiResponse(200, updatedGroup, "Users added to group"));
    } catch (err) {
      console.error("Error in addToGroup socket:", err);
      handleSocketError(err, callback);
    }
  });
};
