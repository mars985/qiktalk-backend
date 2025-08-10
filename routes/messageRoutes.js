const express = require("express");
const router = express.Router();

const authenticate = require("./auth");
const Message = require("../models/messagemodel");
const Conversation = require("../models/conversationmodel");

router.get("/messages/:conversationId", authenticate, async (req, res) => {
  try {
    const conversation = await Conversation
      .findById(req.params.conversationId)
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "username _id",
        },
      });
    if (!conversation) return res.status(404).send("Conversation not found");

    res.json(conversation.messages);
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/sendMessage", async (req, res) => {
  try {
    const { message, conversationId, senderId } = req.body;

    if (!message || !conversationId || !senderId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a new message document
    const newMessage = new Message({
      sender: senderId,
      body: message,
    });

    await newMessage.save();

    // Find conversation and push message
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conversation.messages.push(newMessage._id);
    conversation.updatedAt = new Date();
    await conversation.save();
    // console.log(message);
    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// router.post("/createMessage", authenticate, async (req, res) => {
//   let { body } = req.body;
//   const sender = req.user._id;
//   let createdMsg = await message.create({
//     sender,
//     body,
//   });

//   res.send(createdMsg);
// });

// router.patch("/updateMessage", async (req, res) => {
//   let { messageid, body } = req.body;
//   const updatedMsg = await message.findOneAndUpdate(
//     { _id: messageid },
//     { body }
//   );

//   res.send(updatedMsg);
// });

// router.post("/deleteMessage", async (req, res) => {
//   let { Id } = req.body;
// const deletedMsg = await message.findoneAndDelete({ Id });
// res.send(deletedMsg);
// });

module.exports = router;
