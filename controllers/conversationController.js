const conversationService = require("../services/conversationServices");

async function createDM(req, res) {
  try {
    const { targetUserId } = req.body;
    const loggedInUserId = req.user._id;

    const dm = await conversationService.createDM({
      targetUserId,
      loggedInUserId,
    });
    res.json({ success: true, data: dm });
  } catch (error) {
    console.error("Error creating DM:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function createGroup(req, res) {
  try {
    const { participantIds, groupName } = req.body;
    const loggedInUserId = req.user._id;

    const group = await conversationService.createGroup({
      participantIds,
      groupName,
      loggedInUserId,
    });
    res.json({ success: true, data: group });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function addToGroup(req, res) {
  try {
    const { participantIds, groupId } = req.body;
    const group = await conversationService.addToGroup({
      participantIds,
      groupId,
    });

    if (!group) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found" });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    console.error("Error adding to group:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function getConversations(req, res) {
  try {
    const loggedInUserId = req.user._id;
    const conversations = await conversationService.getConversations({
      loggedInUserId,
    });

    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function getConversationUsers(req, res) {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    const users = await conversationService.getUsers({ conversationId });

    return res.status(200).json(users);
  } catch (err) {
    console.error("Error in getConversationUsers:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversation users",
      error: err.message,
    });
  }
}

module.exports = {
  createDM,
  createGroup,
  addToGroup,
  getConversations,
  getConversationUsers,
};
