const Conversation = require("../models/conversationmodel");
const { ApiError } = require("../utils/ApiError");

async function createDM({ targetUserId, loggedInUserId }) {
  const existingDM = await Conversation.findOne({
    type: "dm",
    participants: {
      $all: [loggedInUserId, targetUserId],
      $size: 2,
    },
  });

  if (existingDM) {
    return existingDM;
  }

  return Conversation.create({
    type: "dm",
    participants: [loggedInUserId, targetUserId],
    messages: [],
  });
}

async function createGroup({ participantIds, groupName, loggedInUserId }) {
  const participants = [...new Set([...participantIds, loggedInUserId])];

  if (participants.length < 3) {
    throw new ApiError(400, "A group must have at least 3 participants");
  }

  return Conversation.create({
    participants,
    type: "group",
    groupName,
    messages: [],
  });
}

async function addToGroup({ participantIds, groupId, loggedInUserId }) {
  const group = await Conversation.findOne({
    _id: groupId,
    type: "group",
  });

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!group.participants.some(id => id.toString() === loggedInUserId.toString()))
    throw new ApiError(403, "You cannot add users to this group");

  // TODO: add permissions for adding users

  return Conversation.findByIdAndUpdate(
    groupId,
    {
      $addToSet: {
        participants: {
          $each: participantIds
        }
      }
    },
    {
      new: true
    }
  );
}

async function getConversations({ loggedInUserId }) {
  const conversations = await Conversation.find({
    participants: loggedInUserId,
  })
    .populate("participants", "username email")
    .populate("messages", "body updatedAt sender")
    .sort({ updatedAt: -1 });

  return conversations;
}

async function getConversationUsers({ conversationId, loggedInUserId }) {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: loggedInUserId,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or access denied");
  }

  await conversation.populate(
    "participants",
    "username email avatarUrl"
  );

  return conversation.participants;
}

async function getConversationById({ conversationId, loggedInUserId }) {
  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }
  
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: loggedInUserId,
  })
    .populate("participants", "_id username")
    .select("-messages");

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or access denied");
  }

  return conversation;
}

module.exports = {
  createDM,
  createGroup,
  addToGroup,
  getConversations,
  getConversationUsers,
  getConversationById,
};
