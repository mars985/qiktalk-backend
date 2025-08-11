const Conversation = require("../models/conversationmodel");

async function createDM({ targetUserId, loggedInUserId }) {
  const existingDM = await Conversation.findOne({
    type: "dm",
    participants: { $all: [loggedInUserId, targetUserId], $size: 2 },
  });

  if (existingDM) return existingDM;

  return Conversation.create({
    type: "dm",
    participants: [loggedInUserId, targetUserId],
    messages: [],
  });
}

async function createGroup({ participantIds, groupName, loggedInUserId }) {
  return Conversation.create({
    participants: [...participantIds, loggedInUserId],
    type: "group",
    groupName,
    messages: [],
  });
}

async function addToGroup({ participantIds, groupId }) {
  const group = await Conversation.findOne({ _id: groupId, type: "group" });
  if (!group) return null;

  group.participants.push(...participantIds);
  group.updatedAt = new Date();
  await group.save();
  return group;
}

async function getConversations({ loggedInUserId }) {
  return Conversation.find({
    participants: loggedInUserId,
  })
    .populate("participants", "name email")
    .populate("messages", "text createdAt sender")
    .sort({ updatedAt: -1 });
}

module.exports = {
  createDM,
  createGroup,
  addToGroup,
  getConversations,
};
