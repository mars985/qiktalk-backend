const Conversation = require("../models/conversation.model");
const { ApiError } = require("../utils/ApiError");
const {
  uploadSquareImage,
  destroyOnCloudinary,
} = require("./cloudinary.service");
const { avatarSize } = require("../constants/file.constants");

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

async function createGroup({ participants, groupName }) {
  return Conversation.create({
    participants,
    type: "group",
    groupName,
    messages: [],
  });
}

async function addToGroup({ participantIds, conversationId, loggedInUserId }) {
  const group = await Conversation.findOne({
    _id: conversationId,
    type: "group",
  });

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (
    !group.participants.some(
      (id) => id.toString() === loggedInUserId.toString(),
    )
  )
    throw new ApiError(403, "You cannot add users to this group");

  // TODO: add permissions for adding users

  return Conversation.findByIdAndUpdate(
    conversationId,
    {
      $addToSet: {
        participants: {
          $each: participantIds,
        },
      },
    },
    {
      new: true,
    },
  );
}

async function getConversations({ loggedInUserId }) {
  const conversations = await Conversation.find({
    participants: loggedInUserId,
  })
    .populate("participants", "username email avatar")
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

  await conversation.populate("participants", "username email avatarUrl");

  return conversation.participants;
}

async function getConversationById({ conversationId, loggedInUserId }) {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: loggedInUserId,
  })
    .populate("participants", "_id username avatar")
    .select("-messages");

  if (!conversation) {
    throw new ApiError(404, "Conversation not found or access denied");
  }

  return conversation;
}

async function findParticipantGroup({ conversationId, loggedInUserId }) {
  const group = await Conversation.findOne({
    _id: conversationId,
    type: "group",
    participants: loggedInUserId,
  });

  if (!group) {
    throw new ApiError(404, "Group not found or access denied");
  }

  return group;
}

async function uploadGroupAvatar({ conversationId, loggedInUserId, file }) {
  if (!file) {
    throw new ApiError(400, "Avatar file is required");
  }

  const group = await findParticipantGroup({ conversationId, loggedInUserId });

  const uploaded = await uploadSquareImage(file.path, avatarSize);

  if (!uploaded) {
    throw new ApiError(502, "Failed to upload avatar");
  }

  const oldPublicId = group.groupAvatarPublicId;

  try {
    group.groupAvatar = uploaded.url;
    group.groupAvatarPublicId = uploaded.publicId;
    await group.save();
  } catch (error) {
    await destroyOnCloudinary({ public_id: uploaded.publicId });
    throw error;
  }

  if (oldPublicId) {
    await destroyOnCloudinary({ public_id: oldPublicId });
  }

  return group;
}

async function removeGroupAvatar({ conversationId, loggedInUserId }) {
  const group = await findParticipantGroup({ conversationId, loggedInUserId });
  const oldPublicId = group.groupAvatarPublicId;

  group.groupAvatar = null;
  group.groupAvatarPublicId = null;
  await group.save();

  if (oldPublicId) {
    await destroyOnCloudinary({ public_id: oldPublicId });
  }

  return group;
}

module.exports = {
  createDM,
  createGroup,
  addToGroup,
  getConversations,
  getConversationUsers,
  getConversationById,
  uploadGroupAvatar,
  removeGroupAvatar,
};
