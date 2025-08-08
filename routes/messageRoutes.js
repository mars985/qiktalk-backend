const express = require("express");
const router = express.Router();

const authenticate = require("./auth");
const message = require("../models/messagemodel");

router.post("/createMessage", authenticate, async (req, res) => {
  let { body } = req.body;
  const sender = req.user._id;
  let createdMsg = await message.create({
    sender,
    body,
  });

  res.send(createdMsg);
});

router.patch("/updateMessage", async (req, res) => {
  let { messageid, body } = req.body;
  const updatedMsg = await message.findOneAndUpdate(
    { _id: messageid },
    { body }
  );

  res.send(updatedMsg);
});

router.post("/deleteMessage", async (req, res) => {
  let { Id } = req.body;
  // const deletedMsg = await message.findoneAndDelete({ Id });
  // res.send(deletedMsg);
});

module.exports = router;
