const message = require("../models/messagemodel");
const { findOneAndUpdate } = require("../models/usermodel");
const authenticate = require("./auth");

module.exports = function (app) {
  app.post("/createMessage", authenticate, async (req, res) => {
    let { body } = req.body;
    const sender = req.user._id;
    let createdMsg = await message.create({
      sender,
      body,
    });

    res.send(createdMsg);
  });

  app.patch("/updateMessage", async (req, res) => {
    let { messageid, body } = req.body;
    const updatedMsg = await message.findOneAndUpdate(
      { _id: messageid },
      { body }
    );

    res.send(updatedMsg);
  });

  app.post("/deleteMessage", async (req, res) => {
    let { Id } = req.body;
    // const deletedMsg = await message.findoneAndDelete({ Id });
    // res.send(deletedMsg);
  });
};
