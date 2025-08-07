const conversation = require("../models/conversationmodel");
const authenticate = require("./auth");

module.exports = function (app) {
  app.post("/createDM", authenticate, async (req, res) => {
    try {
      let { targetUserId } = req.body;
      const loggedInUserId = req.user._id;
      const existingDM = await conversation.findOne({
        type: "dm",
        participants: { $all: [loggedInUserId, targetUserId], $size: 2 },
      });

      if (existingDM) return res.send(existingDM);

      const newDM = await conversation.create({
        type: "dm",
        participants: [loggedInUserId, targetUserId],
        messages: [],
      });

      res.send(newDM);
    } catch (error) {
      console.error("Error creating DM:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/createGroup", authenticate, async (req, res) => {
    try {
      let { participantIds, groupName } = req.body;
      const loggedInUserId = req.user._id;

      const group = await conversation.create({
        participants: [...participantIds, loggedInUserId],
        type: "group",
        groupName,
        messages: [],
      });
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).send("Internal Server Error");
    }
    res.send(group);
  });

  app.post("/addToGroup", authenticate, async (req, res) => {
    try {
      let { participantIds, groupId } = req.body;

      const group = await conversation.findOne({
        _id: groupId,
        type: "group",
      });
      if (!group) {
        return res.status(404).send("Group not found");
      }

      group.participants.push(...participantIds);
      await group.save();
      const loggedInUserId = req.user._id;
      // TODO: push message "x added y to the group"
      group.updatedAt = new Date();

      // return open(group);
    } catch (error) {
      console.error("Error adding to group:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/getConversations", authenticate, async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
      const conversations = await conversation
        .find({
          participants: loggedInUserId,
        })
        .populate("participants")
        .populate("messages")
        .sort({ _id: -1 });

      res.send(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).send("Internal Server Error");
    }
  });
};
