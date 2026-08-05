const conversationService = require("../services/conversationServices");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/AsyncHandler");

const createDM = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  const loggedInUserId = req.user._id;

  const dm = await conversationService.createDM({
    targetUserId,
    loggedInUserId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, dm, "DM retrieved successfully"));
});

const createGroup = asyncHandler(async (req, res) => {
  const { participantIds, groupName } = req.body;
  const loggedInUserId = req.user._id;

  const group = await conversationService.createGroup({
    participantIds,
    groupName,
    loggedInUserId,
  });

  res
    .status(201)
    .json(new ApiResponse(201, group, "Group created successfully"));
});

// TODO
const addToGroup = asyncHandler(async (req, res) => {
  const { participantIds, groupId } = req.body;
  const loggedInUserId = req.user._id;

  const group = await conversationService.addToGroup({
    participantIds,
    groupId,
    loggedInUserId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, group, "Users added successfully"));
});

const getConversations = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  const conversations = await conversationService.getConversations({
    loggedInUserId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, conversations));
});

const getConversationUsers = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const loggedInUserId = req.user._id;

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }

  const users = await conversationService.getConversationUsers({ conversationId, loggedInUserId });

  res
    .status(200)
    .json(new ApiResponse(200, users));
});

const getConversationById = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const loggedInUserId = req.user._id;

  const conversation = await conversationService.getConversationById({
    conversationId,
    loggedInUserId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, conversation));
});

module.exports = {
  createDM,
  createGroup,
  addToGroup,
  getConversations,
  getConversationUsers,
  getConversationById,
};
