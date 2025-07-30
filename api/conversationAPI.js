const conversation = require("../models/conversationmodel");
const authenticate = require("./auth");

module.exports = function (app) {
  app.post("/createDM", authenticate, async (req, res) => {
    let { targetUserId } = req.body;
    const loggedInUserId = req.user._id;
    const existingDM = conversation.find({
      type: "dm",
      participants: { $all: [loggedInUserId, targetUserId], $size: 2 },
    });

    if (existingDM) return res.send(existingDM);

    const newDM = conversation.create({
      type: "dm",
      participants: [loggedInUserId, targetUserId],
      messages: [],
    });

    res.send(newDM);
  });

  app.post("/createGroup", authenticate, async (req, res) => {
    let { participantIds, groupName } = req.body;
    const loggedInUserId = req.user._id;

    const group = conversation.create({
      participants: [...participantIds, loggedInUserId],
      type: "group",
      groupName,
      messages: [],
    });

    return open(group);
  });

  app.post("/addToGroup", authenticate, async (req, res) => {
    let { participantIds, groupId } = req.body;
    const loggedInUserId = req.user._id;

    const group = conversation.findOne({
      _id: groupId,
      type: "group",
    });
    if (!group) {
      return res.status(404).send("Group not found");
    }

    group.participants.push(...participantIds);
    // TODO: push message "x added y to the group"
    group.updatedAt = new Date();

    return open(group);
  });

  app.get("/getConversations", authenticate, async (req, res) => {
    const loggedInUserId = req.user._id;
    const conversations = await conversation
      .find({
        participants: loggedInUserId,
      })
      .populate("participants")
      .populate("messages")
      .sort({ _id: -1 });

    res.send(conversations);
  });
};
