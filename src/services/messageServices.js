const Message = require("../models/messagemodel");
const Conversation = require("../models/conversationmodel");
const mongoose = require("mongoose");
const { ApiError } = require("../utils/ApiError");

async function getMessages({ conversationId, loggedInUserId }) {
  if (!conversationId)
    throw new ApiError(400, "Missing fields");

  const conversation = await Conversation.findById({
    _id: conversationId,
  }).populate({
    path: "messages",
    populate: {
      path: "sender",
      select: "_id username",
    },
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  return conversation.messages;
}

async function sendMessage({ message, conversationId, loggedInUserId }) {
  if (!message || !conversationId || !loggedInUserId) {
    throw new ApiError(400, "Missing required fields");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: loggedInUserId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const newMessage = await Message.create({
    body: message,
    sender: loggedInUserId
  });

  conversation.messages.push(newMessage._id);
  conversation.updatedAt = new Date();

  await conversation.save();
  await newMessage.populate("sender", "_id username");

  return newMessage;
}

module.exports = {
  getMessages,
  sendMessage,
};
