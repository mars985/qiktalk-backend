const Message = require("../models/messagemodel");
const Conversation = require("../models/conversationmodel");

async function getMessages({ conversationId }) {
  const conversation = await Conversation.findById(conversationId).populate({
    path: "messages",
    populate: {
      path: "sender",
      select: "username _id",
    },
  });

  if (!conversation) return null;
  return conversation.messages;
}

async function sendMessage({ message, conversationId, senderId }) {
  if (!message || !conversationId || !senderId) {
    throw new Error("Missing required fields");
  }

  const newMessage = new Message({
    sender: senderId,
    body: message,
  });
  await newMessage.save();

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

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
