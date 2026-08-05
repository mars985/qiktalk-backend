const messageService = require("../services/messageServices");
const { asyncHandler } = require("../utils/AsyncHandler");
const { ApiResponse } = require("../utils/ApiResponse");
const { ApiError } = require("../utils/ApiError");

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const loggedInUserId = req.user._id;

  const messages = await messageService.getMessages({
    conversationId,
    loggedInUserId
  });

  res
    .status(200)
    .json(new ApiResponse(200, messages));
});

const sendMessage = asyncHandler(async (req, res) => {
  const { message, conversationId } = req.body;
  const loggedInUserId = req.user._id;

  const newMessage = await messageService.sendMessage({
    message,
    conversationId,
    loggedInUserId,
  });

  res
    .status(201)
    .json(new ApiResponse(201, newMessage, "Message sent successfully"));
});

module.exports = {
  getMessages,
  sendMessage,
};
